import { nanoid } from "nanoid"
import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"
import { getSafeNextPath } from "@/lib/auth/redirect"
import { createUserSession, setSessionCookie } from "@/lib/auth/session"
import { createUser, getUserByEmail } from "@/lib/db/queries"

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: NextRequest) {
	const formData = await request.formData()
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase()
	const password = String(formData.get("password") ?? "")
	const next = getSafeNextPath(String(formData.get("next") ?? "/my-docs"))

	if (!email || !password) {
		return NextResponse.redirect(
			new URL(`/signup?error=missing_fields&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		return NextResponse.redirect(
			new URL(`/signup?error=password_too_short&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	const existingUser = await getUserByEmail(email)
	if (existingUser) {
		return NextResponse.redirect(
			new URL(`/login?error=email_exists&next=${encodeURIComponent(next)}`, request.url)
		)
	}

	const passwordHash = await hashPassword(password)
	const user = await createUser({
		id: nanoid(24),
		email,
		passwordHash,
	})

	const session = await createUserSession(user.id)
	await setSessionCookie(session.token, session.expiresAt)

	return NextResponse.redirect(new URL(next || "/my-docs", request.url))
}
