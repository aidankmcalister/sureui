import Link from "next/link"

import type { Family } from "@/components/site/families"

export function FamilyCard({
  family,
  children,
}: {
  family: Family
  children: React.ReactNode
}) {
  return (
    <div className="grid content-start gap-4 rounded-xl border p-4">
      <div className="grid gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={`/docs/${family.slug}`}
            className="font-medium hover:underline"
          >
            {family.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {family.friction} friction
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{family.useFor}</p>
      </div>
      {children}
    </div>
  )
}
