"use client"

import { useEffect, useRef, useState } from "react"
import { readHtmlFile } from "@/lib/html/file"
import { MAX_HTML_FILE_SIZE_BYTES } from "@/lib/utils/constants"

interface HtmlEditorProps {
	value: string
	onChange: (value: string) => void
}

export function HtmlEditor({ value, onChange }: HtmlEditorProps) {
	const [error, setError] = useState<string | null>(null)
	const [isReading, setIsReading] = useState(false)
	const readVersion = useRef(0)

	useEffect(
		() => () => {
			readVersion.current += 1
		},
		[]
	)

	const handleFile = async (file: File) => {
		const version = ++readVersion.current
		setError(null)
		setIsReading(true)
		try {
			const content = await readHtmlFile(file)
			if (version === readVersion.current) {
				onChange(content)
			}
		} catch (error) {
			if (version === readVersion.current) {
				setError(error instanceof Error ? error.message : "파일을 읽을 수 없습니다.")
			}
		} finally {
			if (version === readVersion.current) setIsReading(false)
		}
	}

	return (
		<div className="space-y-4 pb-28">
			<div className="rounded-lg border border-border-default bg-bg-default p-4">
				<label htmlFor="html-file" className="mb-2 block text-sm font-medium text-fg-default">
					HTML 파일 업로드
				</label>
				<input
					id="html-file"
					type="file"
					accept=".html,.htm,text/html"
					disabled={isReading}
					aria-describedby="html-help html-file-status"
					className="block min-h-11 w-full min-w-0 text-sm text-fg-muted file:mr-3 file:rounded-sm file:border-0 file:bg-bg-subtle file:px-3 file:py-3 file:text-fg-default focus-visible:outline-2 focus-visible:outline-primary"
					onChange={(event) => {
						const file = event.target.files?.[0]
						event.target.value = ""
						if (file) void handleFile(file)
					}}
				/>
				<p id="html-help" className="mt-2 text-xs leading-5 text-fg-muted">
					UTF-8 HTML 파일 1개, 최대 {MAX_HTML_FILE_SIZE_BYTES / 1024 / 1024}MB. 업로드하면 아래
					내용을 대체합니다. CSS·JavaScript·이미지는 파일 안에 포함하거나 HTTPS 주소를 사용해주세요.
					상대경로 파일은 함께 업로드되지 않습니다.
				</p>
				<output id="html-file-status" className="mt-2 block text-sm text-error-fg">
					{isReading ? "파일을 읽는 중..." : error}
				</output>
			</div>
			<div className="space-y-2">
				<label htmlFor="html-source" className="block text-sm font-medium text-fg-default">
					HTML 코드 붙여넣기
				</label>
				<textarea
					id="html-source"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					disabled={isReading}
					spellCheck={false}
					wrap="off"
					autoCapitalize="off"
					autoCorrect="off"
					placeholder={
						'<!DOCTYPE html>\n<html lang="ko">\n  <body>내용을 입력하세요</body>\n</html>'
					}
					className="min-h-96 w-full resize-y rounded-lg border border-border-default bg-bg-default p-4 font-mono text-sm leading-6 text-fg-default focus-visible:outline-2 focus-visible:outline-primary"
				/>
			</div>
		</div>
	)
}
