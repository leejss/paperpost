"use server"

import { getCurrentUserId } from "@/lib/auth/current-user"
import { generateOwnerToken, hashOwnerToken, verifyOwnerToken } from "@/lib/auth/owner-token"
import { createDocument, getDocumentById, updateDocumentStatus } from "@/lib/db/queries"
import {
	type DocumentFormat,
	getDocumentContentType,
	getDocumentFormat,
} from "@/lib/documents/format"
import { deleteObject, headObject, uploadObject } from "@/lib/r2/operations"
import { createPresignedUploadUrl, getR2Key } from "@/lib/r2/presign"
import { type ExpiryOption, getExpiresAt, getMaxDocumentSizeBytes } from "@/lib/utils/constants"
import { generateDocId } from "@/lib/utils/id"
import {
	confirmUploadSchema,
	createDocSchema,
	createUploadSchema,
	deleteDocSchema,
} from "@/lib/validations/document"
import type { CreateDocResult } from "@/types/document"

interface CreateDocActionInput {
	content: string
	format?: DocumentFormat
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}

export async function createDocAction(
	input: CreateDocActionInput
): Promise<{ success: true; data: CreateDocResult } | { success: false; error: string }> {
	try {
		const validated = createDocSchema.parse(input)

		const docId = generateDocId()
		const r2Key = getR2Key(docId, validated.format)
		const ownerToken = generateOwnerToken()
		const ownerTokenHash = hashOwnerToken(ownerToken)
		const expiresAt = getExpiresAt(validated.expiresIn)
		const sizeBytes = new TextEncoder().encode(validated.content).length
		const userId = await getCurrentUserId()

		await createDocument({
			id: docId,
			r2Key,
			userId,
			visibility: validated.visibility,
			passwordHash: null,
			expiresAt,
			ownerTokenHash,
			status: "pending",
			sizeBytes,
		})

		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

		return {
			success: true,
			data: {
				id: docId,
				viewUrl: `${appUrl}/d/${docId}`,
				ownerToken,
			},
		}
	} catch (error) {
		console.error("createDocAction error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "문서 생성에 실패했습니다",
		}
	}
}

export async function createUploadDocAction(input: {
	sizeBytes: number
	format: DocumentFormat
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}): Promise<
	| { success: true; data: CreateDocResult & { uploadUrl: string } }
	| { success: false; error: string }
> {
	try {
		const validated = createUploadSchema.parse(input)
		const id = generateDocId()
		const r2Key = getR2Key(id, validated.format)
		const ownerToken = generateOwnerToken()
		const uploadUrl = await createPresignedUploadUrl(r2Key, validated.sizeBytes, validated.format)
		await createDocument({
			id,
			r2Key,
			userId: await getCurrentUserId(),
			visibility: validated.visibility,
			passwordHash: null,
			expiresAt: getExpiresAt(validated.expiresIn),
			ownerTokenHash: hashOwnerToken(ownerToken),
			status: "pending",
			sizeBytes: validated.sizeBytes,
		})
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
		return { success: true, data: { id, viewUrl: `${appUrl}/d/${id}`, ownerToken, uploadUrl } }
	} catch (error) {
		console.error("createUploadDocAction error:", error)
		return { success: false, error: "업로드를 준비하지 못했습니다. 잠시 후 다시 시도해주세요." }
	}
}

export async function confirmUploadAction(
	id: string,
	ownerToken: string
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		confirmUploadSchema.parse({ id, ownerToken })

		const doc = await getDocumentById(id)
		if (!doc) {
			return { success: false, error: "문서를 찾을 수 없습니다" }
		}

		if (!verifyOwnerToken(ownerToken, doc.ownerTokenHash)) {
			return { success: false, error: "권한이 없습니다" }
		}
		if (doc.expiresAt && doc.expiresAt <= new Date()) {
			return { success: false, error: "만료된 문서입니다" }
		}
		if (doc.status === "active") return { success: true }
		if (doc.status !== "pending") {
			return { success: false, error: "이미 처리된 문서입니다" }
		}

		const object = await headObject(doc.r2Key)
		if (!object) {
			return { success: false, error: "업로드된 파일을 찾을 수 없습니다" }
		}
		const format = getDocumentFormat(doc.r2Key)
		if (
			object.sizeBytes !== doc.sizeBytes ||
			doc.sizeBytes > getMaxDocumentSizeBytes(format) ||
			object.contentType?.split(";")[0] !== getDocumentContentType(format)
		) {
			return { success: false, error: "업로드된 파일의 크기 또는 형식이 일치하지 않습니다" }
		}

		await updateDocumentStatus(id, "active")

		return { success: true }
	} catch (error) {
		console.error("confirmUploadAction error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "업로드 확인에 실패했습니다",
		}
	}
}

export async function deleteDocAction(
	id: string,
	ownerToken?: string
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		deleteDocSchema.parse({ id, ownerToken })

		const doc = await getDocumentById(id)
		if (!doc) {
			return { success: false, error: "문서를 찾을 수 없습니다" }
		}

		if (doc.status === "deleted") {
			return { success: false, error: "이미 삭제된 문서입니다" }
		}

		const userId = await getCurrentUserId()

		if (doc.userId) {
			if (!userId || userId !== doc.userId) {
				return { success: false, error: "권한이 없습니다" }
			}
		} else {
			if (!ownerToken) {
				return { success: false, error: "권한이 없습니다" }
			}

			const isValid = verifyOwnerToken(ownerToken, doc.ownerTokenHash)
			if (!isValid) {
				return { success: false, error: "권한이 없습니다" }
			}
		}

		await deleteObject(doc.r2Key)
		await updateDocumentStatus(id, "deleted")

		return { success: true }
	} catch (error) {
		console.error("deleteDocAction error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "문서 삭제에 실패했습니다",
		}
	}
}

interface CreateAndUploadDocInput {
	content: string
	format?: DocumentFormat
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}

export async function createAndUploadDocAction(
	input: CreateAndUploadDocInput
): Promise<{ success: true; data: CreateDocResult } | { success: false; error: string }> {
	try {
		const validated = createDocSchema.parse(input)

		const docId = generateDocId()
		const r2Key = getR2Key(docId, validated.format)
		const ownerToken = generateOwnerToken()
		const ownerTokenHash = hashOwnerToken(ownerToken)
		const expiresAt = getExpiresAt(validated.expiresIn)
		const sizeBytes = new TextEncoder().encode(validated.content).length
		const userId = await getCurrentUserId()

		await createDocument({
			id: docId,
			r2Key,
			userId,
			visibility: validated.visibility,
			passwordHash: null,
			expiresAt,
			ownerTokenHash,
			status: "pending",
			sizeBytes,
		})

		await uploadObject(r2Key, validated.content, validated.format)

		await updateDocumentStatus(docId, "active")

		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

		return {
			success: true,
			data: {
				id: docId,
				viewUrl: `${appUrl}/d/${docId}`,
				ownerToken,
			},
		}
	} catch (error) {
		console.error("createAndUploadDocAction error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "문서 생성 및 업로드에 실패했습니다",
		}
	}
}
