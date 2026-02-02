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
		<div className="min-h-screen bg-bg-subtle flex flex-col items-center">
			<header className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-bg-subtle/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-subtle/60">
				<div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6 transition-all duration-500 ease-in-out">
					<Button
						variant="ghost"
						size="sm"
						onClick={onBack}
						className="gap-2 text-fg-muted hover:text-fg-default transition-colors -ml-2"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="font-medium">Back</span>
					</Button>

					{/* Optional: Title could go here if we extracted it, for now keeping it clean or adding a subtle 'Preview' label */}
					<div className="text-sm font-medium text-fg-subtle opacity-50">Preview</div>

					<Button
						onClick={onShare}
						size="sm"
						className="gap-2 rounded-full px-4 font-medium shadow-sm hover:shadow transition-all"
					>
						<Share className="h-3.5 w-3.5" />
						Share
					</Button>
				</div>
			</header>

			<main className="w-full max-w-3xl flex-1 px-6 py-12 md:py-20 transition-all duration-500">
				{isLoading ? (
					<div className="mx-auto max-w-2xl py-12 space-y-8 animate-pulse">
						<div className="h-8 w-3/4 bg-bg-emphasis/50 rounded-lg"></div>
						<div className="space-y-4">
							<div className="h-4 w-full bg-bg-emphasis/30 rounded"></div>
							<div className="h-4 w-5/6 bg-bg-emphasis/30 rounded"></div>
							<div className="h-4 w-full bg-bg-emphasis/30 rounded"></div>
						</div>
					</div>
				) : (
					<div className="mx-auto max-w-2xl">
						<article
							className="prose max-w-none prose-headings:font-semibold prose-a:text-primary-default prose-img:rounded-xl text-fg-default prose-headings:text-fg-default prose-p:text-fg-default prose-strong:text-fg-default prose-ul:text-fg-default prose-ol:text-fg-default"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				)}
			</main>
		</div>
	)
}
