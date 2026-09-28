import type { Metadata } from "next"

import { FramedTable } from "@/components/site/docs/framed-table"
import {
  DocsHeader,
  DocsSection,
  FramedList,
  StyleLink,
} from "@/components/site/docs/sections"
import { Label } from "@/components/site/layout/frame"
import { styles } from "@/lib/site/styles"

export const metadata: Metadata = { title: "Which one should I use?" }

const columns = [
  { label: "Interrupts", key: "interrupts" },
  { label: "Asks people to read", key: "reads" },
  { label: "Best for", key: "bestFor" },
] as const

export default function WhichOne() {
  return (
    <>
      <DocsHeader href="/docs/which-one" />
      <DocsSection label="Questions to ask">
        <FramedList>
          {styles.map((style, index) => (
            <div
              key={style.slug}
              className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-baseline sm:px-5"
            >
              <Label className="text-(--mark-text)">
                {String(index + 1).padStart(2, "0")}
              </Label>
              <span className="font-medium">{style.question}</span>
              <span className="col-start-2 text-sm sm:col-start-3">
                <StyleLink slug={style.slug}>{style.name} →</StyleLink>
              </span>
            </div>
          ))}
        </FramedList>
      </DocsSection>
      <DocsSection label="At a glance">
        <FramedTable
          columns={[
            { label: "Style", width: "22%", className: "font-medium" },
            ...columns.map((column) => ({
              label: column.label,
              width: column.key === "bestFor" ? "36%" : "21%",
              className: "text-(--ink-muted)",
            })),
          ]}
          rows={styles.map((style) => ({
            key: style.slug,
            cells: [
              <StyleLink key="name" slug={style.slug}>
                {style.name}
              </StyleLink>,
              ...columns.map((column) => style[column.key]),
            ],
          }))}
          className="text-sm"
        />
      </DocsSection>
    </>
  )
}
