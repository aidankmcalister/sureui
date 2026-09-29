"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverDemo() {
  const { deleteBranch } = useActions()

  return (
    <ConfirmPopover
      description="Open pull requests from this branch will close."
      confirmLabel="Delete branch"
      variant="destructive"
      onConfirm={deleteBranch}
    >
      <Button variant="outline">Delete branch</Button>
    </ConfirmPopover>
  )
}
