import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUserId } from "@/lib/auth/current-user"
import { getSafeNextPath } from "@/lib/auth/redirect"

interface SignUpPageProps {
	searchParams: Promise<{ next?: string; error?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
	const { next, error } = await searchParams
	const safeNext = getSafeNextPath(next)
	const userId = await getCurrentUserId()

	if (userId) {
		redirect(safeNext)
	}

	const errorMessage =
		error === "password_too_short"
			? "비밀번호는 최소 8자 이상이어야 합니다."
			: error === "missing_fields"
				? "이메일과 비밀번호를 모두 입력해주세요."
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
					PaperPost 회원가입
				</h1>
				<p className="mt-2 text-sm text-fg-muted">이메일로 새 계정을 만들 수 있습니다.</p>

				{errorMessage && (
					<p className="mt-4 rounded-md bg-error-bg px-3 py-2 text-sm text-error-fg">
						{errorMessage}
					</p>
				)}

				<form action="/auth/signup" method="post" className="mt-6 space-y-3">
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
							비밀번호 (8자 이상)
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							minLength={8}
							className="w-full rounded-sm border border-border-default bg-bg-default px-3 py-2 text-sm"
						/>
					</div>
					<Button type="submit" className="w-full" size="md">
						<UserPlus className="mr-2 h-4 w-4" />
						회원가입
					</Button>
				</form>

				<p className="mt-4 text-sm text-fg-muted">
					이미 계정이 있나요?{" "}
					<Link
						href={`/login?next=${encodeURIComponent(safeNext)}`}
						className="text-fg-default underline"
					>
						로그인
					</Link>
				</p>
			</div>
		</div>
	)
}
