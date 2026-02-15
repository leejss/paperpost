import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const documentStatusEnum = pgEnum("document_status", [
	"pending",
	"active",
	"deleted",
	"blocked",
])

export const visibilityEnum = pgEnum("visibility", ["public", "unlisted", "password"])

export const documents = pgTable(
	"documents",
	{
		id: text("id").primaryKey(),
		r2Key: text("r2_key").notNull(),
		userId: text("user_id"),
		visibility: visibilityEnum("visibility").default("unlisted").notNull(),
		passwordHash: text("password_hash"),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		ownerTokenHash: text("owner_token_hash").notNull(),
		status: documentStatusEnum("status").default("pending").notNull(),
		sizeBytes: integer("size_bytes").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("documents_user_id_idx").on(table.userId),
	})
)

export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull().unique(),
		passwordHash: text("password_hash").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => ({
		emailIdx: index("users_email_idx").on(table.email),
	})
)

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		sessionTokenHash: text("session_token_hash").notNull().unique(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("sessions_user_id_idx").on(table.userId),
		tokenHashIdx: index("sessions_token_hash_idx").on(table.sessionTokenHash),
	})
)

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
