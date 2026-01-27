import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema"

let _db: NeonHttpDatabase<typeof schema> | null = null

export function getDb(): NeonHttpDatabase<typeof schema> {
	if (!_db) {
		const databaseUrl = process.env.DATABASE_URL
		if (!databaseUrl) {
			throw new Error("DATABASE_URL is not set")
		}
		const sql = neon(databaseUrl)
		_db = drizzle(sql, { schema })
	}
	return _db
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
	get(_, prop) {
		const instance = getDb()
		const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
		if (typeof value === "function") {
			return (value as Function).bind(instance)
		}
		return value
	},
})
