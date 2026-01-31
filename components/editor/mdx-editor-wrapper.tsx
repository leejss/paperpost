"use client"

import {
	BoldItalicUnderlineToggles,
	CodeToggle,
	CreateLink,
	codeBlockPlugin,
	headingsPlugin,
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

interface MDXEditorWrapperProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function MDXEditorWrapper({ value, onChange, placeholder }: MDXEditorWrapperProps) {
	return (
		<div className="w-full border border-border-default rounded-sm overflow-hidden bg-bg-default">
			<MDXEditor
				className="mdxeditor"
				markdown={value}
				onChange={onChange}
				placeholder={placeholder || "마크다운을 입력하거나 붙여넣기 하세요..."}
				contentEditableClassName="max-w-none p-4 min-h-[400px] focus:outline-none"
				plugins={[
					headingsPlugin(),
					listsPlugin(),
					quotePlugin(),
					linkPlugin(),
					linkDialogPlugin(),
					codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
					markdownShortcutPlugin(),
					toolbarPlugin({
						toolbarContents: () => (
							<>
								<UndoRedo />
								<Separator />
								<BoldItalicUnderlineToggles />
								<CodeToggle />
								<Separator />
								<ListsToggle />
								<Separator />
								<CreateLink />
							</>
						),
					}),
				]}
			/>
		</div>
	)
}
