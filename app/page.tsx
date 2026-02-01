"use client"

import { useState } from "react"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { MarkdownPreview } from "@/components/preview/markdown-preview"
import { ShareDialog } from "@/components/share/share-dialog"
import { ThemeToggle } from "@/components/theme/theme-toggle"
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
		<div className="min-h-screen bg-bg-subtle">
			<div className="mx-auto max-w-4xl px-4 py-8">
				<header className="mb-8 flex items-start justify-between">
					<h1 className="text-2xl font-bold text-fg-default">Paperpost</h1>
					<ThemeToggle />
				</header>

				<main className="space-y-4">
					<MarkdownEditor value={content} onChange={setContent} />

					<div className="flex items-center justify-between">
						<div className="text-sm text-fg-muted">
							{(contentSizeBytes / 1024).toFixed(1)} KB / 1024 KB
							{isOverLimit && <span className="ml-2 text-error-fg">크기 초과</span>}
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleEnterPreview}
								disabled={isEmpty || isOverLimit}
								variant="secondary"
								size="lg"
							>
								Preview
							</Button>
						</div>
					</div>

					{error && <div className="rounded-sm bg-error-bg p-4 text-error-fg text-sm">{error}</div>}
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
		</div>
	)
}
