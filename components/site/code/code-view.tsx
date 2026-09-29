import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/site/code/copy-button"
import { Label } from "@/components/site/layout/frame"

export type Token = {
  text: string
  color?: string
  italic?: boolean
  strong?: boolean
}

export function CodeView({
  lines,
  copy,
  label = "tsx",
  name = label,
  framed = true,
  collapsible = false,
  defaultOpen = true,
  bodyClassName,
}: {
  lines: Token[][]
  copy: string
  label?: string
  name?: string
  framed?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  bodyClassName?: string
}) {
  const labelNode = (
    <Label className={cn(label.includes(".") && "tracking-normal normal-case")}>
      {label}
    </Label>
  )
  const body = (
    <pre
      tabIndex={0}
      className={cn(
        "overflow-x-auto py-4 font-mono text-[13px] leading-6 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--mark)",
        bodyClassName
      )}
    >
      <code className="grid min-w-fit">
        {lines.map((line, index) => (
          <span key={index} className="min-h-6 px-4">
            {line.map((token, offset) => (
              <span
                key={offset}
                style={{
                  color: token.color,
                  fontStyle: token.italic ? "italic" : undefined,
                  fontWeight: token.strong ? 500 : undefined,
                }}
              >
                {token.text}
              </span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  )

  if (collapsible) {
    return (
      <div
        className={cn(
          "relative bg-(--well) text-(--code-foreground)",
          framed && "border border-(--rule)"
        )}
      >
        <details open={defaultOpen} className="group/code">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 pr-12 pl-3 group-open/code:border-b group-open/code:border-(--rule) hover:bg-(--rule)/30 [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon
              aria-hidden
              className="size-3.5 text-(--ink-label) transition-transform group-open/code:rotate-90"
            />
            {labelNode}
          </summary>
          {body}
        </details>
        <div className="absolute top-0 right-1.5 flex h-10 items-center">
          <CopyButton
            value={copy}
            track={{ event: "copy-code", data: { label: name } }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-(--well) text-(--code-foreground)",
        framed && "border border-(--rule)"
      )}
    >
      <div className="flex h-10 items-center justify-between border-b border-(--rule) pr-1.5 pl-4">
        {labelNode}
        <CopyButton
          value={copy}
          track={{ event: "copy-code", data: { label: name } }}
        />
      </div>
      {body}
    </div>
  )
}
