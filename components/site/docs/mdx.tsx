import * as React from "react"

import { cn } from "@/lib/utils"
import { Code } from "@/components/site/code/code"
import { InstallCommand } from "@/components/site/code/install-command"
import { Chooser } from "@/components/site/docs/chooser"
import { Example } from "@/components/site/docs/example"
import { FramedTable } from "@/components/site/docs/framed-table"
import { Label, Plus } from "@/components/site/layout/frame"
import { SiteLink } from "@/components/site/layout/site-link"
import { slugify } from "@/lib/site/docs"

type Props<T extends React.ElementType> = React.ComponentProps<T>

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children)
  }
  return ""
}

function H2({ children }: Props<"h2">) {
  const id = slugify(textOf(children))

  return (
    <div id={id} className="docs-rule relative border-t border-(--rule)">
      <Plus side="left" className="lg:hidden" />
      <Plus side="right" />
      <h2>
        <a href={`#${id}`}>
          <Label>{children}</Label>
        </a>
      </h2>
    </div>
  )
}

function H3({ children }: Props<"h3">) {
  const id = slugify(textOf(children))

  return (
    <h3
      id={id}
      className="scroll-mt-8 font-display text-xl leading-7 font-bold tracking-tight [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:font-semibold [&_code]:tracking-normal"
    >
      <a href={`#${id}`}>{children}</a>
    </h3>
  )
}

function P({ children }: Props<"p">) {
  return (
    <p className="max-w-160 text-base leading-7 text-pretty text-(--ink-muted)">
      {children}
    </p>
  )
}

function Ul({ children }: Props<"ul">) {
  return (
    <ul className="grid max-w-160 list-disc gap-2 pl-5 text-base leading-7 text-pretty text-(--ink-muted) marker:text-(--ink-label)">
      {children}
    </ul>
  )
}

function A({ href = "", children }: Props<"a">) {
  return (
    <SiteLink
      href={href}
      className="font-medium text-(--ink) underline decoration-(--rule) underline-offset-4 hover:decoration-(--ink)"
    >
      {children}
    </SiteLink>
  )
}

function InlineCode({ children }: Props<"code">) {
  return <code className="font-mono text-[0.9em] text-(--ink)">{children}</code>
}

function Pre({ children }: Props<"pre">) {
  const code = React.isValidElement<{
    className?: string
    children?: React.ReactNode
  }>(children)
    ? children.props
    : {}
  const lang =
    code.className?.replace("language-", "") === "json" ? "json" : "tsx"

  return <Code lang={lang}>{textOf(code.children).trimEnd()}</Code>
}

function cellsOf(row: React.ReactNode) {
  return React.Children.toArray(
    React.isValidElement<{ children?: React.ReactNode }>(row)
      ? row.props.children
      : null
  ).filter(React.isValidElement<{ children?: React.ReactNode }>)
}

function rowsOf(section: React.ReactNode) {
  return React.Children.toArray(
    React.isValidElement<{ children?: React.ReactNode }>(section)
      ? section.props.children
      : null
  ).filter(React.isValidElement)
}

function unwrap(node: React.ReactNode) {
  const parts = React.Children.toArray(node)
  const only = parts[0]
  return parts.length === 1 &&
    React.isValidElement<{ children?: React.ReactNode }>(only) &&
    only.type === InlineCode
    ? only.props.children
    : node
}

const propColumns = [
  {
    width: "30%",
    className: "font-mono text-[13px] font-medium text-(--ink)",
  },
  {
    width: "45%",
    className: "font-mono text-[13px] text-(--code-attribute)",
  },
  {
    width: "25%",
    className: "font-mono text-[13px] text-(--ink-muted)",
  },
]

function Table({ children }: Props<"table">) {
  const [head, body] = React.Children.toArray(children)
  const labels = rowsOf(head)
    .flatMap(cellsOf)
    .map((cell) => textOf(cell))
  const isProps = labels.join() === "Prop,Type,Default"
  const columns = labels
    .map((label, index) => ({
      label,
      ...(isProps
        ? propColumns[index]
        : index === 0
          ? {
              width: "30%",
              className: "font-mono text-[13px] font-medium text-(--ink)",
            }
          : {
              width: `${70 / (labels.length - 1)}%`,
              className: "text-sm text-(--ink-muted)",
            }),
    }))
    .map((column) => ({
      ...column,
      className: cn(
        column.className,
        column.className.includes("font-mono") &&
          "[&_code]:text-[1em] [&_code]:text-inherit"
      ),
    }))

  return (
    <FramedTable
      columns={columns}
      rows={rowsOf(body).map((row, index) => ({
        key: String(index),
        cells: cellsOf(row).map((cell, column) => {
          const content = unwrap(cell.props.children)
          return isProps && column === 2 ? (
            <span
              className={cn(
                textOf(content) === "required" && "text-(--mark-text)"
              )}
            >
              {content}
            </span>
          ) : (
            content
          )
        }),
      }))}
    />
  )
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: P,
  ul: Ul,
  a: A,
  code: InlineCode,
  pre: Pre,
  table: Table,
  Example,
  Install: InstallCommand,
  Chooser,
}
