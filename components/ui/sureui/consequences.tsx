"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ConsequencesVariant = "default" | "destructive"

type ConsequencesListOptions = {
  limit?: number
  expandable?: boolean
  moreLabel?: (hidden: number) => string
  lessLabel?: string
}

type Consequence = ConsequencesListOptions & {
  label: React.ReactNode
  count?: number
  names?: string[]
  icon?: React.ReactNode
  description?: React.ReactNode
}

type ConsequencesItemProps = Omit<React.ComponentProps<"li">, "children"> &
  Consequence

type ConsequencesProps = Omit<React.ComponentProps<"div">, "title"> &
  ConsequencesListOptions & {
    title?: React.ReactNode
    items?: Consequence[]
    variant?: ConsequencesVariant
    children?: React.ReactNode
  }

const defaults = {
  limit: 3,
  expandable: true,
  moreLabel: (hidden: number) => `and ${hidden} more`,
  lessLabel: "Show less",
}

const ConsequencesContext = React.createContext<
  Required<ConsequencesListOptions> & { variant: ConsequencesVariant }
>({ ...defaults, variant: "default" })

function Consequences({
  title,
  items,
  variant = "default",
  limit = defaults.limit,
  expandable = defaults.expandable,
  moreLabel = defaults.moreLabel,
  lessLabel = defaults.lessLabel,
  className,
  children,
  ...props
}: ConsequencesProps) {
  const titleId = React.useId()

  return (
    <ConsequencesContext.Provider
      value={{ limit, expandable, moreLabel, lessLabel, variant }}
    >
      <div
        data-slot="consequences"
        data-variant={variant}
        className={cn(
          "grid gap-3 rounded-lg border bg-muted/50 p-4 text-sm",
          variant === "destructive" &&
            "border-destructive/30 bg-destructive/5 dark:bg-destructive/10",
          className
        )}
        {...props}
      >
        {title && (
          <div
            id={titleId}
            data-slot="consequences-title"
            className={cn(
              "leading-snug font-medium text-muted-foreground",
              variant === "destructive" && "text-destructive"
            )}
          >
            {title}
          </div>
        )}
        <ul
          role="list"
          data-slot="consequences-list"
          aria-labelledby={title ? titleId : undefined}
          className="grid gap-3"
        >
          {items?.map((item, index) => (
            <ConsequencesItem key={index} {...item} />
          ))}
          {children}
        </ul>
      </div>
    </ConsequencesContext.Provider>
  )
}

function ConsequencesItem({
  label,
  count,
  names = [],
  icon,
  description,
  limit,
  expandable,
  moreLabel,
  lessLabel,
  className,
  ...props
}: ConsequencesItemProps) {
  const context = React.useContext(ConsequencesContext)
  const [expanded, setExpanded] = React.useState(false)
  const namesId = React.useId()
  const max = Math.max(0, limit ?? context.limit)
  const canExpand = (expandable ?? context.expandable) && names.length > max
  const shown = expanded ? names : names.slice(0, max)
  const hidden =
    names.length > 0 ? Math.max(count ?? 0, names.length) - shown.length : 0
  const more = moreLabel ?? context.moreLabel

  return (
    <li
      data-slot="consequences-item"
      className={cn("flex gap-3", className)}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex shrink-0 text-muted-foreground [&_svg]:size-4",
            context.variant === "destructive" && "text-destructive"
          )}
        >
          {icon}
        </span>
      )}
      <div className="grid min-w-0 content-start gap-0.5">
        <span className="font-medium tabular-nums">
          {count !== undefined && <>{count} </>}
          {label}
          {(shown.length > 0 || hidden > 0) && (
            <span className="sr-only">:</span>
          )}
        </span>
        {(shown.length > 0 || hidden > 0) && (
          <span
            id={namesId}
            data-slot="consequences-names"
            className="text-pretty break-words text-muted-foreground"
          >
            {shown.join(", ")}
            {hidden > 0 &&
              !(canExpand && !expanded) &&
              `${shown.length > 0 ? " " : ""}${more(hidden)}`}
            {canExpand && (
              <>
                {" "}
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={namesId}
                  className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  onClick={() => setExpanded((open) => !open)}
                >
                  {expanded ? (lessLabel ?? context.lessLabel) : more(hidden)}
                </button>
              </>
            )}
          </span>
        )}
        {description && (
          <span className="text-pretty text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    </li>
  )
}

export {
  Consequences,
  ConsequencesItem,
  type Consequence,
  type ConsequencesItemProps,
  type ConsequencesProps,
}
