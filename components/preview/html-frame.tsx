import { buildHtmlPreview } from "@/lib/html/preview"

type HtmlFrameProps = { content: string; src?: never } | { src: string; content?: never }

export function HtmlFrame({ content, src }: HtmlFrameProps) {
	return (
		<iframe
			title="HTML 문서"
			src={src}
			srcDoc={content === undefined ? undefined : buildHtmlPreview(content)}
			sandbox="allow-scripts"
			referrerPolicy="no-referrer"
			allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"
			className="block h-[calc(100dvh-9rem)] min-h-96 w-full border-0 bg-white"
		/>
	)
}
