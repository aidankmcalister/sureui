"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmButtonErrors() {
  const { publish, showError } = useActions({
    publish: { wait: 1000, fail: "Network error" },
  })

  return (
    <ConfirmButton
      errorLabel="Couldn't publish. Retry"
      onConfirm={publish}
      onConfirmError={showError}
    >
      Publish
    </ConfirmButton>
  )
}
