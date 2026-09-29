"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ChoosingMedium() {
  const { removeMember, revokeKey } = useActions()

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmButton
        gesture="click-again"
        confirmLabel="Are you sure?"
        onConfirm={removeMember}
      >
        Remove member
      </ConfirmButton>
      <ConfirmButton gesture="hold" variant="destructive" onConfirm={revokeKey}>
        Hold to revoke key
      </ConfirmButton>
    </div>
  )
}
