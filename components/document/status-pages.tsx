export function PendingView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">⏳</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
					업로드 진행 중
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400">문서가 아직 업로드되지 않았습니다.</p>
			</div>
		</div>
	)
}

export function DeletedView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">🗑️</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">삭제된 문서</h1>
				<p className="text-zinc-500 dark:text-zinc-400">이 문서는 작성자에 의해 삭제되었습니다.</p>
			</div>
		</div>
	)
}

export function BlockedView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">🚫</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">차단된 문서</h1>
				<p className="text-zinc-500 dark:text-zinc-400">이 문서는 정책 위반으로 차단되었습니다.</p>
			</div>
		</div>
	)
}

export function ExpiredView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">⌛</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">만료된 문서</h1>
				<p className="text-zinc-500 dark:text-zinc-400">이 문서의 공유 기간이 만료되었습니다.</p>
			</div>
		</div>
	)
}

export function NotFoundView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<div className="text-center">
				<div className="text-6xl mb-4">🔍</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
					문서를 찾을 수 없음
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400">요청하신 문서가 존재하지 않습니다.</p>
			</div>
		</div>
	)
}
