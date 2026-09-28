"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchConfirmWhen() {
  const log = useLog()

  return (
    <div className="flex items-center gap-2">
      <ConfirmSwitch
        id="maintenance-mode"
        confirmWhen="on"
        onConfirm={(on) =>
          log(on ? "Store is in maintenance mode" : "Store is back online")
        }
        onCancel={() => log("Disarmed, store still online")}
      />
      <Label htmlFor="maintenance-mode">Maintenance mode</Label>
    </div>
  )
}
