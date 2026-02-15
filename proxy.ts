import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants"

function isProtectedRoute(pathname: string) {
	return pathname.startsWith("/my-docs")
}

export default async function proxy(request: NextRequest) {
	const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

	if (isProtectedRoute(request.nextUrl.pathname) && !sessionToken) {
		const loginUrl = new URL("/login", request.url)
		loginUrl.searchParams.set("next", request.nextUrl.pathname)
		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|webp|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
}
