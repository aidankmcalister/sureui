"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ChoosingMedium() {
  const log = useLog()

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ConfirmButton
        gesture="click-again"
        confirmLabel="Remove Maya Chen"
        variant="outline"
        onConfirm={() => log("Removed Maya Chen from Design")}
        onCancel={() => log("Disarmed, nobody removed")}
      >
        Remove member
      </ConfirmButton>
      <ConfirmButton
        gesture="hold"
        variant="destructive"
        onConfirm={() => log("Revoked the production API key")}
        onCancel={() => log("Let go early, nothing revoked")}
      >
        Hold to revoke key
      </ConfirmButton>
    </div>
  )
}
