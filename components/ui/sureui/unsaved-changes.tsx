"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"

type UnsavedChangesOptions = {
  when: boolean
  onSave?: () => void | Promise<unknown>
  onDiscard?: () => void
  beforeUnload?: boolean
  title?: string
  saveTitle?: string
  description?: React.ReactNode
  keepLabel?: string
  discardLabel?: string
  saveLabel?: string
}

function useUnsavedChanges(options: UnsavedChangesOptions) {
  const { when, beforeUnload = true } = options
  const { confirm, dialog } = useConfirm()
  const optionsRef = React.useRef(options)
  const pendingRef = React.useRef<Promise<boolean> | null>(null)

  React.useEffect(() => {
    optionsRef.current = options
  })

  React.useEffect(() => {
    if (!when || !beforeUnload) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = true
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [when, beforeUnload])

  const ask = React.useCallback(async () => {
    const {
      onSave,
      onDiscard,
      title = "Discard unsaved changes?",
      saveTitle = "Save changes before leaving?",
      description = "Your changes haven't been saved.",
      keepLabel = "Keep editing",
      discardLabel = "Discard changes",
      saveLabel = "Save",
    } = optionsRef.current

    const discard = () =>
      confirm({
        title,
        description,
        cancelLabel: keepLabel,
        confirmLabel: discardLabel,
        variant: "destructive",
      })

    let discarding = Promise.resolve(false)
    if (!onSave) {
      discarding = discard()
    } else {
      const saved = await confirm({
        title: saveTitle,
        description,
        cancelLabel: keepLabel,
        confirmLabel: saveLabel,
        onConfirm: onSave,
        consequences: (
          <Button
            variant="outline"
            className="sm:justify-self-start"
            onClick={() => {
              discarding = discard()
            }}
          >
            {discardLabel}
          </Button>
        ),
      })
      if (saved) return true
    }

    const discarded = await discarding
    if (discarded) onDiscard?.()
    return discarded
  }, [confirm])

  const confirmLeave = React.useCallback(() => {
    if (!optionsRef.current.when) return Promise.resolve(true)
    pendingRef.current ??= ask().finally(() => {
      pendingRef.current = null
    })
    return pendingRef.current
  }, [ask])

  return { confirmLeave, dialog }
}

export { useUnsavedChanges, type UnsavedChangesOptions }
