"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonPending() {
  const control = useControl()
  const { deploy } = useActions({ deploy: { wait: control("wait", 2000) } })

  return <ConfirmButton onConfirm={deploy}>Deploy</ConfirmButton>
}
