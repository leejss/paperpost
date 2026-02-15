import { ArrowLeft, LogIn } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUserId } from "@/lib/auth/current-user"
import { getSafeNextPath } from "@/lib/auth/redirect"

interface LoginPageProps {
	searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { next, error } = await searchParams
	const safeNext = getSafeNextPath(next)
	const userId = await getCurrentUserId()

	if (userId) {
		redirect(safeNext)
	}

	const errorMessage =
		error === "invalid_credentials"
			? "이메일 또는 비밀번호가 올바르지 않습니다."
			: error === "missing_fields"
				? "이메일과 비밀번호를 모두 입력해주세요."
				: error === "email_exists"
					? "이미 가입된 이메일입니다. 로그인해주세요."
					: ""

	return (
		<div className="min-h-screen bg-bg-subtle flex items-center justify-center px-6">
			<div className="w-full max-w-md rounded-xl border border-border-default bg-bg-default p-8 shadow-sm">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-fg-muted hover:text-fg-default"
				>
					<ArrowLeft className="mr-1 h-4 w-4" />
					메인으로
				</Link>

				<h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg-default">
					PaperPost 로그인
				</h1>
				<p className="mt-2 text-sm text-fg-muted">이메일과 비밀번호로 로그인하세요.</p>

				{errorMessage && (
					<p className="mt-4 rounded-md bg-error-bg px-3 py-2 text-sm text-error-fg">
						{errorMessage}
					</p>
				)}

				<form action="/auth/login" method="post" className="mt-6 space-y-3">
					<input type="hidden" name="next" value={safeNext} />
					<div className="space-y-1.5">
						<label htmlFor="email" className="text-sm text-fg-subtle">
							이메일
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							className="w-full rounded-sm border border-border-default bg-bg-default px-3 py-2 text-sm"
						/>
					</div>
					<div className="space-y-1.5">
						<label htmlFor="password" className="text-sm text-fg-subtle">
							비밀번호
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							className="w-full rounded-sm border border-border-default bg-bg-default px-3 py-2 text-sm"
						/>
					</div>
					<Button type="submit" className="w-full" size="md">
						<LogIn className="mr-2 h-4 w-4" />
						로그인
					</Button>
				</form>

				<p className="mt-4 text-sm text-fg-muted">
					계정이 없나요?{" "}
					<Link
						href={`/signup?next=${encodeURIComponent(safeNext)}`}
						className="text-fg-default underline"
					>
						회원가입
					</Link>
				</p>
			</div>
		</div>
	)
}
