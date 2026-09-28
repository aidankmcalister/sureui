"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label, tapTarget } from "@/components/site/layout/frame"
import { SiteButton } from "@/components/site/ui/button"

export function Cell({
  figure,
  gesture,
  href,
  title,
  description,
  featured,
  resettable,
  className,
  children,
}: {
  figure: number
  gesture: string
  href: string
  title: string
  description: string
  featured?: boolean
  resettable?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [run, setRun] = React.useState(0)

  return (
    <article
      className={cn(
        "flex flex-col bg-(--paper) px-3 py-6 sm:p-6",
        featured && "md:col-span-2",
        className
      )}
    >
      <div className="grid gap-1 pb-5">
        <div className="mb-2 flex min-h-4 items-center justify-between gap-3">
          <Label>
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
          {resettable && (
            <SiteButton
              variant="ghost"
              size="icon"
              aria-label="Reset example"
              title="Reset example"
              className="-my-2 -mr-2"
              onClick={() => setRun((count) => count + 1)}
            >
              <RotateCcwIcon />
            </SiteButton>
          )}
        </div>
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
      <div
        key={run}
        className="mt-auto border border-(--rule) bg-(--well) p-5 text-foreground"
      >
        {children}
      </div>
    </article>
  )
}
