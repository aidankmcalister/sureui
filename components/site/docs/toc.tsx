"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/site/layout/frame"
import type { Heading } from "@/lib/site/docs"

export function DocsToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = React.useState<string | undefined>(
    headings[0]?.id
  )

  React.useEffect(() => {
    function update() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      let current = headings[0]?.id
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top < 120) {
          current = heading.id
        }
      }
      setActive(bottom ? headings.at(-1)?.id : current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [headings])

  return (
    <nav aria-label="On this page" className="grid gap-3">
      <Label>On this page</Label>
      <ul className="grid border-l border-(--rule)">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l border-transparent py-1 pl-3 text-[13px] leading-5 wrap-break-word text-(--ink-muted) hover:text-(--ink)",
                heading.depth === 3 && "pl-6",
                active === heading.id &&
                  "border-(--mark) font-medium text-(--ink)"
              )}
            >
              {heading.text.replace(/\(.*\)$/, "")}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
