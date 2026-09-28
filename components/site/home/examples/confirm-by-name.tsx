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
      title="acme/legacy-api was deleted"
    >
      <TypeToConfirm
        phrase="acme/legacy-api"
        acknowledgements={[
          "I understand its issues and pull requests are deleted too.",
        ]}
        confirmLabel="Delete repository"
        onConfirm={() => setDeleted(true)}
        className="w-full"
      />
    </Outcome>
  )
}
