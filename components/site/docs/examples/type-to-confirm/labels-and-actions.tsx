"use client"

import { Button } from "@/components/ui/button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmLabelsAndActions() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      label={
        <>
          Type{" "}
          <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.9em] font-semibold">
            acme-prod
          </code>{" "}
          to move it to the Globex team
        </>
      }
      variant="default"
      confirmLabel="Transfer project"
      onConfirm={() => log("Transferred acme-prod to Globex")}
      renderActions={(confirmButton) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => log("Cancelled, nothing transferred")}
          >
            Cancel
          </Button>
          {confirmButton}
        </div>
      )}
      className="w-full max-w-sm"
    />
  )
}
