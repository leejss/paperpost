"use client"

import { ArrowLeft, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HtmlFrame } from "./html-frame"

interface HtmlPreviewProps {
	content: string
	onBack: () => void
	onShare: () => void
}

export function HtmlPreview({ content, onBack, onShare }: HtmlPreviewProps) {
	return (
		<div className="min-h-screen bg-bg-subtle">
			<header className="border-b border-border-default bg-bg-default">
				<div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-4">
					<Button variant="ghost" onClick={onBack} className="gap-2">
						<ArrowLeft className="h-4 w-4" /> 편집
					</Button>
					<span className="text-sm text-fg-muted">HTML 미리보기</span>
					<Button onClick={onShare} className="gap-2">
						<Share className="h-4 w-4" /> 공유
					</Button>
				</div>
			</header>
			<main className="mx-auto max-w-7xl p-2 sm:p-4">
				<p className="mb-3 text-xs leading-5 text-fg-muted">
					HTML은 격리된 화면에서 실행됩니다. 폼 제출, 팝업, 로그인·저장소 접근은 제한됩니다.
				</p>
				<HtmlFrame content={content} />
			</main>
		</div>
	)
}
