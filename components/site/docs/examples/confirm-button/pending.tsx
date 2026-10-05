"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonPending() {
  const control = useControl({ pendingIndicator: ["ring", "spinner", "pulse"] })
  const { deploy } = useActions({ deploy: { wait: control("wait", 2000) } })

  return (
    <ConfirmButton
      pendingIndicator={control("pendingIndicator", "ring")}
      pendingDelay={control("pendingDelay", 0)}
      pendingLabel="Deploying"
      onConfirm={deploy}
    >
      Deploy
    </ConfirmButton>
  )
}
