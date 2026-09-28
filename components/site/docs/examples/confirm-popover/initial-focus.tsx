"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverInitialFocus() {
  const log = useLog()

  return (
    <ConfirmPopover
      description="Every open pull request from this branch closes."
      initialFocus="cancel"
      confirmLabel="Delete branch"
      variant="destructive"
      onConfirm={() => log("Deleted the branch")}
      onCancel={() => log("Closed, branch kept")}
    >
      <Button variant="outline">Delete branch</Button>
    </ConfirmPopover>
  )
}
