import { createHighlighterCoreSync, type ThemeRegistration } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import json from "shiki/langs/json.mjs"
import tsx from "shiki/langs/tsx.mjs"

import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/site/code/copy-button"
import { ControlText } from "@/components/site/docs/controls"
import { Label } from "@/components/site/layout/frame"
import { controlSlotName } from "@/lib/site/controls"

const sureui = new Set([
  "ConfirmButton",
  "ConfirmMenuItem",
  "TypeToConfirm",
  "ConfirmDialog",
  "ConfirmPopover",
  "Consequences",
  "ConsequencesItem",
  "undoToast",
  "Undoable",
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
  langs: [tsx, json],
  engine: createJavaScriptRegexEngine(),
})

export function Code({
  lang = "tsx",
  label = lang,
  highlight = [],
  framed = true,
  collapsible = false,
  defaultOpen = true,
  bodyClassName,
  children,
}: {
  lang?: "tsx" | "json"
  label?: string
  highlight?: number[]
  framed?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  bodyClassName?: string
  children: string
}) {
  const { tokens } = highlighter.codeToTokens(children, {
    lang,
    theme: "sureui",
  })

  const labelNode = (
    <Label className={cn(label.includes(".") && "tracking-normal normal-case")}>
      {label}
    </Label>
  )
  const body = (
    <pre
      tabIndex={0}
      className={cn(
        "overflow-x-auto py-4 font-mono text-[13px] leading-6 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--mark)",
        bodyClassName
      )}
    >
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
              const control = controlSlotName(word)
              if (control) {
                return (
                  <span key={offset}>
                    {before}
                    <span style={{ color: "var(--code-number)" }}>
                      <ControlText name={control} />
                    </span>
                    {after}
                  </span>
                )
              }
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
  )

  if (collapsible) {
    return (
      <div
        className={cn(
          "relative bg-(--well) text-(--code-foreground)",
          framed && "border border-(--rule)"
        )}
      >
        <details open={defaultOpen} className="group/code">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 pr-12 pl-3 group-open/code:border-b group-open/code:border-(--rule) hover:bg-(--rule)/30 [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon
              aria-hidden
              className="size-3.5 text-(--ink-label) transition-transform group-open/code:rotate-90"
            />
            {labelNode}
          </summary>
          {body}
        </details>
        <div className="absolute top-0 right-1.5 flex h-10 items-center">
          <CopyButton value={children} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-(--well) text-(--code-foreground)",
        framed && "border border-(--rule)"
      )}
    >
      <div className="flex h-10 items-center justify-between border-b border-(--rule) pr-1.5 pl-4">
        {labelNode}
        <CopyButton value={children} />
      </div>
      {body}
    </div>
  )
}
