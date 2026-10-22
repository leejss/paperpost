import assert from "node:assert/strict"
import { test } from "node:test"
import { S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { metadata } from "../app/d/layout"
import { HtmlFrame } from "../components/preview/html-frame"
import { getDocumentContentType, getDocumentFormat } from "../lib/documents/format"
import { readHtmlFile } from "../lib/html/file"
import { buildHtmlPreview } from "../lib/html/preview"
import { createHtmlPreviewStream } from "../lib/html/stream"
import { createUploadCommand, getR2Key, UPLOAD_SIGNABLE_HEADERS } from "../lib/r2/presign"
import {
	getMaxDocumentSizeBytes,
	MAX_FILE_SIZE_BYTES,
	MAX_HTML_FILE_SIZE_BYTES,
} from "../lib/utils/constants"
import {
	confirmUploadSchema,
	createDocSchema,
	createUploadSchema,
} from "../lib/validations/document"
import nextConfig from "../next.config"

test("existing Markdown keys and inputs retain their format", () => {
	assert.equal(createDocSchema.parse({ content: "# 기존 문서" }).format, "markdown")
	assert.equal(getR2Key("legacy"), "docs/legacy.md")
	assert.equal(getDocumentFormat("docs/legacy.md"), "markdown")
	assert.equal(getDocumentContentType("markdown"), "text/markdown")
})

test("HTML format round-trips through its storage key without rewriting the source", () => {
	const content =
		'<!doctype html>\n<html lang="ko"><style>body {color:red}</style><script>1 < 2</script></html>'
	const validated = createDocSchema.parse({ content, format: "html" })
	assert.equal(validated.content, content)
	assert.equal(getR2Key("html-doc", validated.format), "docs/html-doc.html")
	assert.equal(getDocumentFormat(getR2Key("html-doc", validated.format)), "html")
	assert.equal(getDocumentContentType("html"), "text/html")
})

test("validation rejects blank content and unsupported formats", () => {
	for (const content of ["", " \n\t ", "\uFEFF"]) {
		assert.equal(createDocSchema.safeParse({ content, format: "html" }).success, false)
	}
	assert.equal(createDocSchema.safeParse({ content: "ok", format: "svg" }).success, false)
})

for (const format of ["markdown", "html"] as const) {
	test(`${format} enforces its own UTF-8 byte limit at the boundary`, () => {
		const limit = getMaxDocumentSizeBytes(format)
		const content = `${"가".repeat(Math.floor(limit / 3))}${"a".repeat(limit % 3)}`
		assert.equal(new TextEncoder().encode(content).length, limit)
		assert.equal(createDocSchema.safeParse({ content, format }).success, true)
		assert.equal(createDocSchema.safeParse({ content: `${content}a`, format }).success, false)
	})
}

test("HTML accepts files larger than the Markdown limit, for both source and upload metadata", async () => {
	const content = `<p>${"a".repeat(MAX_FILE_SIZE_BYTES)}</p>`
	assert.equal(createDocSchema.safeParse({ content, format: "html" }).success, true)
	assert.equal(createDocSchema.safeParse({ content, format: "markdown" }).success, false)
	assert.equal(await readHtmlFile(new File([content], "large.html")), content)
	assert.equal(
		createUploadSchema.safeParse({ format: "html", sizeBytes: MAX_HTML_FILE_SIZE_BYTES }).success,
		true
	)
	assert.equal(
		createUploadSchema.safeParse({ format: "html", sizeBytes: MAX_HTML_FILE_SIZE_BYTES + 1 })
			.success,
		false
	)
	assert.equal(
		createUploadSchema.safeParse({ format: "markdown", sizeBytes: MAX_FILE_SIZE_BYTES + 1 })
			.success,
		false
	)
	for (const sizeBytes of [0, -1, 1.5, Infinity, NaN]) {
		assert.equal(createUploadSchema.safeParse({ format: "html", sizeBytes }).success, false)
	}
})

test("file upload accepts HTML/HTM case-insensitively and decodes UTF-8 with BOM", async () => {
	for (const name of ["page.html", "PAGE.HTM"]) {
		assert.equal(
			await readHtmlFile(new File(["\uFEFF<h1>안녕하세요</h1>"], name)),
			"<h1>안녕하세요</h1>"
		)
	}
})

test("file upload rejects other files, empty content, invalid UTF-8 and oversized files", async () => {
	await assert.rejects(readHtmlFile(new File(["<h1>html</h1>"], "page.txt")), /html.*htm/)
	await assert.rejects(readHtmlFile(new File([" \n"], "page.html")), /비어/)
	await assert.rejects(readHtmlFile(new File([new Uint8Array([0xff, 0xfe])], "page.html")), /UTF-8/)
	await assert.rejects(
		readHtmlFile(new File(["a".repeat(MAX_HTML_FILE_SIZE_BYTES + 1)], "page.html")),
		/20MB/
	)
})

test("HTML policies precede attacker-controlled markup and keep inline scripts available", () => {
	const content =
		'<meta http-equiv="Content-Security-Policy" content="default-src *"><script>alert(1)</script>'
	const preview = buildHtmlPreview(content)
	assert.ok(preview.startsWith('<!DOCTYPE html><meta charset="utf-8">'))
	assert.ok(preview.indexOf("default-src 'none'") < preview.indexOf(content))
	assert.ok(preview.includes("script-src 'unsafe-inline'"))
	assert.ok(preview.includes("form-action 'none'"))
	assert.ok(preview.includes("base-uri 'none'"))
	assert.ok(preview.endsWith(content))
})

test("the viewer escapes HTML into an opaque-origin sandbox instead of the parent DOM", () => {
	const markup = renderToStaticMarkup(
		createElement(HtmlFrame, { content: "<script>attack()</script>" })
	)
	assert.ok(markup.includes('sandbox="allow-scripts"'))
	assert.ok(!markup.includes("allow-same-origin"))
	assert.ok(!markup.includes("<script>attack()"))
	assert.ok(markup.includes('referrerPolicy="no-referrer"'))
})

test("all document endpoints, including errors, receive search-exclusion and nosniff headers", async () => {
	const rules = await nextConfig.headers?.()
	for (const source of ["/d/:path*", "/html/:path*", "/raw/:path*", "/download/:path*"]) {
		const headers = rules?.find((rule) => rule.source === source)?.headers
		assert.equal(
			headers?.find((header) => header.key === "X-Robots-Tag")?.value,
			"noindex, nofollow, noarchive"
		)
		assert.equal(
			headers?.find((header) => header.key === "X-Content-Type-Options")?.value,
			"nosniff"
		)
	}
	assert.deepEqual(metadata.robots, {
		index: false,
		follow: false,
		noarchive: true,
		googleBot: { index: false, follow: false, noimageindex: true },
	})
})

test("presigned uploads bind byte length, content type and conditional writes without an empty checksum", async () => {
	const client = new S3Client({
		region: "auto",
		endpoint: "https://example.r2.cloudflarestorage.com",
		credentials: { accessKeyId: "test", secretAccessKey: "test" },
		requestChecksumCalculation: "WHEN_REQUIRED",
	})
	try {
		const command = createUploadCommand(
			"bucket",
			"docs/test.html",
			MAX_HTML_FILE_SIZE_BYTES,
			"html"
		)
		assert.equal(command.input.ContentLength, MAX_HTML_FILE_SIZE_BYTES)
		assert.equal(command.input.ContentType, "text/html")
		assert.equal(command.input.IfNoneMatch, "*")
		const url = new URL(
			await getSignedUrl(client, command, {
				expiresIn: 300,
				signableHeaders: UPLOAD_SIGNABLE_HEADERS,
			})
		)
		const signedHeaders = url.searchParams.get("X-Amz-SignedHeaders")?.split(";")
		for (const header of UPLOAD_SIGNABLE_HEADERS) assert.ok(signedHeaders?.includes(header))
		assert.equal(url.searchParams.get("X-Amz-Expires"), "300")
		assert.ok(!url.searchParams.has("x-amz-checksum-crc32"))
	} finally {
		client.destroy()
	}
})

test("upload confirmation requires the owner token", () => {
	assert.equal(confirmUploadSchema.safeParse({ id: "test" }).success, false)
	assert.equal(confirmUploadSchema.safeParse({ id: "test", ownerToken: "token" }).success, true)
})

test("shared HTML frames use the streaming endpoint without embedding the source in the page", () => {
	const markup = renderToStaticMarkup(createElement(HtmlFrame, { src: "/html/test" }))
	assert.ok(markup.includes('src="/html/test"'))
	assert.ok(markup.includes('sandbox="allow-scripts"'))
	assert.ok(!markup.includes("srcDoc="))
})

test("HTML streams preserve UTF-8 chunks and prepend the policy before the original source", async () => {
	const content = "<!doctype html><h1>큰 HTML 문서</h1>"
	const bytes = new TextEncoder().encode(content)
	const source = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(bytes.slice(0, 22))
			controller.enqueue(bytes.slice(22))
			controller.close()
		},
	})
	const response = new Response(createHtmlPreviewStream(source))
	assert.equal(await response.text(), buildHtmlPreview(content))
})
