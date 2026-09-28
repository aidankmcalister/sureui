import { Label } from "@/components/site/layout/frame"

export function Figure({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <figure className="border border-(--rule) bg-(--well) text-foreground">
      <figcaption className="flex h-10 items-center justify-end border-b border-(--rule) px-4">
        <Label>{label}</Label>
      </figcaption>
      <div className="flex min-h-48 items-center justify-center p-6">
        {children}
      </div>
    </figure>
  )
}
