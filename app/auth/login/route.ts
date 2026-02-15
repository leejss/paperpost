import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth/password"
import { getSafeNextPath } from "@/lib/auth/redirect"
import { createUserSession, setSessionCookie } from "@/lib/auth/session"
import { getUserByEmail } from "@/lib/db/queries"

export async function POST(request: NextRequest) {
	const formData = await request.formData()
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase()
	const password = String(formData.get("password") ?? "")
	const next = getSafeNextPath(String(formData.get("next") ?? "/my-docs"))

	if (!email || !password) {
		return NextResponse.redirect(
			new URL(`/login?error=missing_fields&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	const user = await getUserByEmail(email)

	if (!user) {
		return NextResponse.redirect(
			new URL(`/login?error=invalid_credentials&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	const isValid = await verifyPassword(password, user.passwordHash)

	if (!isValid) {
		return NextResponse.redirect(
			new URL(`/login?error=invalid_credentials&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	const session = await createUserSession(user.id)
	await setSessionCookie(session.token, session.expiresAt)

	return NextResponse.redirect(new URL(next || "/my-docs", request.url))
}
