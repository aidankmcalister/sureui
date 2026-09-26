import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/site/copy-button"

export function Code({
  highlight = [],
  children,
}: {
  highlight?: number[]
  children: string
}) {
  return (
    <div className="relative rounded-[10px] border bg-background text-foreground">
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6">
        <code className="grid min-w-fit">
          {children.split("\n").map((line, index) => (
            <span
              key={index}
              className={cn(
                "min-h-6 pr-12 pl-4",
                highlight.includes(index + 1) &&
                  "border-l-2 border-(--mark) bg-(--mark)/10 pl-3.5"
              )}
            >
              {line}
            </span>
          ))}
        </code>
      </pre>
      <CopyButton value={children} className="absolute top-2.5 right-2.5" />
    </div>
  )
}

export function Command({ children }: { children: string }) {
  return (
    <div className="flex h-9 items-center justify-between gap-2 rounded-md border bg-background pr-1 pl-3 font-mono text-xs text-foreground">
      <span className="truncate">{children}</span>
      <CopyButton value={children} />
    </div>
  )
}
