"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchConfirmWhen() {
  const log = useLog()

  return (
    <div className="flex items-center gap-3">
      <ConfirmSwitch
        id="two-factor"
        defaultChecked
        confirmWhen="off"
        onConfirm={(checked) =>
          log(checked ? "Turned on two-factor" : "Turned off two-factor")
        }
        onCancel={() => log("Undone, two-factor stays on")}
      />
      <Label htmlFor="two-factor">Two-factor authentication</Label>
    </div>
  )
}
