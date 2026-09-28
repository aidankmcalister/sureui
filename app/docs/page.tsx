import type { Metadata } from "next"
import Link from "next/link"

import { Code } from "@/components/site/code/code"
import {
  DocsHeader,
  DocsSection,
  FramedList,
  InlineCode,
  Prose,
  StyleLink,
} from "@/components/site/docs/sections"
import { Label } from "@/components/site/layout/frame"
import { contract, contractNote, coreNote, intro } from "@/lib/site/pages"
import { styles } from "@/lib/site/styles"

export const metadata: Metadata = { title: "Introduction" }

export default function Introduction() {
  return (
    <>
      <DocsHeader href="/docs" />
      <DocsSection label="The idea">
        <Prose>
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Prose>
      </DocsSection>
      <DocsSection label="Five styles">
        <FramedList>
          {styles.map((style, index) => (
            <Link
              key={style.slug}
              href={`/docs/${style.slug}`}
              className="grid grid-cols-1 items-baseline gap-x-4 gap-y-1 bg-(--paper) px-4 py-4 hover:bg-(--well) sm:grid-cols-[auto_minmax(0,1fr)] sm:px-5"
            >
              <Label className="text-(--mark-text) max-sm:hidden">
                Fig. {String(index + 1).padStart(2, "0")}
              </Label>
              <span className="grid gap-1">
                <span className="font-semibold">{style.name}</span>
                <span className="text-sm text-pretty text-(--ink-muted)">
                  {style.summary}
                </span>
              </span>
            </Link>
          ))}
        </FramedList>
      </DocsSection>
      <DocsSection label="One contract">
        <Prose>
          <p>
            <InlineCode>{contractNote}</InlineCode>
          </p>
        </Prose>
        <Code>{contract}</Code>
        <Prose>
          <p>
            <StyleLink slug={coreNote.slug}>{coreNote.link}</StyleLink>{" "}
            {coreNote.text}
          </p>
        </Prose>
      </DocsSection>
    </>
  )
}
