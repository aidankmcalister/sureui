import { cn } from "@/lib/utils"

export function Plus({
  side,
  className,
}: {
  side: "left" | "right"
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 9 9"
      className={cn(
        "absolute -top-1.25 size-2.25 text-(--mark)",
        side === "left" ? "-left-1.25" : "-right-1.25",
        className
      )}
    >
      <path d="M4.5 0v9M0 4.5h9" stroke="currentColor" />
    </svg>
  )
}

export const tapTarget = "relative after:absolute after:-inset-2"

export const aboveMark = "[&>:not(svg)]:relative [&>:not(svg)]:z-2"

export function Band({
  line = true,
  grow,
  className,
  children,
}: {
  line?: boolean
  grow?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "px-3 md:px-6",
        line && "border-t border-(--rule)",
        grow && "flex flex-1 flex-col"
      )}
    >
      <div
        className={cn(
          "relative mx-auto w-full max-w-330 border-x border-(--rule)",
          grow && "flex-1",
          className
        )}
      >
        {line && (
          <>
            <Plus side="left" />
            <Plus side="right" />
          </>
        )}
        {children}
      </div>
    </div>
  )
}

export function Label({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] leading-4 tracking-widest text-(--ink-label) uppercase",
        className
      )}
    >
      {children}
    </span>
  )
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
      {children}
    </h1>
  )
}

export function PageLead({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        "max-w-140 text-[19px] leading-7.5 text-pretty text-(--ink-muted)",
        className
      )}
    >
      {children}
    </p>
  )
}

export function Wordmark() {
  return (
    <>
      SureUI<span className="text-(--mark-text)">.</span>
    </>
  )
}
