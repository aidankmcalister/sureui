"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Label, Plus } from "@/components/site/layout/frame"
import type { Page, Section } from "@/lib/site/docs"

export function DocsNav({
  sections,
  onNavigate,
}: {
  sections: Section[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Docs pages" className="grid gap-7">
      {sections.map((section) => (
        <div key={section.folder} className="grid gap-1">
          <Label className="px-2.75 pb-2">{section.title}</Label>
          {section.pages.map((page) => {
            const current = pathname === page.href
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={current ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 border border-transparent px-2.5 py-2 text-sm text-(--ink-muted) hover:text-(--ink)",
                  current &&
                    "border-(--rule) bg-(--well) font-medium text-(--ink)"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px] text-(--ink-label)",
                    current && "text-(--mark-text)"
                  )}
                >
                  {page.sheet}
                </span>
                {page.title}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function DocsSidebar({ sections }: { sections: Section[] }) {
  return (
    <aside
      aria-label="Docs"
      className="hidden border-r border-(--rule) lg:block"
    >
      <div className="sticky top-0 max-h-svh overflow-y-auto px-4 py-6">
        <DocsNav sections={sections} />
      </div>
    </aside>
  )
}

export function DocsPager({ pages }: { pages: Page[] }) {
  const pathname = usePathname()
  const index = pages.findIndex((page) => page.href === pathname)
  const previous = pages[index - 1]
  const next = pages[index + 1]

  return (
    <nav className="relative grid gap-px border-t border-(--rule) bg-(--rule) sm:grid-cols-2">
      <Plus side="left" className="lg:hidden" />
      <Plus side="right" />
      {previous ? (
        <PagerLink page={previous} label="Previous" />
      ) : (
        <span className="hidden bg-(--paper) sm:block" />
      )}
      {next ? (
        <PagerLink page={next} label="Next" className="sm:text-right" />
      ) : (
        <span className="hidden bg-(--paper) sm:block" />
      )}
    </nav>
  )
}

function PagerLink({
  page,
  label,
  className,
}: {
  page: Page
  label: string
  className?: string
}) {
  return (
    <Link
      href={page.href}
      className={cn(
        "grid gap-2 bg-(--paper) px-3 py-8 hover:bg-(--well) sm:px-6 lg:px-14",
        className
      )}
    >
      <Label>
        {label} · <span className="text-(--mark-text)">{page.sheet}</span>
      </Label>
      <span className="font-display text-lg font-bold tracking-tight">
        {page.title}
      </span>
    </Link>
  )
}
