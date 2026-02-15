import crypto from "node:crypto"
import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { createSession, deleteSessionByTokenHash } from "@/lib/db/queries"
import { SESSION_COOKIE_NAME } from "./constants"

const SESSION_TTL_DAYS = 7
const SESSION_TOKEN_LENGTH = 48

export function generateSessionToken() {
	return nanoid(SESSION_TOKEN_LENGTH)
}

export function hashSessionToken(token: string) {
	return crypto.createHash("sha256").update(token).digest("hex")
}

export function getSessionExpiryDate() {
	const expiry = new Date()
	expiry.setDate(expiry.getDate() + SESSION_TTL_DAYS)
	return expiry
}

export async function createUserSession(userId: string) {
	const token = generateSessionToken()
	const tokenHash = hashSessionToken(token)
	const expiresAt = getSessionExpiryDate()

	await createSession({
		id: nanoid(16),
		userId,
		sessionTokenHash: tokenHash,
		expiresAt,
	})

	return {
		token,
		expiresAt,
	}
}

export async function setSessionCookie(token: string, expiresAt: Date) {
	const cookieStore = await cookies()
	cookieStore.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: expiresAt,
	})
}

export async function clearSessionCookie() {
	const cookieStore = await cookies()
	cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function clearSessionByToken(token: string) {
	await deleteSessionByTokenHash(hashSessionToken(token))
	await clearSessionCookie()
}
