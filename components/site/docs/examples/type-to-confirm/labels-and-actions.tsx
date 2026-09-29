"use client"

import { Button } from "@/components/ui/button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmLabelsAndActions() {
  const { transferProject, cancelTransfer } = useActions()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      label={
        <>
          Type <strong>acme-prod</strong> to move it to the Globex team
        </>
      }
      variant="default"
      confirmLabel="Transfer project"
      onConfirm={transferProject}
      renderActions={(confirmButton) => (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={cancelTransfer}>
            Cancel
          </Button>
          {confirmButton}
        </div>
      )}
      className="w-full max-w-sm"
    />
  )
}
