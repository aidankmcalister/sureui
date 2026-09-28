"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchRing() {
  const log = useLog()

  return (
    <div className="flex items-center gap-3">
      <ConfirmSwitch
        id="beta-features"
        undoIndicator="ring"
        onConfirm={(checked) =>
          log(checked ? "Turned on beta features" : "Turned off beta features")
        }
        onCancel={() => log("Undone, nothing changed")}
      />
      <Label htmlFor="beta-features">Beta features</Label>
    </div>
  )
}
