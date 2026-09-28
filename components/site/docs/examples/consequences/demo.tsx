"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesDemo() {
  return (
    <Consequences
      title="Deleting acme-prod removes"
      items={[
        { label: "deployments", count: 128 },
        {
          label: "domains",
          count: 4,
          names: [
            "acme.com",
            "www.acme.com",
            "api.acme.com",
            "status.acme.com",
          ],
        },
        { label: "environment variables", count: 23 },
      ]}
      className="w-full max-w-sm"
    />
  )
}
