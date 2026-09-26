import type { Metadata } from "next"

import { Actions } from "@/components/site/actions"
import { Band } from "@/components/site/frame"

export const metadata: Metadata = { title: "Blocks" }

export default function Blocks() {
  return (
    <main className="flex flex-1 flex-col">
      <Band
        grow
        className="grid content-center gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-6xl sm:leading-[64px] lg:text-[64px] lg:leading-[68px]">
          <span className="block text-(--mark)">Blocks</span>
          coming soon.
        </h1>
        <p className="max-w-[560px] text-[19px] leading-[30px] text-(--ink-muted)">
          Full sections built from SureUI components, like a settings danger
          zone or an account deletion flow, ready to drop into your app.
        </p>
        <Actions />
      </Band>
    </main>
  )
}
