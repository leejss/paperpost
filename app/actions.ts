"use server"

import { generateOwnerToken, hashOwnerToken, verifyOwnerToken } from "@/lib/auth/owner-token"
import { createDocument, getDocumentById, updateDocumentStatus } from "@/lib/db/queries"
import { deleteObject, headObject, uploadObject } from "@/lib/r2/operations"
import { getR2Key } from "@/lib/r2/presign"
import { type ExpiryOption, getExpiresAt } from "@/lib/utils/constants"
import { generateDocId } from "@/lib/utils/id"
import { confirmUploadSchema, createDocSchema, deleteDocSchema } from "@/lib/validations/document"
import type { CreateDocResult } from "@/types/document"

interface CreateDocActionInput {
	content: string
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}

export async function createDocAction(
	input: CreateDocActionInput
): Promise<{ success: true; data: CreateDocResult } | { success: false; error: string }> {
	try {
		const validated = createDocSchema.parse(input)

		const docId = generateDocId()
		const r2Key = getR2Key(docId)
		const ownerToken = generateOwnerToken()
		const ownerTokenHash = hashOwnerToken(ownerToken)
		const expiresAt = getExpiresAt(validated.expiresIn)
		const sizeBytes = new TextEncoder().encode(validated.content).length

		await createDocument({
			id: docId,
			r2Key,
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

export async function confirmUploadAction(
	id: string
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		confirmUploadSchema.parse({ id })

		const doc = await getDocumentById(id)
		if (!doc) {
			return { success: false, error: "문서를 찾을 수 없습니다" }
		}

		if (doc.status !== "pending") {
			return { success: false, error: "이미 처리된 문서입니다" }
		}

		const exists = await headObject(doc.r2Key)
		if (!exists) {
			return { success: false, error: "업로드된 파일을 찾을 수 없습니다" }
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
	ownerToken: string
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

		const isValid = verifyOwnerToken(ownerToken, doc.ownerTokenHash)
		if (!isValid) {
			return { success: false, error: "권한이 없습니다" }
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
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}

export async function createAndUploadDocAction(
	input: CreateAndUploadDocInput
): Promise<{ success: true; data: CreateDocResult } | { success: false; error: string }> {
	try {
		const validated = createDocSchema.parse(input)

		const docId = generateDocId()
		const r2Key = getR2Key(docId)
		const ownerToken = generateOwnerToken()
		const ownerTokenHash = hashOwnerToken(ownerToken)
		const expiresAt = getExpiresAt(validated.expiresIn)
		const sizeBytes = new TextEncoder().encode(validated.content).length

		await createDocument({
			id: docId,
			r2Key,
			visibility: validated.visibility,
			passwordHash: null,
			expiresAt,
			ownerTokenHash,
			status: "pending",
			sizeBytes,
		})

		await uploadObject(r2Key, validated.content)

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
