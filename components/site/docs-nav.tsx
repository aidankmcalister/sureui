"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { families } from "@/components/site/families"

type DocsPage = { href: string; title: string; group: string }

const pages: DocsPage[] = [
  { href: "/docs", title: "Introduction", group: "Getting started" },
  {
    href: "/docs/installation",
    title: "Installation",
    group: "Getting started",
  },
  ...families.map((family) => ({
    href: `/docs/${family.slug}`,
    title: family.name,
    group: "Components",
  })),
]

const groups = [...new Set(pages.map((page) => page.group))]

export function DocsNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-6 text-sm">
      {groups.map((group) => (
        <div key={group} className="grid gap-1">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            {group}
          </p>
          {pages
            .filter((page) => page.group === group)
            .map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={cn(
                  "rounded-md px-2 py-1.5 text-muted-foreground hover:text-foreground",
                  pathname === page.href &&
                    "bg-muted font-medium text-foreground"
                )}
              >
                {page.title}
              </Link>
            ))}
        </div>
      ))}
    </nav>
  )
}

export function DocsPager() {
  const pathname = usePathname()
  const index = pages.findIndex((page) => page.href === pathname)
  const previous = pages[index - 1]
  const next = pages[index + 1]

  return (
    <nav className="grid grid-cols-2 gap-4">
      {previous ? <PagerLink page={previous} label="Previous" /> : <span />}
      {next && <PagerLink page={next} label="Next" className="text-right" />}
    </nav>
  )
}

function PagerLink({
  page,
  label,
  className,
}: {
  page: DocsPage
  label: string
  className?: string
}) {
  return (
    <Link
      href={page.href}
      className={cn(
        "grid gap-1 rounded-lg border p-4 hover:bg-muted/50",
        className
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{page.title}</span>
    </Link>
  )
}
