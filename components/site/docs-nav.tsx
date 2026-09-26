"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label, Plus } from "@/components/site/frame"
import { getPage, pages, type Page } from "@/components/site/styles"

const groups = [...new Set(pages.map((page) => page.group))]

function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="grid gap-7">
      {groups.map((group) => (
        <div key={group} className="grid gap-1">
          <Label className="px-[11px] pb-2">{group}</Label>
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
                    "flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-sm text-(--ink-muted) hover:text-(--ink)",
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

export function DocsSidebar() {
  return (
    <aside className="hidden border-r border-(--rule) lg:block">
      <div className="sticky top-0 max-h-svh overflow-y-auto px-4 py-6">
        <DocsNav />
      </div>
    </aside>
  )
}

export function DocsBar() {
  const [open, setOpen] = React.useState(false)
  const page = getPage(usePathname())

  return (
    <div className="flex h-14 items-center justify-between gap-4 px-3 sm:px-6">
      <Label className="truncate">
        <span className="text-(--mark-text)">{page?.sheet}</span> ·{" "}
        {page?.title}
      </Label>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" size="sm" />}>
          Contents
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Contents</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <DocsNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function DocsPager() {
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
