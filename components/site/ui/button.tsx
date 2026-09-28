import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const siteButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-mono tracking-widest uppercase transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mark) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-(--ink) text-(--paper) hover:bg-(--mark-text)",
        outline:
          "border border-(--rule) bg-(--well) text-(--ink) hover:border-(--ink-label)",
        ghost: "text-(--ink-muted) hover:bg-(--well) hover:text-(--ink)",
      },
      size: {
        lg: "h-10 px-4 text-xs [&_svg:not([class*='size-'])]:size-4",
        sm: "h-8 px-3 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: { variant: "outline", size: "sm" },
  }
)

type SiteButtonVariants = VariantProps<typeof siteButtonVariants>

function siteButton(options: SiteButtonVariants & { className?: string } = {}) {
  const { className, ...variants } = options
  return cn(siteButtonVariants(variants), className)
}

function SiteButton({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & SiteButtonVariants) {
  return (
    <button
      type={type}
      className={siteButton({ variant, size, className })}
      {...props}
    />
  )
}

export { SiteButton, siteButton }
