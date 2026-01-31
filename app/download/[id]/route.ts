import { type NextRequest, NextResponse } from "next/server"
import { getDocumentById } from "@/lib/db/queries"
import { getMarkdownFromR2 } from "@/lib/r2/operations"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	try {
		const doc = await getDocumentById(id)

		if (!doc) {
			return new NextResponse("Not Found", { status: 404 })
		}

		if (doc.status !== "active") {
			return new NextResponse("Not Found", { status: 404 })
		}

		if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
			return new NextResponse("Gone", { status: 410 })
		}

		const markdown = await getMarkdownFromR2(doc.r2Key)
		const filename = `${id}.md`

		return new NextResponse(markdown, {
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
			},
		})
	} catch (error) {
		console.error("Download route error:", error)
		return new NextResponse("Internal Server Error", { status: 500 })
	}
}
