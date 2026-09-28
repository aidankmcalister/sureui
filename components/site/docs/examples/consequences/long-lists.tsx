"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesLongLists() {
  return (
    <Consequences
      title="Deleting the design team removes"
      items={[
        {
          label: "members",
          count: 14,
          names: [
            "Maya Chen",
            "Tom Okafor",
            "Priya Nair",
            "Lena Fischer",
            "Sam Rivera",
            "Jonas Berg",
          ],
        },
        {
          label: "projects",
          count: 5,
          names: [
            "brand-refresh",
            "icons",
            "marketing-site",
            "onboarding",
            "pricing-page",
          ],
          expandable: false,
        },
      ]}
      className="w-full max-w-sm"
    />
  )
}
