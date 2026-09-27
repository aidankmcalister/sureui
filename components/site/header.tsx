import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Band, Label, tapTarget } from "@/components/site/frame"
import { GitHubIcon } from "@/components/site/github-icon"
import { SiteLink } from "@/components/site/site-link"
import { githubUrl } from "@/components/site/styles"
import { ThemeToggle } from "@/components/site/theme-toggle"

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/blocks", label: "Blocks" },
]

export function Header() {
  return (
    <Band
      line={false}
      className="flex h-14 items-center gap-5 px-3 sm:px-6 lg:h-[60px]"
    >
      <Link href="/" className="mr-auto font-display font-bold tracking-tight">
        SureUI<span className="text-(--mark-text)">.</span>
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            tapTarget,
            "flex text-(--ink-muted) hover:text-(--ink)"
          )}
        >
          <Label className="text-inherit">{link.label}</Label>
        </Link>
      ))}
      <div className="-mr-1 -ml-2 flex items-center">
        <SiteLink
          href={githubUrl}
          aria-label="GitHub"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <GitHubIcon />
        </SiteLink>
        <ThemeToggle />
      </div>
    </Band>
  )
}
