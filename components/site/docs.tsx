import Link from "next/link"

import { cn } from "@/lib/utils"
import { Label, Plus } from "@/components/site/frame"
import { getPage, type Style } from "@/components/site/styles"

export function DocsSection({
  label,
  line = true,
  className,
  children,
}: {
  label?: string
  line?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("relative", line && "border-t border-(--rule)")}>
      {line && (
        <>
          <Plus side="left" className="lg:hidden" />
          <Plus side="right" />
        </>
      )}
      <div
        className={cn(
          "grid max-w-[962px] grid-cols-1 gap-5 px-3 py-10 sm:px-6 lg:px-14 lg:py-12",
          className
        )}
      >
        {label && <Label>{label}</Label>}
        {children}
      </div>
    </section>
  )
}

export function DocsHeader({
  href,
  lead,
  friction,
  children,
}: {
  href: string
  lead: string
  friction?: Style["friction"]
  children?: React.ReactNode
}) {
  const page = getPage(href)

  return (
    <DocsSection line={false} className="gap-8">
      <div className="grid gap-4">
        <Label className="text-(--mark-text)">
          Sheet {page?.sheet}{" "}
          <span className="text-(--ink-label)">· {page?.group}</span>
        </Label>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-[34px] leading-10 font-bold tracking-[-0.035em] lg:text-[44px] lg:leading-[52px]">
            {page?.title}
          </h1>
          {friction && <Friction value={friction} bordered />}
        </div>
        <p className="max-w-[640px] text-base leading-7 text-(--ink-muted) lg:text-lg lg:leading-8">
          {lead}
        </p>
      </div>
      {children}
    </DocsSection>
  )
}

export function Friction({
  value,
  bordered,
}: {
  value: string
  bordered?: boolean
}) {
  return (
    <Label
      className={cn(
        "shrink-0",
        bordered && "rounded-sm border border-(--rule) px-2 py-1",
        value === "high" && "text-(--mark-text)"
      )}
    >
      {value}
    </Label>
  )
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid max-w-[680px] gap-4 text-base leading-7 text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
      {children}
    </div>
  )
}

export function FramedList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "divide-y divide-(--rule) border border-(--rule)",
        className
      )}
    >
      {children}
    </div>
  )
}

export function StyleLink({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={`/docs/${slug}`}
      className="font-medium text-(--mark-text) underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
}
