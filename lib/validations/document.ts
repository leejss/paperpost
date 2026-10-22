import { z } from "zod"
import { getMaxDocumentSizeBytes } from "@/lib/utils/constants"

const documentOptionsSchema = z.object({
	format: z.enum(["markdown", "html"]).default("markdown"),
	expiresIn: z.enum(["1d", "7d", "30d", "permanent"]).default("7d"),
	visibility: z.enum(["public", "unlisted"]).default("unlisted"),
})

export const createDocSchema = documentOptionsSchema
	.extend({
		content: z
			.string()
			.min(1, "내용을 입력해주세요")
			.refine((val) => val.trim().length > 0, "내용을 입력해주세요"),
	})
	.superRefine((value, context) => {
		const maxSize = getMaxDocumentSizeBytes(value.format)
		if (new TextEncoder().encode(value.content).length > maxSize) {
			context.addIssue({
				code: "custom",
				path: ["content"],
				message: `파일 크기가 ${maxSize / 1024 / 1024}MB를 초과합니다`,
			})
		}
	})

export const createUploadSchema = documentOptionsSchema
	.extend({
		sizeBytes: z.number().int().positive("내용을 입력해주세요"),
	})
	.superRefine((value, context) => {
		const maxSize = getMaxDocumentSizeBytes(value.format)
		if (value.sizeBytes > maxSize) {
			context.addIssue({
				code: "custom",
				path: ["sizeBytes"],
				message: `파일 크기가 ${maxSize / 1024 / 1024}MB를 초과합니다`,
			})
		}
	})

export type CreateDocInput = z.infer<typeof createDocSchema>

export const confirmUploadSchema = z.object({
	id: z.string().min(1),
	ownerToken: z.string().min(1),
})

export const deleteDocSchema = z.object({
	id: z.string().min(1),
	ownerToken: z.string().min(1).optional(),
})
