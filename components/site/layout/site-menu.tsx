"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { DocsNav } from "@/components/site/docs/nav"
import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { ThemeToggle } from "@/components/site/layout/theme-toggle"
import { siteButton } from "@/components/site/ui/button"
import {
  SiteDrawer,
  SiteDrawerContent,
  SiteDrawerTrigger,
} from "@/components/site/ui/drawer"
import { githubUrl } from "@/lib/site/config"
import type { Section } from "@/lib/site/docs"

export function SiteMenu({
  links,
  sections,
}: {
  links: { href: string; label: string; matches?: string[] }[]
  sections: Section[]
}) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <SiteDrawer open={open} onOpenChange={setOpen}>
      <SiteDrawerTrigger
        aria-label="Open menu"
        className={siteButton({ variant: "ghost", size: "icon" })}
      >
        <MenuIcon />
      </SiteDrawerTrigger>
      <SiteDrawerContent
        title="Menu"
        actions={
          <>
            <SiteLink
              href={githubUrl}
              aria-label="GitHub"
              className={siteButton({ variant: "ghost", size: "icon" })}
            >
              <GitHubIcon />
            </SiteLink>
            <ThemeToggle />
          </>
        }
        className="inset-x-0 w-full max-w-none border-r-0"
      >
        <div className="overflow-y-auto">
          <nav
            aria-label="Site"
            className="grid border-b border-(--rule) px-3 py-4"
          >
            {links.map((link) => {
              const current = (link.matches ?? [link.href]).includes(pathname)
              return (
                <SiteLink
                  key={link.label}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-2.75 py-2 text-base font-medium text-(--ink-muted) hover:text-(--ink)",
                    current && "text-(--ink)"
                  )}
                >
                  {link.label}
                </SiteLink>
              )
            })}
          </nav>
          <div className="px-3 py-6">
            <DocsNav sections={sections} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </SiteDrawerContent>
    </SiteDrawer>
  )
}
