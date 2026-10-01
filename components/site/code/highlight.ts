import { createHighlighterCoreSync, type ThemeRegistration } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import json from "shiki/langs/json.mjs"
import tsx from "shiki/langs/tsx.mjs"

import type { Token, TokenKind } from "@/components/site/code/code-view"
import { controlIn } from "@/lib/site/example-source"
import { componentExports } from "@/lib/site/registry"

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

function kindOf(color: string | undefined) {
  const kind = /^var\(--code-(\w+)\)$/.exec(color ?? "")?.[1]
  return kind === "foreground" ? undefined : (kind as TokenKind | undefined)
}

function merge(line: Token[]) {
  return line.reduce<Token[]>((merged, token) => {
    const last = merged[merged.length - 1]
    if (
      last &&
      last.kind === token.kind &&
      !controlIn(last.text) &&
      !controlIn(token.text)
    ) {
      merged[merged.length - 1] = { ...last, text: last.text + token.text }
    } else {
      merged.push(token)
    }
    return merged
  }, [])
}

export function highlight(text: string, lang: "tsx" | "json" = "tsx") {
  return highlighter
    .codeToTokens(text, { lang, theme: "sureui" })
    .tokens.map((line) =>
      merge(
        line.flatMap((token): Token[] => {
          const [, before, word, after] =
            /^(\s*)(.*?)(\s*)$/.exec(token.content) ?? []
          const kind: TokenKind | null = componentExports.has(word)
            ? "sureui"
            : controlIn(word)
              ? "number"
              : null
          if (!kind) {
            return [{ text: token.content, kind: kindOf(token.color) }]
          }
          return [
            { text: before },
            { text: word, kind },
            { text: after },
          ].filter((part) => part.text)
        })
      )
    )
}
