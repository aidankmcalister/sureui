"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { Outcome } from "@/components/site/home/examples/outcome"

export function ConfirmByName() {
  const [deleted, setDeleted] = React.useState(false)

  return (
    <Outcome
      done={deleted}
      icon={<Trash2Icon />}
      title="acme-prod was deleted"
      onReset={() => setDeleted(false)}
    >
      <TypeToConfirm
        phrase="acme-prod"
        acknowledgements={["I understand active deployments will go offline."]}
        confirmLabel="Delete project"
        onConfirm={() => setDeleted(true)}
        className="w-full"
      />
    </Outcome>
  )
}
