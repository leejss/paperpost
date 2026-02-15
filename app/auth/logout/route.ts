import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants"
import { clearSessionByToken, clearSessionCookie } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
	const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

	if (token) {
		await clearSessionByToken(token)
	} else {
		await clearSessionCookie()
	}

	return NextResponse.redirect(new URL("/", request.url))
}
