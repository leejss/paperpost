import type { Document } from "@/lib/db/schema"

interface DocumentViewerProps {
	html: string
	document: Document
}

export function DocumentViewer({ html, document }: DocumentViewerProps) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950">
			<div className="mx-auto max-w-3xl px-4 py-8">
				<header className="mb-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
					<div>
						<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
							{document.title || "제목 없음"}
						</h1>
						<p className="mt-1 text-sm text-zinc-500">
							{document.createdAt.toLocaleDateString("ko-KR")} 공유됨
							{document.expiresAt && (
								<span className="ml-2">
									· {document.expiresAt.toLocaleDateString("ko-KR")} 만료
								</span>
							)}
						</p>
					</div>
					<div className="flex gap-2">
						<a
							href={`${appUrl}/raw/${document.id}`}
							className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
							target="_blank"
							rel="noopener noreferrer"
						>
							Raw
						</a>
						<a
							href={`${appUrl}/download/${document.id}`}
							className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
						>
							Download
						</a>
					</div>
				</header>

				<article
					className="prose dark:prose-invert max-w-none"
					dangerouslySetInnerHTML={{ __html: html }}
				/>

				<footer className="mt-12 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
					<a
						href={appUrl}
						className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						Markdown Share로 새 문서 만들기
					</a>
				</footer>
			</div>
		</div>
	)
}
