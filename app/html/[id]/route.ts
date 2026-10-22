import { type NextRequest, NextResponse } from "next/server"
import { getDocumentById } from "@/lib/db/queries"
import { getDocumentFormat } from "@/lib/documents/format"
import { HTML_PREVIEW_CSP } from "@/lib/html/preview"
import { createHtmlPreviewStream } from "@/lib/html/stream"
import { getDocumentStreamFromR2 } from "@/lib/r2/operations"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	try {
		const doc = await getDocumentById(id)
		if (!doc || doc.status !== "active" || getDocumentFormat(doc.r2Key) !== "html") {
			return new NextResponse("Not Found", { status: 404 })
		}
		if (doc.expiresAt && doc.expiresAt <= new Date()) {
			return new NextResponse("Gone", { status: 410 })
		}
		const source = await getDocumentStreamFromR2(doc.r2Key)
		return new NextResponse(createHtmlPreviewStream(source), {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				// Preserve isolation when this address is opened outside its iframe.
				"Content-Security-Policy": `sandbox allow-scripts; ${HTML_PREVIEW_CSP}`,
				"Cache-Control": "private, no-store",
			},
		})
	} catch (error) {
		console.error("HTML route error:", error)
		return new NextResponse("Internal Server Error", { status: 500 })
	}
}
