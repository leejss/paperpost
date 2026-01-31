import { eq } from "drizzle-orm"
import { db } from "./index"
import { type Document, documents, type NewDocument } from "./schema"

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
