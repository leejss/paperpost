import { buildHtmlPreview } from "./preview"

export function createHtmlPreviewStream(
	source: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
	return source.pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(buildHtmlPreview("")))
			},
		})
	)
}
