"use client"

import { FileText } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { MarkdownPreview } from "@/components/preview/markdown-preview"
import { ShareDialog } from "@/components/share/share-dialog"
import { Button } from "@/components/ui/button"
import { type ExpiryOption, MAX_FILE_SIZE_BYTES } from "@/lib/utils/constants"
import type { CreateDocResult } from "@/types/document"
import { createAndUploadDocAction } from "./actions"

type ViewMode = "edit" | "preview"

export default function EditorPage() {
	const [content, setContent] = useState("")
	const [viewMode, setViewMode] = useState<ViewMode>("edit")
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isSharing, setIsSharing] = useState(false)
	const [shareResult, setShareResult] = useState<CreateDocResult | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isSignedIn, setIsSignedIn] = useState(false)
	const [isAuthLoaded, setIsAuthLoaded] = useState(false)

	const contentSizeBytes = new TextEncoder().encode(content).length
	const isOverLimit = contentSizeBytes > MAX_FILE_SIZE_BYTES
	const isEmpty = content.trim().length === 0

	const handleShare = async (options: {
		expiresIn: ExpiryOption
		visibility: "public" | "unlisted"
	}) => {
		setIsSharing(true)
		setError(null)

		try {
			const result = await createAndUploadDocAction({
				content,
				expiresIn: options.expiresIn,
				visibility: options.visibility,
			})

			if (!result.success) {
				throw new Error(result.error)
			}

			setShareResult(result.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "공유에 실패했습니다")
		} finally {
			setIsSharing(false)
		}
	}

	const handleOpenDialog = () => {
		setShareResult(null)
		setError(null)
		setIsDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setIsDialogOpen(false)
		if (shareResult) {
			setContent("")
			setShareResult(null)
			setViewMode("edit")
		}
	}

	const handleEnterPreview = () => {
		setViewMode("preview")
	}

	const handleExitPreview = () => {
		setViewMode("edit")
	}

	useEffect(() => {
		let isMounted = true

		const init = async () => {
			try {
				const response = await fetch("/api/auth/me", { cache: "no-store" })
				const data = (await response.json()) as { authenticated: boolean }

				if (!isMounted) {
					return
				}

				setIsSignedIn(data.authenticated)
			} finally {
				if (isMounted) {
					setIsAuthLoaded(true)
				}
			}
		}

		init()

		return () => {
			isMounted = false
		}
	}, [])

	if (viewMode === "preview") {
		return (
			<>
				<MarkdownPreview content={content} onBack={handleExitPreview} onShare={handleOpenDialog} />
				<ShareDialog
					open={isDialogOpen}
					onClose={handleCloseDialog}
					onShare={handleShare}
					isLoading={isSharing}
					result={shareResult}
					error={error}
				/>
			</>
		)
	}

	return (
		<div className="min-h-screen bg-bg-subtle flex flex-col items-center">
			<header className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-bg-subtle/80 backdrop-blur-xl supports-backdrop-filter:bg-bg-subtle/60">
				<div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6 transition-all duration-500 ease-in-out">
					<h1 className="text-lg font-semibold tracking-tight text-fg-default opacity-90 transition-opacity hover:opacity-60 cursor-default select-none">
						Paperpost
					</h1>
					<div className="flex items-center gap-2">
						{isAuthLoaded && !isSignedIn ? (
							<Link href="/login?next=/my-docs">
								<Button variant="ghost" size="sm">
									로그인
								</Button>
							</Link>
						) : null}
						{isSignedIn ? (
							<Link href="/my-docs">
								<Button variant="ghost" size="sm" className="gap-2">
									<FileText className="w-4 h-4" />내 문서
								</Button>
							</Link>
						) : null}
					</div>
				</div>
			</header>

			<main className="w-full max-w-3xl flex-1 px-2 pl-6 md:py-10 transition-all duration-500">
				<div>
					<MarkdownEditor value={content} onChange={setContent} />
				</div>

				{/* Floating Action Bar */}
				<div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 transform transition-all duration-500 ease-out">
					<div className="flex items-center gap-3 rounded-full border border-border-default/40 bg-bg-default/70 p-1.5 pl-5 pr-1.5 backdrop-blur-2xl transition-all duration-300 hover:bg-bg-default/90 ring-1 ring-black/5 dark:ring-white/10">
						<div className="text-xs font-medium text-fg-muted tabular-nums tracking-wide">
							{(contentSizeBytes / 1024).toFixed(1)}{" "}
							<span className="text-fg-subtle text-[10px] uppercase">KB</span>
							{isOverLimit && <span className="ml-2 font-semibold text-error-fg">Exceeded</span>}
						</div>
						<div className="h-3 w-px bg-border-default/60" />
						<Button
							onClick={handleEnterPreview}
							disabled={isEmpty || isOverLimit}
							variant="ghost"
							size="sm"
							className="h-8 rounded-full px-4 text-xs font-medium hover:bg-bg-emphasis/50 hover:text-fg-default transition-colors"
						>
							Preview
						</Button>
					</div>
				</div>

				{error && (
					<div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-error-bg px-4 py-2 text-sm font-medium text-error-fg shadow-lg">
						{error}
					</div>
				)}
			</main>

			<ShareDialog
				open={isDialogOpen}
				onClose={handleCloseDialog}
				onShare={handleShare}
				isLoading={isSharing}
				result={shareResult}
				error={error}
			/>
		</div>
	)
}
