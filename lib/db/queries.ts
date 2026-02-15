import { and, desc, eq, gt } from "drizzle-orm"
import { db } from "./index"
import {
	type Document,
	documents,
	type NewDocument,
	type NewSession,
	type NewUser,
	sessions,
	type User,
	users,
} from "./schema"

export async function getDocumentById(id: string): Promise<Document | null> {
	const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1)
	return result[0] ?? null
}

export async function createDocument(doc: NewDocument): Promise<Document> {
	const result = await db.insert(documents).values(doc).returning()
	return result[0]
}

export async function updateDocumentStatus(
	id: string,
	status: "pending" | "active" | "deleted" | "blocked"
): Promise<Document | null> {
	const result = await db
		.update(documents)
		.set({ status, updatedAt: new Date() })
		.where(eq(documents.id, id))
		.returning()

	return result[0] ?? null
}

export async function getDocumentsByUserId(userId: string, limit = 50): Promise<Document[]> {
	return db
		.select()
		.from(documents)
		.where(eq(documents.userId, userId))
		.orderBy(desc(documents.createdAt))
		.limit(limit)
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

	return result[0] ?? null
}

export async function getUserById(id: string): Promise<User | null> {
	const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
	return result[0] ?? null
}

export async function createUser(input: NewUser): Promise<User> {
	const result = await db.insert(users).values(input).returning()
	return result[0]
}

export async function createSession(input: NewSession) {
	const result = await db.insert(sessions).values(input).returning()
	return result[0]
}

export async function getSessionWithUserByTokenHash(tokenHash: string): Promise<{
	session: typeof sessions.$inferSelect
	user: User
} | null> {
	const result = await db
		.select({
			session: sessions,
			user: users,
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.sessionTokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
		.limit(1)

	return result[0] ?? null
}

export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.sessionTokenHash, tokenHash))
}

export async function deleteSessionsByUserId(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId))
}
