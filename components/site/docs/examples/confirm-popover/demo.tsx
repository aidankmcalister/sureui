"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmPopoverDemo() {
  const log = useLog()

  async function deleteBranch() {
    await wait(1000)
    log("Deleted feat/billing-v2")
  }

  return (
    <ConfirmPopover
      description="Open pull requests from this branch will close."
      confirmLabel="Delete branch"
      variant="destructive"
      onConfirm={deleteBranch}
      onCancel={() => log("Closed, nothing deleted")}
    >
      <Button variant="outline">Delete branch</Button>
    </ConfirmPopover>
  )
}
