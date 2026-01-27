import crypto from "node:crypto"
import { nanoid } from "nanoid"

const OWNER_TOKEN_LENGTH = 32

export function generateOwnerToken(): string {
	return nanoid(OWNER_TOKEN_LENGTH)
}

export function hashOwnerToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex")
}

export function verifyOwnerToken(token: string, hash: string): boolean {
	const tokenHash = hashOwnerToken(token)
	try {
		return crypto.timingSafeEqual(Buffer.from(tokenHash, "hex"), Buffer.from(hash, "hex"))
	} catch {
		return false
	}
}
