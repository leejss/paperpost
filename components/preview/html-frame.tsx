import { buildHtmlPreview } from "@/lib/html/preview"

export function HtmlFrame({ content }: { content: string }) {
	return (
		<iframe
			title="HTML 문서"
			srcDoc={buildHtmlPreview(content)}
			sandbox="allow-scripts"
			referrerPolicy="no-referrer"
			allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"
			className="block h-[calc(100dvh-9rem)] min-h-96 w-full border-0 bg-white"
		/>
	)
}
