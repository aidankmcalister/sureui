import { createHighlighterCoreSync, type ThemeRegistration } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import tsx from "shiki/langs/tsx.mjs"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/site/code/copy-button"
import { Label } from "@/components/site/layout/frame"

const sureui = new Set([
  "ConfirmButton",
  "TypeToConfirm",
  "ConfirmDialog",
  "undoToast",
  "useConfirm",
])

const color = (name: string) => `var(--code-${name})`

const theme: ThemeRegistration = {
  name: "sureui",
  type: "dark",
  colors: { "editor.foreground": color("foreground") },
  tokenColors: [
    { settings: { foreground: color("foreground") } },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: color("keyword") },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: color("string") },
    },
    {
      scope: ["entity.name.tag", "support.class.component"],
      settings: { foreground: color("tag") },
    },
    {
      scope: ["entity.other.attribute-name", "meta.object-literal.key"],
      settings: { foreground: color("attribute") },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: color("number") },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: color("comment"), fontStyle: "italic" },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "keyword.operator",
        "punctuation.definition.tag",
      ],
      settings: { foreground: color("punctuation") },
    },
    {
      scope: ["keyword.operator.new", "keyword.operator.expression"],
      settings: { foreground: color("keyword") },
    },
  ],
}

const highlighter = createHighlighterCoreSync({
  themes: [theme],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
})

export function Code({
  label = "tsx",
  highlight = [],
  framed = true,
  children,
}: {
  label?: string
  highlight?: number[]
  framed?: boolean
  children: string
}) {
  const { tokens } = highlighter.codeToTokens(children, {
    lang: "tsx",
    theme: "sureui",
  })

  return (
    <div
      className={cn(
        "bg-(--well) text-(--code-foreground)",
        framed && "border border-(--rule)"
      )}
    >
      <div className="flex h-10 items-center justify-between border-b border-(--rule) pr-1.5 pl-4">
        <Label
          className={cn(label.includes(".") && "tracking-normal normal-case")}
        >
          {label}
        </Label>
        <CopyButton value={children} />
      </div>
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6">
        <code className="grid min-w-fit">
          {tokens.map((line, index) => (
            <span
              key={index}
              className={cn(
                "min-h-6 pr-4 pl-4",
                highlight.includes(index + 1) &&
                  "border-l-2 border-(--mark) bg-(--mark)/10 pl-3.5"
              )}
            >
              {line.map((token, offset) => {
                const [, before, word, after] =
                  /^(\s*)(.*?)(\s*)$/.exec(token.content) ?? []
                return sureui.has(word) ? (
                  <span key={offset}>
                    {before}
                    <span
                      style={{ color: "var(--code-sureui)", fontWeight: 500 }}
                    >
                      {word}
                    </span>
                    {after}
                  </span>
                ) : (
                  <span
                    key={offset}
                    style={{
                      color: token.color,
                      fontStyle: token.fontStyle === 1 ? "italic" : undefined,
                    }}
                  >
                    {token.content}
                  </span>
                )
              })}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
