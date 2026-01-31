"use client"

import { ArrowLeft, Share } from "lucide-react"
import { useEffect, useState } from "react"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { Button } from "@/components/ui/button"
import { sanitizeSchema } from "@/lib/markdown/sanitize-config"

interface MarkdownPreviewProps {
	content: string
	onBack: () => void
	onShare: () => void
}

export function MarkdownPreview({ content, onBack, onShare }: MarkdownPreviewProps) {
	const [html, setHtml] = useState<string>("")
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const renderContent = async () => {
			setIsLoading(true)
			try {
				const result = await unified()
					.use(remarkParse)
					.use(remarkRehype)
					.use(rehypeSanitize, sanitizeSchema)
					.use(rehypeExternalLinks, {
						target: "_blank",
						rel: ["noopener", "noreferrer", "nofollow"],
					})
					.use(rehypeStringify)
					.process(content)

				setHtml(String(result))
			} catch (error) {
				console.error("Failed to render markdown:", error)
				setHtml("<p>렌더링 중 오류가 발생했습니다.</p>")
			} finally {
				setIsLoading(false)
			}
		}

		renderContent()
	}, [content])

	const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() || "제목 없음"

	return (
		<div className="min-h-screen bg-bg-default">
			{/* Fixed Header */}
			<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-default/80 backdrop-blur-sm border-b border-border-default">
				<Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					뒤로
				</Button>
				<Button onClick={onShare} size="sm" className="gap-2">
					<Share className="h-4 w-4" />
					Share
				</Button>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-4xl px-4 pt-20 pb-8">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-fg-muted">로딩 중...</div>
					</div>
				) : (
					<article
						className="prose dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				)}
			</div>
		</div>
	)
}
