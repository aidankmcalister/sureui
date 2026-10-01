import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  Band,
  Label,
  tapTarget,
  Wordmark,
} from "@/components/site/layout/frame"
import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { githubUrl } from "@/lib/site/config"
import { searchEntries, sections } from "@/lib/site/docs"
import { Search } from "@/components/site/layout/search"
import { SiteMenu } from "@/components/site/layout/site-menu"
import { ThemeToggle } from "@/components/site/layout/theme-toggle"
import { siteButton } from "@/components/site/ui/button"

const components = sections.find((section) => section.folder === "components")!

const links = [
  {
    href: "/docs",
    label: "Docs",
    matches: sections
      .filter((section) => section !== components)
      .flatMap((section) => section.pages.map((page) => page.href)),
  },
  {
    href: "/docs#components",
    label: "Components",
    matches: components.pages.map((page) => page.href),
  },
  { href: "/blocks", label: "Blocks" },
]

export function Header() {
  return (
    <header>
      <Band
        line={false}
        className="flex h-14 items-center gap-5 px-3 sm:px-6 lg:h-15"
      >
        <Link
          href="/"
          className="mr-auto font-display font-bold tracking-tight"
        >
          <Wordmark />
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              tapTarget,
              "hidden text-(--ink-muted) hover:text-(--ink) lg:flex"
            )}
          >
            <Label className="text-inherit">{link.label}</Label>
          </Link>
        ))}
        <div className="-mr-1 -ml-2 flex items-center gap-1 lg:ml-0">
          <Search entries={searchEntries()} />
          <SiteLink
            href={githubUrl}
            aria-label="GitHub"
            className={siteButton({
              variant: "ghost",
              size: "icon",
              className: "max-lg:hidden",
            })}
          >
            <GitHubIcon />
          </SiteLink>
          <ThemeToggle />
          <div className="lg:hidden">
            <SiteMenu
              sections={sections}
              links={[...links, { href: "/changelog", label: "Changelog" }]}
            />
          </div>
        </div>
      </Band>
    </header>
  )
}
