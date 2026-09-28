"use client"

import { Label } from "@/components/ui/label"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmSwitchDemo() {
  const log = useLog()

  return (
    <div className="flex items-center gap-3">
      <ConfirmSwitch
        id="public-repo"
        onConfirm={(checked) =>
          log(checked ? "Made acme/web public" : "Made acme/web private")
        }
        onCancel={() => log("Undone, nothing changed")}
      />
      <Label htmlFor="public-repo">Public repository</Label>
    </div>
  )
}
