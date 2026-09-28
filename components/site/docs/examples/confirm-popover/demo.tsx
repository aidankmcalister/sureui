"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverDemo() {
  const log = useLog()

  return (
    <ConfirmPopover
      description="Open pull requests from this branch will close."
      confirmLabel="Delete branch"
      variant="destructive"
      onConfirm={() => log("Deleted feat/billing-v2")}
      onCancel={() => log("Closed, nothing deleted")}
    >
      <Button variant="outline">Delete branch</Button>
    </ConfirmPopover>
  )
}
