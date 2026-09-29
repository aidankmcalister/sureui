"use client"

import { Consequences } from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmConsequences() {
  const { deleteOrganization } = useActions()

  return (
    <TypeToConfirm
      phrase="acme"
      consequences={
        <Consequences
          title="This deletes"
          items={[
            {
              label: "Projects",
              count: 3,
              names: ["acme-prod", "acme-staging", "marketing-site"],
            },
            { label: "Members", count: 14 },
            { label: "API keys", count: 2 },
          ]}
        />
      }
      variant="destructive"
      confirmLabel="Delete organization"
      onConfirm={deleteOrganization}
      className="w-full max-w-sm"
    />
  )
}
