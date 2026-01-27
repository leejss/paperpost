"use client"

import { useState } from "react"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { ShareDialog } from "@/components/share/share-dialog"
import { Button } from "@/components/ui/button"
import { type ExpiryOption, MAX_FILE_SIZE_BYTES } from "@/lib/utils/constants"
import type { CreateDocResult } from "@/types/document"
import { confirmUploadAction, createDocAction } from "./actions"

export default function EditorPage() {
	const [content, setContent] = useState("")
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
			// 1. createDocAction 호출
			const createResult = await createDocAction({
				content,
				expiresIn: options.expiresIn,
				visibility: options.visibility,
			})

			if (!createResult.success) {
				throw new Error(createResult.error)
			}

			// 2. R2에 직접 업로드
			const uploadResponse = await fetch(createResult.data.putUrl, {
				method: "PUT",
				body: content,
				headers: {
					"Content-Type": "text/markdown",
				},
			})

			if (!uploadResponse.ok) {
				throw new Error("파일 업로드에 실패했습니다")
			}

			// 3. confirmUploadAction 호출
			const confirmResult = await confirmUploadAction(createResult.data.id)

			if (!confirmResult.success) {
				throw new Error(confirmResult.error)
			}

			setShareResult(createResult.data)
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
		}
	}

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
			<div className="mx-auto max-w-4xl px-4 py-8">
				<header className="mb-8">
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Markdown Share</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						마크다운을 작성하고 공유 링크를 생성하세요
					</p>
				</header>

				<main className="space-y-4">
					<MarkdownEditor value={content} onChange={setContent} />

					<div className="flex items-center justify-between">
						<div className="text-sm text-zinc-500">
							{(contentSizeBytes / 1024).toFixed(1)} KB / 1024 KB
							{isOverLimit && <span className="ml-2 text-red-500">크기 초과</span>}
						</div>

						<Button onClick={handleOpenDialog} disabled={isEmpty || isOverLimit} size="lg">
							Share
						</Button>
					</div>

					{error && (
						<div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 text-sm">
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
				/>
			</div>
		</div>
	)
}
