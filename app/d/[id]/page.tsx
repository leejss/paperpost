import { notFound } from "next/navigation"
import { DocumentViewer } from "@/components/document/document-viewer"
import {
	BlockedView,
	DeletedView,
	ExpiredView,
	PendingView,
} from "@/components/document/status-pages"
import { getDocumentById } from "@/lib/db/queries"
import { renderMarkdown } from "@/lib/markdown/renderer"
import { getMarkdownFromR2 } from "@/lib/r2/operations"

export const revalidate = 300 // 5분

interface DocumentPageProps {
	params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
	const { id } = await params
	const doc = await getDocumentById(id)

	if (!doc) {
		notFound()
	}

	if (doc.status === "pending") {
		return <PendingView />
	}

	if (doc.status === "deleted") {
		return <DeletedView />
	}

	if (doc.status === "blocked") {
		return <BlockedView />
	}

	if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
		return <ExpiredView />
	}

	try {
		const markdown = await getMarkdownFromR2(doc.r2Key)
		const html = await renderMarkdown(markdown)

		return <DocumentViewer html={html} document={doc} />
	} catch (error) {
		console.error("Failed to render document:", error)
		notFound()
	}
}

export async function generateMetadata({ params }: DocumentPageProps) {
	const { id } = await params
	const doc = await getDocumentById(id)

	if (!doc || doc.status !== "active") {
		return {
			title: "문서를 찾을 수 없음 - Markdown Share",
		}
	}

	return {
		title: doc.title ? `${doc.title} - Markdown Share` : "Markdown Share",
		description: "Markdown Share로 공유된 문서입니다.",
	}
}
