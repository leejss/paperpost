import type { DocumentFormat } from "@/lib/documents/format"

export function getR2Key(docId: string, format: DocumentFormat = "markdown"): string {
	return `docs/${docId}.${format === "html" ? "html" : "md"}`
}
