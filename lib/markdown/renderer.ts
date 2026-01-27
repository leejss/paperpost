import rehypeExternalLinks from "rehype-external-links"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { sanitizeSchema } from "./sanitize-config"

export async function renderMarkdown(markdown: string): Promise<string> {
	const result = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeSanitize, sanitizeSchema)
		.use(rehypeExternalLinks, {
			target: "_blank",
			rel: ["noopener", "noreferrer", "nofollow"],
		})
		.use(rehypeStringify)
		.process(markdown)

	return String(result)
}

export function extractTitle(markdown: string): string | null {
	const match = markdown.match(/^#\s+(.+)$/m)
	return match ? match[1].trim() : null
}
