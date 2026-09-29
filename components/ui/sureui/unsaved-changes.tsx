"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { type ConfirmationOptions } from "@/components/ui/sureui/confirmation"

interface UnsavedChangesOptions extends Pick<
  ConfirmationOptions,
  "onConfirmError"
> {
  when: boolean
  onSave?: () => void | Promise<unknown>
  onDiscard?: () => void | Promise<unknown>
  beforeUnload?: boolean
  title?: string
  saveTitle?: string
  description?: React.ReactNode
  keepLabel?: string
  discardLabel?: string
  saveLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function useUnsavedChanges(options: UnsavedChangesOptions) {
  const {
    when,
    onSave,
    onDiscard,
    onConfirmError,
    beforeUnload = true,
    title = "Discard unsaved changes?",
    saveTitle = "Save changes before leaving?",
    keepLabel = "Keep editing",
    discardLabel = "Discard changes",
    saveLabel = "Save",
    open: openProp,
    onOpenChange,
  } = options
  const { confirm, dialog } = useConfirm()
  const optionsRef = React.useRef(options)
  const pendingRef = React.useRef<Promise<boolean> | null>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [asking, setAsking] = React.useState(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const keepRef = React.useRef<HTMLButtonElement>(null)
  const keeping = React.useRef(false)
  const open = openProp ?? uncontrolledOpen

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

  if (asking && !when) setAsking(false)

  React.useEffect(() => {
    if (asking) return keepRef.current?.focus()
    if (keeping.current) returnFocus.current?.focus()
    keeping.current = false
    returnFocus.current = null
  }, [asking])

  const ask = React.useCallback(async () => {
    const {
      onSave,
      onDiscard,
      onConfirmError,
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
        onConfirm: onDiscard,
        onConfirmError,
      })

    let discarding = false
    if (onSave) {
      const saved = await confirm({
        title: saveTitle,
        description,
        cancelLabel: keepLabel,
        confirmLabel: saveLabel,
        onConfirm: onSave,
        onConfirmError,
        alternative: {
          label: discardLabel,
          onSelect: () => {
            discarding = true
          },
        },
      })
      if (saved) return true
      if (!discarding) return false
    }

    return discard()
  }, [confirm])

  const confirmLeave = React.useCallback(() => {
    if (!optionsRef.current.when) return Promise.resolve(true)
    pendingRef.current ??= ask().finally(() => {
      pendingRef.current = null
    })
    return pendingRef.current
  }, [ask])

  function setOpen(next: boolean) {
    if (!next) {
      setAsking(false)
      returnFocus.current = null
    }
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const rootProps: {
    open: boolean
    onOpenChange: (open: boolean, eventDetails: { cancel: () => void }) => void
  } = {
    open,
    onOpenChange(next, eventDetails) {
      if (next || !when) return setOpen(next)
      eventDetails.cancel()
      if (asking) return
      const active = document.activeElement
      returnFocus.current = active instanceof HTMLElement ? active : null
      setAsking(true)
    },
  }

  const question = asking ? (
    <React.Fragment key="unsaved-changes">
      <span role="status" className="sr-only">
        {onSave ? saveTitle : title}
      </span>
      <Button
        ref={keepRef}
        variant="outline"
        onClick={() => {
          keeping.current = true
          setAsking(false)
        }}
      >
        {keepLabel}
      </Button>
      <ConfirmButton
        variant="destructive"
        onConfirm={async () => {
          await onDiscard?.()
          setOpen(false)
        }}
        onConfirmError={onConfirmError}
      >
        {discardLabel}
      </ConfirmButton>
      {onSave && (
        <ConfirmButton
          onConfirm={async () => {
            await onSave()
            setOpen(false)
          }}
          onConfirmError={onConfirmError}
        >
          {saveLabel}
        </ConfirmButton>
      )}
    </React.Fragment>
  ) : null

  return {
    confirmLeave,
    dialog,
    rootProps,
    question,
    close: () => setOpen(false),
  }
}

export { useUnsavedChanges, type UnsavedChangesOptions }
