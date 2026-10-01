import * as React from "react"
import type { Metadata } from "next"

import Content from "@/content/changelog.mdx"
import {
  Band,
  Label,
  PageLead,
  PageTitle,
} from "@/components/site/layout/frame"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in each SureUI release.",
  alternates: { canonical: "/changelog" },
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

function Release({
  version,
  date,
  children,
}: {
  version: string
  date: string
  children: React.ReactNode
}) {
  return (
    <Band
      grow
      className="grid gap-8 px-3 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-16"
    >
      <div id={`v${version}`} className="grid scroll-mt-24 content-start gap-2">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          <a href={`#v${version}`} className="hover:text-(--mark)">
            {version}
          </a>
        </h2>
        <Label>
          <time dateTime={date}>{formatDate(date)}</time>
        </Label>
      </div>
      <div className="grid max-w-160 content-start gap-4">{children}</div>
    </Band>
  )
}

function P({ children }: React.ComponentProps<"p">) {
  return <p className="mb-6 text-[17px] leading-7 text-pretty">{children}</p>
}

function H3({ children }: React.ComponentProps<"h3">) {
  return (
    <h3 className="mt-4 first-of-type:mt-0">
      <Label>{children}</Label>
    </h3>
  )
}

function Ul({ children }: React.ComponentProps<"ul">) {
  return (
    <ul className="grid gap-3 text-base leading-7 text-pretty text-(--ink-muted)">
      {children}
    </ul>
  )
}

function Li({ children }: React.ComponentProps<"li">) {
  return (
    <li className="grid grid-cols-[16px_minmax(0,1fr)]">
      <span aria-hidden className="text-(--mark)">
        –
      </span>
      <span>{children}</span>
    </li>
  )
}

const components = {
  p: P,
  h3: H3,
  ul: Ul,
  li: Li,
  Release,
}

export default function Changelog() {
  return (
    <main
      id="content"
      tabIndex={-1}
      className="flex flex-1 flex-col outline-none"
    >
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <PageTitle>Changelog</PageTitle>
        <PageLead>
          What changed in each release. Registry items always install the latest
          version.
        </PageLead>
      </Band>
      <Content components={components} />
    </main>
  )
}
