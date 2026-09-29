import Link from "next/link"

import { cn } from "@/lib/utils"
import { aboveMark, Label, tapTarget } from "@/components/site/layout/frame"
import {
  ResetContent,
  ResetScope,
  ResetTrigger,
} from "@/components/site/ui/reset"

export function Cell({
  gesture,
  href,
  title,
  description,
  featured,
  className,
  children,
}: {
  gesture: string
  href: string
  title: string
  description: string
  featured?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <ResetScope>
      <article
        className={cn(
          "flex flex-col bg-(--paper) px-3 py-6 sm:p-6",
          aboveMark,
          featured && "md:col-span-2",
          className
        )}
      >
        <div className="grid gap-1 pb-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "font-display font-bold tracking-tight text-(--ink)",
                featured ? "text-2xl leading-8" : "text-lg leading-7"
              )}
            >
              {title}
            </h3>
            <div className="flex shrink-0 items-center gap-3">
              <Label>
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
              <ResetTrigger className="-my-2 -mr-2" />
            </div>
          </div>
          <p className="text-sm leading-5 text-pretty text-(--ink-muted)">
            {description}
          </p>
        </div>
        <div className="mt-auto border border-(--rule) bg-(--well) p-5 text-foreground">
          <ResetContent>{children}</ResetContent>
        </div>
      </article>
    </ResetScope>
  )
}
