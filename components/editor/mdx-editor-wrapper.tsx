"use client";

import {
  codeBlockPlugin,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  markdownShortcutPlugin,
  quotePlugin,
} from "@mdxeditor/editor";

interface MDXEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MDXEditorWrapper({
  value,
  onChange,
  placeholder,
}: MDXEditorWrapperProps) {
  return (
    <div className="w-full border border-border-default rounded-sm overflow-hidden bg-bg-default">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        placeholder={placeholder || "마크다운을 입력하거나 붙여넣기 하세요..."}
        contentEditableClassName="prose dark:prose-invert max-w-none p-4 min-h-[400px] focus:outline-none"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}
