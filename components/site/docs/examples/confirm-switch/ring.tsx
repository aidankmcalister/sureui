"use client"

import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmSwitchRing() {
  const { setBetaFeatures } = useActions()

  return (
    <ConfirmSwitch
      aria-label="Beta features"
      undoIndicator="ring"
      onConfirm={setBetaFeatures}
    />
  )
}
