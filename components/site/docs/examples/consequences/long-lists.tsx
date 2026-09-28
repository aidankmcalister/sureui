"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesLongLists() {
  return (
    <Consequences
      title="Deleting the Design team removes"
      items={[
        {
          label: "Members",
          names: [
            "Maya Chen",
            "Tom Okafor",
            "Priya Nair",
            "Lena Fischer",
            "Sam Rivera",
            "Jonas Berg",
          ],
        },
        { label: "Deployments", count: 128 },
      ]}
      className="w-full max-w-sm"
    />
  )
}
