"use client"

import { AlertCircle, Check, Copy, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { DEFAULT_EXPIRY, type ExpiryOption } from "@/lib/utils/constants"
import type { CreateDocResult } from "@/types/document"
import { ExpirySelector } from "./expiry-selector"

interface ShareDialogProps {
	open: boolean
	onClose: () => void
	onShare: (options: {
		expiresIn: ExpiryOption
		visibility: "public" | "unlisted"
	}) => Promise<void>
	isLoading: boolean
	result: CreateDocResult | null
	error: string | null
}

export function ShareDialog({
	open,
	onClose,
	onShare,
	isLoading,
	result,
	error,
}: ShareDialogProps) {
	const [expiresIn, setExpiresIn] = useState<ExpiryOption>(DEFAULT_EXPIRY)
	const [copied, setCopied] = useState(false)
	const [ownerTokenCopied, setOwnerTokenCopied] = useState(false)

	const handleShare = async () => {
		await onShare({ expiresIn, visibility: "unlisted" })
	}

	const handleCopyLink = async () => {
		if (result?.viewUrl) {
			await navigator.clipboard.writeText(result.viewUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	const handleCopyOwnerToken = async () => {
		if (result?.ownerToken) {
			await navigator.clipboard.writeText(result.ownerToken)
			setOwnerTokenCopied(true)
			setTimeout(() => setOwnerTokenCopied(false), 2000)
		}
	}

	const handleClose = () => {
		setCopied(false)
		setOwnerTokenCopied(false)
		onClose()
	}

	return (
		<Dialog open={open} onClose={handleClose} title={result ? "공유 완료" : "문서 공유"}>
			{result ? (
				<div className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="share-link" className="text-sm font-medium text-fg-subtle">
							공유 링크
						</label>
						<div className="flex gap-2">
							<input
								id="share-link"
								type="text"
								readOnly
								value={result.viewUrl}
								className="flex-1 h-10 px-3 rounded-sm border border-border-default bg-bg-subtle text-sm text-fg-default"
							/>
							<Button onClick={handleCopyLink} variant="secondary">
								{copied ? (
									<>
										<Check className="w-4 h-4 mr-2" />
										복사됨
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-2" />
										복사
									</>
								)}
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="owner-token" className="text-sm font-medium text-fg-subtle">
							삭제 토큰 (안전한 곳에 보관하세요)
						</label>
						<div className="flex gap-2">
							<input
								id="owner-token"
								type="text"
								readOnly
								value={result.ownerToken}
								className="flex-1 h-10 px-3 rounded-sm border border-border-default bg-bg-subtle text-sm font-mono text-fg-default"
							/>
							<Button onClick={handleCopyOwnerToken} variant="secondary">
								{ownerTokenCopied ? (
									<>
										<Check className="w-4 h-4 mr-2" />
										복사됨
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-2" />
										복사
									</>
								)}
							</Button>
						</div>
						<p className="text-xs text-fg-muted">
							이 토큰을 사용해 나중에 문서를 삭제할 수 있습니다.
						</p>
					</div>

					<div className="flex justify-end pt-2">
						<Button onClick={handleClose}>닫기</Button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{error && (
						<div className="flex items-start gap-3 p-4 rounded-lg bg-danger-subtle border border-danger-default">
							<AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-danger">공유 실패</p>
								<p className="text-sm text-danger-subtle mt-1">{error}</p>
							</div>
						</div>
					)}

					<ExpirySelector value={expiresIn} onChange={setExpiresIn} />

					<div className="flex justify-end gap-2 pt-2">
						<Button variant="ghost" onClick={handleClose} disabled={isLoading}>
							취소
						</Button>
						<Button onClick={handleShare} disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									공유 중...
								</>
							) : (
								"공유하기"
							)}
						</Button>
					</div>
				</div>
			)}
		</Dialog>
	)
}
