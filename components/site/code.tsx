import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import tsx from "shiki/langs/tsx.mjs"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/site/copy-button"

const sureui = new Set([
  "ConfirmButton",
  "TypeToConfirm",
  "ConfirmDialog",
  "undoToast",
  "useConfirm",
])

const highlighter = createHighlighterCoreSync({
  themes: [
    createCssVariablesTheme({
      name: "sureui",
      variablePrefix: "--code-",
      fontStyle: true,
    }),
  ],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
})

export function Code({
  highlight = [],
  children,
}: {
  highlight?: number[]
  children: string
}) {
  const { tokens } = highlighter.codeToTokens(children, {
    lang: "tsx",
    theme: "sureui",
  })

  return (
    <div className="relative rounded-[10px] border bg-(--well) text-(--code-foreground)">
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6">
        <code className="grid min-w-fit">
          {tokens.map((line, index) => (
            <span
              key={index}
              className={cn(
                "min-h-6 pr-12 pl-4",
                highlight.includes(index + 1) &&
                  "border-l-2 border-(--mark) bg-(--mark)/10 pl-3.5"
              )}
            >
              {line.map((token, offset) => (
                <span
                  key={offset}
                  style={
                    sureui.has(token.content)
                      ? { color: "var(--code-sureui)", fontWeight: 500 }
                      : {
                          color: token.color,
                          fontStyle:
                            token.fontStyle === 1 ? "italic" : undefined,
                        }
                  }
                >
                  {token.content}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
      <CopyButton value={children} className="absolute top-2.5 right-2.5" />
    </div>
  )
}

export function Command({ children }: { children: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-2 rounded-md border bg-(--well) pr-1 pl-3 font-mono text-xs text-foreground">
      <span className="min-w-0 py-2 leading-5 sm:scrollbar-none sm:overflow-x-auto sm:whitespace-nowrap">
        {children}
      </span>
      <CopyButton value={children} />
    </div>
  )
}
