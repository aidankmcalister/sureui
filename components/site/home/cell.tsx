import Link from "next/link"

import { cn } from "@/lib/utils"
import { Label, tapTarget } from "@/components/site/layout/frame"

export function Cell({
  figure,
  gesture,
  href,
  title,
  description,
  featured,
  className,
  children,
}: {
  figure: number
  gesture: string
  href: string
  title: string
  description: string
  featured?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <article
      className={cn(
        "flex flex-col bg-(--paper) px-3 py-6 sm:p-6",
        featured && "md:col-span-2",
        className
      )}
    >
      <div className="grid gap-1 pb-5">
        <Label className="mb-2">
          Fig. {String(figure).padStart(2, "0")} ·{" "}
          <Link
            href={href}
            className={cn(
              tapTarget,
              "underline-offset-4 hover:text-(--ink) hover:underline"
            )}
          >
            {gesture}
          </Link>
        </Label>
        <h3
          className={cn(
            "font-display font-bold tracking-tight text-(--ink)",
            featured ? "text-2xl leading-8" : "text-lg leading-7"
          )}
        >
          {title}
        </h3>
        <p className="text-sm leading-5 text-pretty text-(--ink-muted)">
          {description}
        </p>
      </div>
      <div className="mt-auto border border-(--rule) bg-(--well) p-5 text-foreground">
        {children}
      </div>
    </article>
  )
}
