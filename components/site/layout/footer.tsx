import { cn } from "@/lib/utils"
import { Band, tapTarget } from "@/components/site/layout/frame"
import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { githubUrl } from "@/lib/site/config"

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: `${githubUrl}/issues`, label: "Issues" },
]

export function Footer() {
  return (
    <Band className="flex flex-col-reverse gap-2 px-3 py-4 text-xs text-(--ink-label) sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span>© 2026 SureUI · MIT licensed · Built on shadcn/ui</span>
      <nav className="flex items-center gap-4">
        {links.map((link) => (
          <SiteLink
            key={link.label}
            href={link.href}
            className={cn(tapTarget, "hover:text-(--ink)")}
          >
            {link.label}
          </SiteLink>
        ))}
        <SiteLink
          href={githubUrl}
          aria-label="GitHub"
          className={cn(tapTarget, "hover:text-(--ink)")}
        >
          <GitHubIcon className="size-4" />
        </SiteLink>
      </nav>
    </Band>
  )
}
