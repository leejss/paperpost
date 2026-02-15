import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "active",
  "deleted",
  "blocked",
]);

export const visibilityEnum = pgEnum("visibility", [
  "public",
  "unlisted",
  "password",
]);

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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("documents_user_id_idx").on(table.userId),
  }),
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
