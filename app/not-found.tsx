import Link from "next/link"

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">🔍</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
					페이지를 찾을 수 없음
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400 mb-6">
					요청하신 페이지가 존재하지 않습니다.
				</p>
				<Link
					href="/"
					className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
				>
					홈으로 돌아가기
				</Link>
			</div>
		</div>
	)
}
