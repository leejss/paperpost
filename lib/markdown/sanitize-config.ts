import type { Options as SanitizeOptions } from "rehype-sanitize"
import { defaultSchema } from "rehype-sanitize"

export const sanitizeSchema: SanitizeOptions = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [...(defaultSchema.attributes?.code || []), ["className", /^language-./]],
		pre: [...(defaultSchema.attributes?.pre || []), ["className"]],
	},
	tagNames: [
		...(defaultSchema.tagNames || []),
		"section",
		"article",
		"aside",
		"header",
		"footer",
		"nav",
		"figure",
		"figcaption",
		"details",
		"summary",
		"mark",
		"time",
	],
	strip: ["script", "style"],
}
