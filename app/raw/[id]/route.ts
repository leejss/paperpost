import { type NextRequest, NextResponse } from "next/server"
import { getDocumentById } from "@/lib/db/queries"
import { getDocumentContentFromR2 } from "@/lib/r2/operations"
import { CACHE_REVALIDATE_SECONDS } from "@/lib/utils/constants"

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

		const content = await getDocumentContentFromR2(doc.r2Key)

		return new NextResponse(content, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": `public, max-age=${CACHE_REVALIDATE_SECONDS}`,
			},
		})
	} catch (error) {
		console.error("Raw route error:", error)
		return new NextResponse("Internal Server Error", { status: 500 })
	}
}
