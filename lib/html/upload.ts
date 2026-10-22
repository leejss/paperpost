import { confirmUploadAction, createUploadDocAction } from "@/app/actions"
import type { ExpiryOption } from "@/lib/utils/constants"
import type { CreateDocResult } from "@/types/document"

export async function uploadHtmlDocument(
	content: string,
	options: {
		expiresIn: ExpiryOption
		visibility: "public" | "unlisted"
	}
): Promise<CreateDocResult> {
	const body = new Blob([content], { type: "text/html" })
	const prepared = await createUploadDocAction({ sizeBytes: body.size, format: "html", ...options })
	if (!prepared.success) throw new Error(prepared.error)
	let response: Response
	try {
		response = await fetch(prepared.data.uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": "text/html", "If-None-Match": "*" },
			body,
		})
	} catch {
		throw new Error("파일을 업로드하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해주세요.")
	}
	if (!response.ok) throw new Error("파일을 업로드하지 못했습니다. 다시 시도해주세요.")
	const confirmed = await confirmUploadAction(prepared.data.id, prepared.data.ownerToken)
	if (!confirmed.success) throw new Error(confirmed.error)
	return {
		id: prepared.data.id,
		viewUrl: prepared.data.viewUrl,
		ownerToken: prepared.data.ownerToken,
	}
}
