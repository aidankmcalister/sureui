"use client"

import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmSwitchTimeLeft() {
  const { setAirplaneMode } = useActions()

  return (
    <ConfirmSwitch
      aria-label="Airplane mode"
      undoIndicator="ring"
      undoLabel={(seconds) => `${seconds}s to undo`}
      undoLabelSide="right"
      onConfirm={setAirplaneMode}
    />
  )
}
