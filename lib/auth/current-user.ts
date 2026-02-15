import { cookies } from "next/headers"
import { getSessionWithUserByTokenHash } from "@/lib/db/queries"
import { SESSION_COOKIE_NAME } from "./constants"
import { hashSessionToken } from "./session"

export async function getCurrentUser() {
	const cookieStore = await cookies()
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

	if (!token) {
		return null
	}

	const session = await getSessionWithUserByTokenHash(hashSessionToken(token))
	return session?.user ?? null
}

export async function getCurrentUserId() {
	const user = await getCurrentUser()
	return user?.id ?? null
}
