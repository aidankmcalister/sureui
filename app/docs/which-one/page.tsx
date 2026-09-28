import type { Metadata } from "next"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
        <div className="hidden rounded-[10px] border bg-(--well) px-2 text-foreground sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Style</TableHead>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {styles.map((style) => (
                <TableRow key={style.slug}>
                  <TableCell className="font-medium">{style.name}</TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="text-muted-foreground"
                    >
                      {style[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <FramedList className="sm:hidden">
          {styles.map((style) => (
            <dl
              key={style.slug}
              className="grid gap-2 bg-(--paper) p-4 text-sm"
            >
              <dt className="font-semibold">{style.name}</dt>
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between gap-4">
                  <dt className="text-(--ink-label)">{column.label}</dt>
                  <dd className="text-right">{style[column.key]}</dd>
                </div>
              ))}
            </dl>
          ))}
        </FramedList>
      </DocsSection>
    </>
  )
}
