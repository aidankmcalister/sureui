import Link from "next/link"

import { GitHubIcon } from "@/components/site/layout/github-icon"
import { SiteLink } from "@/components/site/layout/site-link"
import { siteButton } from "@/components/site/ui/button"
import { githubUrl } from "@/lib/site/config"

export function Actions() {
  return (
    <div className="flex gap-2">
      <Link
        href="/docs/installation"
        className={siteButton({ variant: "primary", size: "lg" })}
      >
        Get started
      </Link>
      <SiteLink
        href={githubUrl}
        aria-label="GitHub"
        className={siteButton({ size: "icon-lg" })}
      >
        <GitHubIcon />
      </SiteLink>
    </div>
  )
}
