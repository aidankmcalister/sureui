import Link from "next/link"

import { cn } from "@/lib/utils"
import { Band, Label, tapTarget } from "@/components/site/layout/frame"
import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { githubUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/docs"
import { SiteMenu } from "@/components/site/layout/site-menu"
import { ThemeToggle } from "@/components/site/layout/theme-toggle"
import { siteButton } from "@/components/site/ui/button"

const firstComponent = pages.find((page) => page.section === "components")

const sections: Record<string, string[]> = {
  Docs: pages
    .filter((page) => page.section !== "components")
    .map((page) => page.href),
  Components: pages
    .filter((page) => page.section === "components")
    .map((page) => page.href),
}

const links = [
  { href: "/docs", label: "Docs" },
  { href: firstComponent?.href ?? "/docs", label: "Components" },
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
          SureUI<span className="text-(--mark-text)">.</span>
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
        <div className="-mr-1 -ml-2 flex items-center">
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
              pages={pages}
              links={[
                ...links.map((link) => ({
                  ...link,
                  matches: sections[link.label],
                })),
                { href: "/changelog", label: "Changelog" },
              ]}
            />
          </div>
        </div>
      </Band>
    </header>
  )
}
