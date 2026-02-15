import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { bundledLanguages, createHighlighter } from "shiki";
import { unified } from "unified";
import { sanitizeSchema } from "./sanitize-config";

const DESIRED_LANGUAGES = [
  "plaintext",
  "text",
  "bash",
  "shell",
  "zsh",
  "powershell",
  "batch",
  "javascript",
  "js",
  "jsx",
  "typescript",
  "ts",
  "tsx",
  "json",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "ini",
  "markdown",
  "md",
  "sql",
  "graphql",
  "html",
  "xml",
  "css",
  "scss",
  "less",
  "diff",
  "python",
  "java",
  "kotlin",
  "swift",
  "go",
  "rust",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "dart",
  "scala",
  "r",
  "perl",
  "lua",
  "dockerfile",
  "nginx",
  "apache",
  "make",
  "cmake",
  "protobuf",
  "vue",
  "svelte",
  "astro",
] as const;

const supportedLanguages = DESIRED_LANGUAGES.filter(
  (lang) => lang in bundledLanguages,
);

const highlighterPromise = createHighlighter({
  themes: ["github-light"],
  langs: supportedLanguages,
});

export async function renderMarkdown(markdown: string): Promise<string> {
  const highlighter = await highlighterPromise;

  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(() =>
      rehypeShikiFromHighlighter(highlighter, {
        theme: "github-light",
        fallbackLanguage: "plaintext",
      }),
    )
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer", "nofollow"],
    })
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}
