"use client"

import { Consequences } from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmConsequences() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase="acme"
      consequences={
        <Consequences
          title="This deletes"
          items={[
            {
              label: "projects",
              count: 3,
              names: ["acme-prod", "acme-staging", "marketing-site"],
            },
            { label: "members", count: 14 },
            { label: "API keys", count: 2 },
          ]}
        />
      }
      confirmLabel="Delete organization"
      onConfirm={() => log("Deleted the acme organization")}
      className="w-full max-w-sm"
    />
  )
}
