import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { DocsSection, DocsTitle } from "@/components/site/docs"
import { families } from "@/components/site/families"

export const metadata: Metadata = { title: "Introduction" }

export default function Introduction() {
  return (
    <>
      <DocsTitle
        title="Introduction"
        description="What SureUI is and which piece to reach for."
      />
      <div className="grid gap-4 leading-7">
        <p>
          SureUI is a set of confirmation components you add with the shadcn
          CLI. They&apos;re built on your own Button, Input and Checkbox, so
          they look like the rest of your app. Each one calls onConfirm when the
          person confirms, and your app decides what happens next.
        </p>
        <p>
          Pick the one that matches the risk of the action. Something you can
          reverse shouldn&apos;t interrupt anyone. Something permanent should
          make people stop and read. Only one of them is a dialog, and you never
          have to install it.
        </p>
      </div>
      <DocsSection title="Which one should I use?">
        <div className="divide-y border-y">
          {families.map((family) => (
            <Link
              key={family.slug}
              href={`/docs/${family.slug}`}
              className="flex items-center justify-between gap-4 py-3 hover:bg-muted/50"
            >
              <div className="grid gap-0.5">
                <span className="font-medium">{family.name}</span>
                <span className="text-sm text-muted-foreground">
                  {family.guidance}
                </span>
              </div>
              <Badge variant="outline">{family.friction}</Badge>
            </Link>
          ))}
        </div>
      </DocsSection>
    </>
  )
}
