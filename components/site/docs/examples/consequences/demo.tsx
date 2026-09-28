"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesDemo() {
  return (
    <Consequences
      title="Deleting acme-prod removes"
      items={[
        { label: "Deployments", count: 128 },
        {
          label: "Domains",
          count: 4,
          names: [
            "acme.com",
            "www.acme.com",
            "api.acme.com",
            "status.acme.com",
          ],
        },
        { label: "Environment variables", count: 23 },
      ]}
      className="w-full max-w-sm"
    />
  )
}
