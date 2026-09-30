"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { useConfirmation } from "@/components/ui/sureui/confirmation"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmationCoreShortcut() {
  const { deleteIssue } = useActions()
  const ref = React.useRef<HTMLButtonElement>(null)
  const { state, getTriggerProps } = useConfirmation<HTMLButtonElement>({
    gesture: "click-again",
    onConfirm: deleteIssue,
  })

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing =
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, [contenteditable]")
      if (event.key !== "Backspace" || typing) return
      event.preventDefault()
      ref.current?.click()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <Button ref={ref} variant="outline" {...getTriggerProps({})}>
      {state === "armed" ? "Press ⌫ again to delete" : "Delete issue ⌫"}
    </Button>
  )
}
