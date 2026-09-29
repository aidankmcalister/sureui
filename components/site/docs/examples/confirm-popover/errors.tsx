"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverErrors() {
  const { publish, showError } = useActions({
    publish: { wait: 1000, fail: "Network error" },
  })

  return (
    <ConfirmPopover
      description="The changelog goes out to every subscriber."
      confirmLabel="Publish"
      errorLabel="Couldn't publish. Retry"
      onConfirm={publish}
      onConfirmError={showError}
    >
      <Button>Publish</Button>
    </ConfirmPopover>
  )
}
