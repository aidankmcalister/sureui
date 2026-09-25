import { Badge } from "@/components/ui/badge"

export function DocsTitle({
  title,
  description,
  badge,
}: {
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {badge && <Badge variant="outline">{badge}</Badge>}
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export function DocsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}
