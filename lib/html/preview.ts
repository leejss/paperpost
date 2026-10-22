const PREVIEW_CSP = [
	"default-src 'none'",
	"script-src 'unsafe-inline' https: blob:",
	"style-src 'unsafe-inline' https:",
	"img-src https: data: blob:",
	"font-src https: data:",
	"media-src https: data: blob:",
	"connect-src https:",
	"frame-src 'none'",
	"object-src 'none'",
	"base-uri 'none'",
	"form-action 'none'",
].join("; ")

export function buildHtmlPreview(content: string): string {
	// Place the policy before any user markup. Later policies cannot relax it.
	// Keep allow-same-origin OFF on the iframe: user scripts must have an opaque origin.
	return `<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex, nofollow, noarchive">${content}`
}
