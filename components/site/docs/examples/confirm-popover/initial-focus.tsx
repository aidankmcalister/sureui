"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverInitialFocus() {
  const { deleteBranch } = useActions()

  return (
    <ConfirmPopover
      description="Every open pull request from this branch closes."
      initialFocus="cancel"
      confirmLabel="Delete branch"
      variant="destructive"
      onConfirm={deleteBranch}
    >
      <Button>Delete branch</Button>
    </ConfirmPopover>
  )
}
