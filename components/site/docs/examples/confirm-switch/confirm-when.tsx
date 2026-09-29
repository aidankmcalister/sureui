"use client"

import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmSwitchConfirmWhen() {
  const { setTwoFactor } = useActions()

  return (
    <ConfirmSwitch
      aria-label="Two-factor authentication"
      defaultChecked
      confirmWhen="off"
      onConfirm={setTwoFactor}
    />
  )
}
