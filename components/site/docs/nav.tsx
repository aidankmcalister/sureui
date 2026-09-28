"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TableOfContentsIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label, Plus, tapTarget } from "@/components/site/layout/frame"
import { siteButton } from "@/components/site/ui/button"
import {
  SiteDrawer,
  SiteDrawerContent,
  SiteDrawerTrigger,
} from "@/components/site/ui/drawer"
import type { Page } from "@/lib/site/docs"

function DocsNav({
  pages,
  onNavigate,
}: {
  pages: Page[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const groups = [...new Set(pages.map((page) => page.group))]

  return (
    <nav className="grid gap-7">
      {groups.map((group) => (
        <div key={group} className="grid gap-1">
          <Label className="px-2.75 pb-2">{group}</Label>
          {pages
            .filter((page) => page.group === group)
            .map((page) => {
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

export function DocsSidebar({ pages }: { pages: Page[] }) {
  return (
    <aside className="hidden border-r border-(--rule) lg:block">
      <div className="sticky top-0 max-h-svh overflow-y-auto px-4 py-6">
        <DocsNav pages={pages} />
      </div>
    </aside>
  )
}

export function DocsBar({ pages }: { pages: Page[] }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const page = pages.find((item) => item.href === pathname)

  return (
    <div className="flex h-14 items-center justify-between gap-4 px-3 sm:px-6">
      <Label className="truncate">
        <span className="text-(--mark-text)">{page?.sheet}</span> ·{" "}
        {page?.title}
      </Label>
      <SiteDrawer open={open} onOpenChange={setOpen}>
        <SiteDrawerTrigger className={siteButton({ className: tapTarget })}>
          <TableOfContentsIcon aria-hidden />
          Contents
        </SiteDrawerTrigger>
        <SiteDrawerContent title="Contents">
          <div className="overflow-y-auto px-3 py-6">
            <DocsNav pages={pages} onNavigate={() => setOpen(false)} />
          </div>
        </SiteDrawerContent>
      </SiteDrawer>
    </div>
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
