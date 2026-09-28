"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesDestructive() {
  return (
    <Consequences
      variant="destructive"
      title="Closing your account permanently removes"
      items={[
        { label: "Databases", count: 3 },
        { label: "Teams you own", names: ["Platform", "Growth"] },
      ]}
      className="w-full max-w-sm"
    />
  )
}
