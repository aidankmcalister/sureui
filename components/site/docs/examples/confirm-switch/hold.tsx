"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchHold() {
  const log = useLog()

  return (
    <div className="flex items-center gap-2">
      <ConfirmSwitch
        id="require-reviews"
        gesture="hold"
        defaultChecked
        onConfirm={(on) =>
          log(on ? "Reviews required on main" : "Reviews no longer required")
        }
        onCancel={() => log("Let go early, still required")}
      />
      <Label htmlFor="require-reviews">Require pull request reviews</Label>
    </div>
  )
}
