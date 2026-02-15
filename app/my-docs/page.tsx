import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { ArrowLeft, Calendar, Clock, ExternalLink, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getDocumentsByUserId } from "@/lib/db/queries"

export const dynamic = "force-dynamic"

export default async function MyDocsPage() {
	const { userId } = await auth()

	if (!userId) {
		redirect("/")
	}

	const documents = await getDocumentsByUserId(userId)

	return (
		<div className="min-h-screen bg-bg-subtle">
			<header className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-bg-subtle/80 backdrop-blur-xl">
				<div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<Link href="/">
							<Button variant="ghost" size="sm" className="-ml-2">
								<ArrowLeft className="w-4 h-4 mr-1" />
								메인으로
							</Button>
						</Link>
						<h1 className="text-lg font-semibold tracking-tight text-fg-default">내 문서</h1>
					</div>
					<UserButton
						appearance={{
							elements: {
								avatarBox: "w-8 h-8",
							},
						}}
					/>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-6 py-8">
				{documents.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-default rounded-lg bg-bg-default/50">
						<FileText className="w-12 h-12 text-fg-muted mb-4" />
						<h3 className="text-lg font-medium text-fg-default mb-1">작성한 문서가 없습니다</h3>
						<p className="text-sm text-fg-muted mb-6">
							새로운 마크다운 문서를 작성하고 공유해보세요.
						</p>
						<Link href="/">
							<Button>새 문서 만들기</Button>
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{documents.map((doc) => (
							<div
								key={doc.id}
								className="group relative flex flex-col gap-3 rounded-lg border border-border-default bg-bg-default p-4 transition-all hover:border-border-hover hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex-1 min-w-0 space-y-1">
									<div className="flex items-center gap-2">
										<Link
											href={`/d/${doc.id}`}
											className="text-base font-medium text-fg-default hover:text-accent-default truncate flex items-center gap-1.5"
										>
											{doc.id}
											<ExternalLink className="w-3.5 h-3.5 text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
										</Link>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
												doc.status === "active"
													? "bg-success-subtle text-success"
													: doc.status === "pending"
														? "bg-warning-subtle text-warning"
														: "bg-error-subtle text-error"
											}`}
										>
											{doc.status}
										</span>
										{doc.visibility === "public" && (
											<span className="inline-flex items-center rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent-default">
												Public
											</span>
										)}
									</div>
									<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
										<div className="flex items-center gap-1">
											<Calendar className="w-3.5 h-3.5" />
											<span>{new Date(doc.createdAt).toLocaleDateString("ko-KR")}</span>
										</div>
										<div className="flex items-center gap-1">
											<Clock className="w-3.5 h-3.5" />
											<span>
												{doc.expiresAt
													? new Date(doc.expiresAt).toLocaleDateString("ko-KR") + " 만료"
													: "영구 보관"}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<Eye className="w-3.5 h-3.5" />
											<span>{doc.visibility === "unlisted" ? "링크 일부 공개" : "전체 공개"}</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-border-muted/50 sm:border-t-0">
									<Link href={`/d/${doc.id}`}>
										<Button variant="ghost" size="sm" className="h-8 text-xs">
											보기
										</Button>
									</Link>
									<Link href={`/download/${doc.id}`}>
										<Button variant="ghost" size="sm" className="h-8 text-xs">
											다운로드
										</Button>
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
