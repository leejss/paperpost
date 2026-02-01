import type { Document } from "@/lib/db/schema"

interface DocumentViewerProps {
	html: string
	document: Document
}

export function DocumentViewer({ html, document }: DocumentViewerProps) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

	return (
		<div className="min-h-screen bg-bg-default">
			<p className="text-sm text-fg-muted fixed right-4 top-4">
				{document.expiresAt && (
					<span className="ml-2">{document.expiresAt.toLocaleDateString("ko-KR")} 만료</span>
				)}
			</p>
			<div className="mx-auto max-w-3xl px-4 py-8">
				<header className="mb-8 flex items-center justify-between border-b border-border-default pb-4">
					<h1>Paperpost</h1>
					<div className="flex gap-2">
						<a
							href={`${appUrl}/raw/${document.id}`}
							className="inline-flex h-9 items-center justify-center rounded-sm border border-border-default px-3 text-sm font-medium hover:bg-bg-subtle"
							target="_blank"
							rel="noopener noreferrer"
						>
							Raw
						</a>
						<a
							href={`${appUrl}/download/${document.id}`}
							className="inline-flex h-9 items-center justify-center rounded-sm border border-border-default px-3 text-sm font-medium hover:bg-bg-subtle"
						>
							Download
						</a>
					</div>
				</header>

				<article
					className="prose dark:prose-invert max-w-none"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
		</div>
	)
}
