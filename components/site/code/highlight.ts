import { createHighlighterCoreSync, type ThemeRegistration } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import json from "shiki/langs/json.mjs"
import tsx from "shiki/langs/tsx.mjs"

import type { Token } from "@/components/site/code/code-view"
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

export function highlight(text: string, lang: "tsx" | "json" = "tsx") {
  return highlighter
    .codeToTokens(text, { lang, theme: "sureui" })
    .tokens.map((line) =>
      line.flatMap((token): Token[] => {
        const [, before, word, after] =
          /^(\s*)(.*?)(\s*)$/.exec(token.content) ?? []
        const special = componentExports.has(word)
          ? { color: color("sureui"), strong: true }
          : controlIn(word)
            ? { color: color("number") }
            : null
        if (!special) {
          return [
            {
              text: token.content,
              color: token.color,
              italic: token.fontStyle === 1,
            },
          ]
        }
        return [
          { text: before },
          { text: word, ...special },
          { text: after },
        ].filter((part) => part.text)
      })
    )
}
