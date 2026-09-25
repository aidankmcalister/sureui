import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Band } from "@/components/site/frame"
import { GitHubIcon } from "@/components/site/github-icon"
import { SiteLink } from "@/components/site/site-link"
import { githubUrl } from "@/components/site/styles"
import { ThemeToggle } from "@/components/site/theme-toggle"

export function Header() {
  return (
    <Band
      line={false}
      className="flex h-14 items-center gap-5 px-3 sm:px-6 lg:h-[60px] lg:px-10"
    >
      <Link href="/" className="mr-auto font-semibold tracking-tight">
        SureUI<span className="text-(--mark-text)">.</span>
      </Link>
      <Link
        href="/docs"
        className="font-mono text-[11px] tracking-[0.1em] text-(--ink-muted) uppercase hover:text-(--ink)"
      >
        Docs
      </Link>
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
