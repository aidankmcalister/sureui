export function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm">
      <code>{children}</code>
    </pre>
  )
}
