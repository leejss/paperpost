import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
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

const DEFAULT_PAGE_TITLE = "PaperPost"
const SHARED_DOC_DESCRIPTION = "PaperPost로 공유된 문서입니다."

const getDocumentByIdCached = cache(getDocumentById)
const getMarkdownFromR2Cached = cache(getMarkdownFromR2)

function toPlainTitleText(raw: string): string {
	return raw
		.replace(/\[(.*?)\]\(.*?\)/g, "$1")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/[*_~]/g, "")
		.replace(/\s+/g, " ")
		.trim()
}

function stripFencedCodeBlocks(markdown: string): string {
	return markdown.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "")
}

function getAtxHeadingText(line: string): string | null {
	const atxMatch = line.match(/^#\s+(.+?)(?:\s+#+)?$/)
	if (!atxMatch?.[1]) {
		return null
	}

	const title = toPlainTitleText(atxMatch[1])
	return title.length > 0 ? title : null
}

function getSetextHeadingText(line: string, nextLine: string): string | null {
	if (!/^=+$/.test(nextLine)) {
		return null
	}

	const title = toPlainTitleText(line)
	return title.length > 0 ? title : null
}

function extractDocumentTitle(markdown: string): string | null {
	const lines = stripFencedCodeBlocks(markdown).split(/\r?\n/)

	for (let index = 0; index < lines.length; index += 1) {
		const trimmed = lines[index].trim()
		if (trimmed.length === 0) {
			continue
		}

		const atxTitle = getAtxHeadingText(trimmed)
		if (atxTitle) {
			return atxTitle
		}

		const nextLine = lines[index + 1]?.trim() ?? ""
		const setextTitle = getSetextHeadingText(trimmed, nextLine)
		if (setextTitle) {
			return setextTitle
		}
	}

	return null
}

interface DocumentPageProps {
	params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
	const { id } = await params
	const doc = await getDocumentByIdCached(id)

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
		const markdown = await getMarkdownFromR2Cached(doc.r2Key)
		const html = await renderMarkdown(markdown)
		return <DocumentViewer html={html} document={doc} />
	} catch (error) {
		console.error("Failed to render document:", error)
		notFound()
	}
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
	const { id } = await params
	const doc = await getDocumentByIdCached(id)

	if (!doc || doc.status !== "active") {
		return {
			title: `문서를 찾을 수 없음 - ${DEFAULT_PAGE_TITLE}`,
		}
	}

	try {
		const markdown = await getMarkdownFromR2Cached(doc.r2Key)
		const title = extractDocumentTitle(markdown)

		return {
			title: title ? `${title} - ${DEFAULT_PAGE_TITLE}` : DEFAULT_PAGE_TITLE,
			description: SHARED_DOC_DESCRIPTION,
		}
	} catch {
		return {
			title: DEFAULT_PAGE_TITLE,
			description: SHARED_DOC_DESCRIPTION,
		}
	}
}
