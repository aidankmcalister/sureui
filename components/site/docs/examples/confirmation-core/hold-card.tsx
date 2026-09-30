"use client"

import { useConfirmation } from "@/components/ui/sureui/confirmation"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmationCoreHoldCard() {
  const { archiveProject } = useActions()
  const { state, fillRef, getTriggerProps } =
    useConfirmation<HTMLButtonElement>({
      gesture: "hold",
      onConfirm: archiveProject,
    })

  return (
    <button
      type="button"
      {...getTriggerProps({})}
      data-state={state}
      className="relative w-64 touch-none overflow-hidden rounded-xl border bg-card p-4 text-left outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        ref={fillRef}
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-destructive/15"
      />
      <span className="relative block font-medium">acme-prod</span>
      <span className="relative block text-sm text-muted-foreground">
        {state === "holding" ? "Keep holding to archive" : "Hold to archive"}
      </span>
    </button>
  )
}
