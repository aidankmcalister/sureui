import type { Metadata } from "next"
import Link from "next/link"

import { Band, PageLead, PageTitle } from "@/components/site/layout/frame"
import { siteButton } from "@/components/site/ui/button"
import { TrackNotFound } from "@/components/site/layout/track-not-found"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <main
      id="content"
      tabIndex={-1}
      className="flex flex-1 flex-col outline-none"
    >
      <TrackNotFound />
      <Band
        grow
        className="grid content-center gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <PageTitle>
          <span className="block text-(--mark)">404</span>
          This page doesn&apos;t exist.
        </PageTitle>
        <PageLead>
          The link may be out of date, or the address may have a typo.
        </PageLead>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/docs"
            className={siteButton({ variant: "primary", size: "lg" })}
          >
            Read the docs
          </Link>
          <Link href="/" className={siteButton({ size: "lg" })}>
            Go home
          </Link>
        </div>
      </Band>
    </main>
  )
}
