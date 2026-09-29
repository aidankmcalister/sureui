"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ConsequencesVariant = "default" | "destructive"

function mutedText(variant?: ConsequencesVariant) {
  return variant === "destructive"
    ? "text-[color-mix(in_oklab,var(--muted-foreground)_85%,var(--foreground))]"
    : "text-muted-foreground"
}

interface ConsequencesListOptions {
  limit?: number
  expandable?: boolean
  moreLabel?: (hidden: number) => string
  lessLabel?: string
}

interface Consequence extends ConsequencesListOptions {
  label: React.ReactNode
  count?: number
  names?: string[]
  icon?: React.ReactNode
  description?: React.ReactNode
}

interface ConsequencesItemProps
  extends Omit<React.ComponentProps<"li">, "children">, Consequence {}

interface ConsequencesProps
  extends Omit<React.ComponentProps<"div">, "title">, ConsequencesListOptions {
  subject?: React.ReactNode
  subjectDescription?: React.ReactNode
  title?: React.ReactNode
  items?: Consequence[]
  variant?: "default" | "destructive"
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

function Consequences(props: ConsequencesProps) {
  const {
    subject,
    subjectDescription,
    title,
    items,
    variant = "default",
    limit = defaults.limit,
    expandable = defaults.expandable,
    moreLabel = defaults.moreLabel,
    lessLabel = defaults.lessLabel,
    className,
    children,
    ...rest
  } = props
  const titleId = React.useId()

  return (
    <ConsequencesContext.Provider
      value={{ limit, expandable, moreLabel, lessLabel, variant }}
    >
      <div
        data-slot="consequences"
        data-variant={variant}
        className={cn(
          "overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10",
          variant === "destructive" &&
            "bg-destructive/3 ring-destructive/20 dark:bg-destructive/5",
          className
        )}
        {...rest}
      >
        {subject && (
          <div
            data-slot="consequences-subject"
            className="grid gap-0.5 border-b px-3 py-2.5"
          >
            <div className="leading-5 font-medium break-words">{subject}</div>
            {subjectDescription && (
              <div
                className={cn(
                  "text-xs leading-4 text-pretty",
                  mutedText(variant)
                )}
              >
                {subjectDescription}
              </div>
            )}
          </div>
        )}
        {title && (
          <div
            id={titleId}
            data-slot="consequences-title"
            className={cn(
              "border-b bg-muted/50 px-3 py-2 font-medium",
              variant === "destructive" &&
                "border-destructive/15 bg-destructive/10 text-[color-mix(in_oklab,var(--destructive)_80%,var(--foreground))] dark:bg-destructive/20"
            )}
          >
            {title}
          </div>
        )}
        <ul
          role="list"
          data-slot="consequences-list"
          aria-labelledby={title ? titleId : undefined}
          className={cn(
            "divide-y",
            variant === "destructive" && "divide-destructive/12"
          )}
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

function ConsequencesItem(props: ConsequencesItemProps) {
  const {
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
    ...rest
  } = props
  const context = React.useContext(ConsequencesContext)
  const [expanded, setExpanded] = React.useState(false)
  const namesId = React.useId()
  const max = Math.max(0, limit ?? context.limit)
  const canExpand = (expandable ?? context.expandable) && names.length > max
  const shown = expanded ? names : names.slice(0, max)
  const hidden =
    names.length > 0 ? Math.max(count ?? 0, names.length) - shown.length : 0
  const more = moreLabel ?? context.moreLabel

  const total = count ?? (names.length > 0 ? names.length : undefined)
  const hasNames = shown.length > 0 || hidden > 0

  return (
    <li
      data-slot="consequences-item"
      className={cn(
        "grid gap-x-3 gap-y-0.5 px-3 py-2.5",
        icon
          ? "grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid-cols-[minmax(0,1fr)_auto]",
        className
      )}
      {...rest}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "col-start-1 row-span-3 row-start-1 flex h-5 items-center text-muted-foreground [&_svg]:size-4",
            context.variant === "destructive" && "text-destructive"
          )}
        >
          {icon}
        </span>
      )}
      <span className={cn("leading-5", icon ? "col-start-2" : "col-start-1")}>
        {label}
      </span>
      {total !== undefined && (
        <span
          data-slot="consequences-count"
          className={cn(
            "row-start-1 text-right leading-5 font-medium tabular-nums",
            icon ? "col-start-3" : "col-start-2"
          )}
        >
          <span className="sr-only">, </span>
          {total}
        </span>
      )}
      {hasNames && <span className="sr-only">: </span>}
      {hasNames && (
        <span
          id={namesId}
          data-slot="consequences-names"
          className={cn(
            "text-xs leading-4 text-pretty break-words",
            mutedText(context.variant),
            icon ? "col-start-2" : "col-start-1"
          )}
        >
          {shown.map((name, index) => (
            <React.Fragment key={index}>
              {index > 0 && ", "}
              <span className="whitespace-nowrap">{name}</span>
            </React.Fragment>
          ))}
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
                className="rounded-sm py-1 font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => setExpanded((open) => !open)}
              >
                {expanded ? (lessLabel ?? context.lessLabel) : more(hidden)}
              </button>
            </>
          )}
        </span>
      )}
      {description && (
        <span
          className={cn(
            "text-xs leading-4 text-pretty",
            mutedText(context.variant),
            icon ? "col-start-2" : "col-start-1"
          )}
        >
          {description}
        </span>
      )}
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
