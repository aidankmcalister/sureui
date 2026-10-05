"use client"

import { CheckIcon } from "lucide-react"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmButtonSuccess() {
  const { publish } = useActions({ publish: { wait: 1500 } })

  return (
    <ConfirmButton
      pendingLabel="Publishing"
      successLabel={
        <>
          <CheckIcon />
          Published
        </>
      }
      onConfirm={publish}
    >
      Publish
    </ConfirmButton>
  )
}
