"use client"

import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useConfirmation } from "@/components/ui/sureui/confirmation"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmationCoreIconButton() {
  const { deleteRow } = useActions()
  const { state, getTriggerProps } = useConfirmation<HTMLButtonElement>({
    gesture: "click-again",
    onConfirm: deleteRow,
  })

  return (
    <Button
      {...getTriggerProps({})}
      size="icon"
      variant={state === "armed" ? "destructive" : "ghost"}
      aria-label={state === "armed" ? "Click again to delete" : "Delete row"}
    >
      <Trash2Icon />
    </Button>
  )
}
