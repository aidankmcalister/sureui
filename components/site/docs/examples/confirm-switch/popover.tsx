"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchPopover() {
  const log = useLog()

  return (
    <div className="flex items-center gap-2">
      <ConfirmSwitch
        id="nightly-backups"
        gesture="popover"
        description="No new snapshots until you turn this back on."
        variant="destructive"
        defaultChecked
        onConfirm={(on) =>
          log(on ? "Nightly backups on" : "Nightly backups off")
        }
        onCancel={() => log("Kept nightly backups on")}
      />
      <Label htmlFor="nightly-backups">Nightly backups</Label>
    </div>
  )
}
