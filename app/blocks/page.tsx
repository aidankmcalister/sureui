import type { Metadata } from "next"

import { Actions } from "@/components/site/layout/actions"
import { Band } from "@/components/site/layout/frame"

export const metadata: Metadata = { title: "Blocks" }

export default function Blocks() {
  return (
    <main className="flex flex-1 flex-col">
      <Band
        grow
        className="grid content-center gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
          <span className="block text-(--mark)">Blocks</span>
          coming soon.
        </h1>
        <p className="max-w-140 text-[19px] leading-7.5 text-pretty text-(--ink-muted)">
          Ready-made sections built from SureUI components, like a settings
          danger zone or an account deletion flow. You&apos;ll add them with the
          shadcn CLI, the same way as the components.
        </p>
        <Actions />
      </Band>
    </main>
  )
}
