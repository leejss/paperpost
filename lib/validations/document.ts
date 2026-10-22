import { z } from "zod"
import { MAX_FILE_SIZE_BYTES } from "@/lib/utils/constants"

export const createDocSchema = z.object({
	content: z
		.string()
		.min(1, "내용을 입력해주세요")
		.refine((val) => val.trim().length > 0, "내용을 입력해주세요")
		.refine(
			(val) => new TextEncoder().encode(val).length <= MAX_FILE_SIZE_BYTES,
			`파일 크기가 1MB를 초과합니다`
		),
	format: z.enum(["markdown", "html"]).default("markdown"),
	expiresIn: z.enum(["1d", "7d", "30d", "permanent"]).default("7d"),
	visibility: z.enum(["public", "unlisted"]).default("unlisted"),
})

export type CreateDocInput = z.infer<typeof createDocSchema>

export const confirmUploadSchema = z.object({
	id: z.string().min(1),
})

export const deleteDocSchema = z.object({
	id: z.string().min(1),
	ownerToken: z.string().min(1).optional(),
})
