"use client"

import "@mdxeditor/editor/style.css"

import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	ChangeCodeMirrorLanguage,
	CodeToggle,
	ConditionalContents,
	CreateLink,
	codeBlockPlugin,
	codeMirrorPlugin,
	DiffSourceToggleWrapper,
	diffSourcePlugin,
	headingsPlugin,
	InsertCodeBlock,
	ListsToggle,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	MDXEditor,
	markdownShortcutPlugin,
	quotePlugin,
	Separator,
	toolbarPlugin,
	UndoRedo,
} from "@mdxeditor/editor"
import { useTheme } from "next-themes"

interface MDXEditorWrapperProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function MDXEditorWrapper({ value, onChange, placeholder }: MDXEditorWrapperProps) {
	const { theme } = useTheme()
	const isDark = theme === "dark"

	return (
		<div className="w-full border border-border-default rounded-sm overflow-hidden bg-bg-default dark:bg-bg-default">
			<MDXEditor
				className={`mdxeditor ${isDark ? "dark" : ""}`}
				markdown={value}
				onChange={onChange}
				placeholder={placeholder || "마크다운을 입력하거나 붙여넣기 하세요..."}
				contentEditableClassName="prose prose-zinc dark:prose-invert max-w-none p-4 min-h-[400px] focus:outline-none"
				plugins={[
					headingsPlugin(),
					listsPlugin(),
					quotePlugin(),
					linkPlugin(),
					linkDialogPlugin(),
					codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
					codeMirrorPlugin({
						codeBlockLanguages: {
							javascript: "JavaScript",
							typescript: "TypeScript",
							jsx: "JSX",
							tsx: "TSX",
							css: "CSS",
							html: "HTML",
							json: "JSON",
							python: "Python",
							sql: "SQL",
							bash: "Bash",
							yaml: "YAML",
							markdown: "Markdown",
						},
					}),
					markdownShortcutPlugin(),
					diffSourcePlugin({
						viewMode: "rich-text",
					}),
					toolbarPlugin({
						toolbarContents: () => (
							<DiffSourceToggleWrapper>
								<ConditionalContents
									options={[
										{
											when: (editor) => editor?.editorType === "codeblock",
											contents: () => <ChangeCodeMirrorLanguage />,
										},
										{
											fallback: () => (
												<>
													<UndoRedo />
													<Separator />
													<BlockTypeSelect />
													<Separator />
													<BoldItalicUnderlineToggles />
													<CodeToggle />
													<Separator />
													<ListsToggle />
													<Separator />
													<CreateLink />
													<Separator />
													<InsertCodeBlock />
												</>
											),
										},
									]}
								/>
							</DiffSourceToggleWrapper>
						),
					}),
				]}
			/>
		</div>
	)
}
