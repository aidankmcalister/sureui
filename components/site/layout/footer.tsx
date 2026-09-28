import Link from "next/link"

import { cn } from "@/lib/utils"
import { CheckMark } from "@/components/site/home/check-mark"
import {
  aboveMark,
  Band,
  Label,
  tapTarget,
} from "@/components/site/layout/frame"
import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { githubUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/docs"

const columns = [
  {
    title: "Docs",
    links: pages
      .filter((page) => page.group !== "Components")
      .map((page) => ({ href: page.href, label: page.title })),
  },
  {
    title: "Components",
    links: pages
      .filter((page) => page.group === "Components")
      .map((page) => ({ href: page.href, label: page.title })),
  },
  {
    title: "Resources",
    links: [
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/llms-full.txt", label: "llms-full.txt" },
      { href: "/r/registry.json", label: "registry.json" },
      { href: "/changelog", label: "Changelog" },
      { href: githubUrl, label: "GitHub" },
      { href: `${githubUrl}/issues`, label: "Issues" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative">
      <CheckMark />
      <Band
        className={cn(
          aboveMark,
          "grid grid-cols-2 gap-x-6 gap-y-10 px-3 py-12 sm:grid-cols-3 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:py-16"
        )}
      >
        <div className="col-span-full grid content-start gap-3 lg:col-span-1">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            SureUI<span className="text-(--mark-text)">.</span>
          </Link>
          <p className="max-w-64 text-sm leading-6 text-(--ink-muted)">
            Open source confirmation components for shadcn/ui.
          </p>
          <SiteLink
            href={githubUrl}
            aria-label="GitHub"
            className={cn(
              tapTarget,
              "mt-2 w-fit text-(--ink-label) hover:text-(--ink)"
            )}
          >
            <GitHubIcon className="size-4" />
          </SiteLink>
        </div>
        {columns.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className={cn(column.title === "Docs" && "max-sm:order-last")}
          >
            <Label>{column.title}</Label>
            <ul className="mt-4 grid gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <SiteLink
                    href={link.href}
                    className={cn(
                      tapTarget,
                      "text-sm text-(--ink-muted) hover:text-(--ink)"
                    )}
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Band>
      <Band
        className={cn(
          aboveMark,
          "flex flex-col gap-2 px-3 py-4 text-xs text-(--ink-label) sm:flex-row sm:justify-between sm:px-6"
        )}
      >
        <span>© 2026 SureUI · MIT licensed</span>
        <span>Built on shadcn/ui and Base UI</span>
      </Band>
    </footer>
  )
}
