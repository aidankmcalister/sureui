import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { GitHubIcon } from "@/components/site/github-icon"
import { SiteLink } from "@/components/site/site-link"
import { githubUrl } from "@/components/site/styles"

export function Actions() {
  return (
    <div className="flex gap-2">
      <Link
        href="/docs/installation"
        className={buttonVariants({ size: "lg" })}
      >
        Get started
      </Link>
      <SiteLink
        href={githubUrl}
        aria-label="GitHub"
        className={buttonVariants({ variant: "outline", size: "icon-lg" })}
      >
        <GitHubIcon />
      </SiteLink>
    </div>
  )
}
