"use client"

import dynamic from "next/dynamic"
import "@mdxeditor/editor/style.css"

interface MarkdownEditorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

function EditorSkeleton() {
	return (
		<div className="w-full h-full min-h-[400px] bg-bg-subtle rounded-sm animate-pulse flex items-center justify-center">
			<span className="text-fg-muted">에디터 로딩 중...</span>
		</div>
	)
}

const MDXEditorWrapper = dynamic(
	() => import("./mdx-editor-wrapper").then((mod) => mod.MDXEditorWrapper),
	{
		ssr: false,
		loading: () => <EditorSkeleton />,
	}
)

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
	return <MDXEditorWrapper value={value} onChange={onChange} placeholder={placeholder} />
}
