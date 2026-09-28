import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Band } from "@/components/site/frame"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <Band
        grow
        className="grid content-center gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
          <span className="block text-(--mark)">404</span>
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-140 text-[19px] leading-7.5 text-pretty text-(--ink-muted)">
          The link may be out of date, or the address has a typo. The docs and
          the home page are both a click away.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/docs" className={buttonVariants({ size: "lg" })}>
            Read the docs
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Go home
          </Link>
        </div>
      </Band>
    </main>
  )
}
