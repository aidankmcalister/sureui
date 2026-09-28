import { Label } from "@/components/site/layout/frame"
import type { Page } from "@/lib/site/docs"

export function DocsHeader({ page }: { page: Page }) {
  return (
    <header className="grid max-w-240.5 gap-4 px-3 pt-10 pb-8 sm:px-6 lg:px-14 lg:pt-12">
      <Label className="text-(--mark-text)">
        Sheet {page.sheet}{" "}
        <span className="text-(--ink-label)">· {page.group}</span>
      </Label>
      <h1 className="font-display text-[34px] leading-10 font-bold tracking-[-0.04em] lg:text-[44px] lg:leading-13">
        {page.title}
      </h1>
      <p className="max-w-160 text-base leading-7 text-pretty text-(--ink-muted) lg:text-lg lg:leading-8">
        {page.description}
      </p>
    </header>
  )
}

export function InlineCode({ children }: { children: string }) {
  return children
    .split("`")
    .map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))
}
