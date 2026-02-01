"use client"

import { AlertCircle, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteDocAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

interface DeleteDialogProps {
	documentId: string
}

export function DeleteDialog({ documentId }: DeleteDialogProps) {
	const [open, setOpen] = useState(false)
	const [ownerToken, setOwnerToken] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleOpen = () => {
		setOpen(true)
		setError(null)
		setOwnerToken("")
	}

	const handleClose = () => {
		if (!isLoading) {
			setOpen(false)
			setError(null)
			setOwnerToken("")
		}
	}

	const handleDelete = async () => {
		if (!ownerToken.trim()) {
			setError("삭제 토큰을 입력해주세요")
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const result = await deleteDocAction(documentId, ownerToken.trim())

			if (result.success) {
				setOpen(false)
				router.push("/")
			} else {
				setError(result.error)
			}
		} catch {
			setError("문서 삭제 중 오류가 발생했습니다")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={handleOpen}
				className="inline-flex h-9 items-center justify-center rounded-sm border border-danger-default px-3 text-sm font-medium text-danger hover:bg-danger-subtle transition-colors"
				title="문서 삭제"
			>
				<Trash2 className="w-4 h-4 mr-2" />
				Delete
			</button>

			<Dialog open={open} onClose={handleClose} title="문서 삭제">
				<div className="space-y-4">
					<p className="text-sm text-fg-subtle">
						문서를 삭제하려면 삭제 토큰을 입력하세요. 이 작업은 되돌릴 수 없습니다.
					</p>

					{error && (
						<div className="flex items-start gap-3 p-4 rounded-lg bg-danger-subtle border border-danger-default">
							<AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-danger">삭제 실패</p>
								<p className="text-sm text-danger-subtle mt-1">{error}</p>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="delete-token" className="text-sm font-medium text-fg-subtle">
							삭제 토큰
						</label>
						<input
							id="delete-token"
							type="text"
							value={ownerToken}
							onChange={(e) => setOwnerToken(e.target.value)}
							placeholder="삭제 토큰을 입력하세요"
							className="w-full h-10 px-3 rounded-sm border border-border-default bg-bg-default text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent-default"
							disabled={isLoading}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button variant="ghost" onClick={handleClose} disabled={isLoading}>
							취소
						</Button>
						<Button
							onClick={handleDelete}
							disabled={isLoading || !ownerToken.trim()}
							className="bg-danger text-danger-fg hover:bg-danger-hover active:bg-danger-active"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									삭제 중...
								</>
							) : (
								<>
									<Trash2 className="w-4 h-4 mr-2" />
									삭제하기
								</>
							)}
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	)
}
