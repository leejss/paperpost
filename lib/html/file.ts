import { MAX_FILE_SIZE_BYTES } from "@/lib/utils/constants"

export async function readHtmlFile(file: File): Promise<string> {
	if (!/\.html?$/i.test(file.name)) {
		throw new Error(".html 또는 .htm 파일을 선택해주세요.")
	}
	if (file.size > MAX_FILE_SIZE_BYTES) {
		throw new Error("파일 크기는 1MB 이하여야 합니다.")
	}

	let content: string
	try {
		content = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer())
	} catch {
		throw new Error("파일을 읽을 수 없습니다. UTF-8 형식의 HTML 파일을 선택해주세요.")
	}
	if (!content.trim()) {
		throw new Error("내용이 비어 있는 파일입니다.")
	}
	return content
}
