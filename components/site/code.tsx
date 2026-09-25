import { CopyButton } from "@/components/site/copy-button"

export function Code({ children }: { children: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 pr-12 font-mono text-sm">
        <code>{children}</code>
      </pre>
      <CopyButton value={children} className="absolute top-2.5 right-2.5" />
    </div>
  )
}
