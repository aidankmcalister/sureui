"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesChanges() {
  return (
    <Consequences
      title="On October 29"
      items={[
        { label: "Plan", from: "Pro", to: "Free" },
        {
          label: "Seats",
          from: 5,
          to: 1,
          description: "Only you keep access.",
        },
        {
          label: "Projects",
          from: 12,
          to: 3,
          description: "The other 9 become read-only.",
        },
      ]}
      className="w-full max-w-sm"
    />
  )
}
