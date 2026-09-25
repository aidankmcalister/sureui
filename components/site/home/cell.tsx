import { cn } from "@/lib/utils"
import { Label } from "@/components/site/frame"

export function Cell({
  figure,
  gesture,
  title,
  description,
  featured,
  className,
  children,
}: {
  figure: number
  gesture: string
  title: string
  description: string
  featured?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 bg-(--paper) px-3 py-6 sm:p-6",
        featured && "md:col-span-2 lg:col-span-1 lg:row-span-2",
        className
      )}
    >
      <Label>
        Fig. {String(figure).padStart(2, "0")} · {gesture}
      </Label>
      <h3
        className={cn(
          "mt-2 font-semibold tracking-tight text-(--ink)",
          featured ? "text-[30px] leading-9" : "text-xl"
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-(--ink-muted)">{description}</p>
      <div className="mt-3 flex flex-1 items-center justify-center rounded-[10px] border bg-background p-3 text-foreground">
        {children}
      </div>
    </article>
  )
}
