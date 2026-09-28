"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmSwitchDemo() {
  const log = useLog()

  async function saveTwoFactor(enabled: boolean) {
    await wait(600)
    log(enabled ? "Turned on two-factor" : "Turned off two-factor")
  }

  return (
    <div className="flex items-center gap-2">
      <ConfirmSwitch
        id="two-factor"
        defaultChecked
        onConfirm={saveTwoFactor}
        onCancel={() => log("Disarmed, still on")}
      />
      <Label htmlFor="two-factor">Two-factor authentication</Label>
    </div>
  )
}
