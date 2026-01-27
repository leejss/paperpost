import type { ExpiryOption } from "@/lib/utils/constants"

export interface CreateDocResult {
	id: string
	viewUrl: string
	putUrl: string
	r2Key: string
	ownerToken: string
}

export interface ShareOptions {
	expiresIn: ExpiryOption
	visibility: "public" | "unlisted"
}

export interface DocumentMeta {
	id: string
	title: string | null
	visibility: "public" | "unlisted" | "password"
	status: "pending" | "active" | "deleted" | "blocked"
	expiresAt: Date | null
	createdAt: Date
}
