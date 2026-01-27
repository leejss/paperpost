import { nanoid } from "nanoid"

const DOC_ID_LENGTH = 10

export function generateDocId(): string {
	return nanoid(DOC_ID_LENGTH)
}
