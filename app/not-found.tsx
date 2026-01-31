import Link from "next/link"

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-bg-subtle">
			<div className="text-center">
				<div className="text-6xl mb-4">🔍</div>
				<h1 className="text-xl font-semibold text-fg-default mb-2">페이지를 찾을 수 없음</h1>
				<p className="text-fg-muted mb-6">요청하신 페이지가 존재하지 않습니다.</p>
				<Link
					href="/"
					className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover"
				>
					홈으로 돌아가기
				</Link>
			</div>
		</div>
	)
}
