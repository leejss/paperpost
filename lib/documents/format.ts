export type DocumentFormat = "markdown" | "html"

// The stored key identifies the format without changing existing document rows.
export function getDocumentFormat(r2Key: string): DocumentFormat {
	return r2Key.endsWith(".html") ? "html" : "markdown"
}

export function getDocumentContentType(format: DocumentFormat): string {
	return format === "html" ? "text/html" : "text/markdown"
}
