import type { Metadata } from "next"

import { families } from "@/components/site/families"
import { FamilyCard } from "@/components/site/family-card"
import { Page } from "@/components/site/page"

export const metadata: Metadata = { title: "Which one should I use?" }

export default function WhichOne() {
  return (
    <Page
      title="Which one should I use?"
      description="Match the friction to the cost of a mistake. Too little and people lose work. Too much and they learn to click through without reading."
    >
      <div className="grid gap-4">
        {families.map((family) => (
          <FamilyCard key={family.slug} family={family}>
            <p className="text-sm">{family.guidance}</p>
          </FamilyCard>
        ))}
      </div>
    </Page>
  )
}
