"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import {
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

interface UnsavedChangesOptions {
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

    let discarding = false
    if (onSave) {
      const saved = await confirm({
        title: saveTitle,
        description,
        cancelLabel: keepLabel,
        confirmLabel: saveLabel,
        onConfirm: onSave,
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

    const discarded = await discard()
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

interface ConfirmCloseOptions
  extends
    Pick<ConfirmationOptions, "onConfirmError">,
    Omit<GestureOptions, "disabled"> {
  title?: string
  discardLabel?: React.ReactNode
  keepLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  variant?: ConfirmButtonProps["variant"]
  announcements?: ConfirmButtonProps["announcements"]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onDiscard?: () => void | Promise<unknown>
  onSave?: () => void | Promise<unknown>
  saveLabel?: React.ReactNode
}

function useConfirmClose(dirty: boolean, options: ConfirmCloseOptions = {}) {
  const {
    title = "Discard changes?",
    discardLabel = "Discard changes",
    keepLabel = "Keep editing",
    variant = "destructive",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onDiscard,
    onSave,
    saveLabel = "Save",
    ...buttonOptions
  } = options
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [asking, setAsking] = React.useState(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const keepRef = React.useRef<HTMLButtonElement>(null)
  const keeping = React.useRef(false)
  const open = openProp ?? uncontrolledOpen

  if (asking && !dirty) setAsking(false)

  React.useEffect(() => {
    if (asking) return keepRef.current?.focus()
    if (keeping.current) returnFocus.current?.focus()
    keeping.current = false
    returnFocus.current = null
  }, [asking])

  function setOpen(next: boolean) {
    if (!next) {
      setAsking(false)
      returnFocus.current = null
    }
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  function ask() {
    if (asking) return
    const active = document.activeElement
    returnFocus.current = active instanceof HTMLElement ? active : null
    setAsking(true)
  }

  async function discard() {
    await onDiscard?.()
    setOpen(false)
  }

  async function save() {
    await onSave?.()
    setOpen(false)
  }

  const rootProps: {
    open: boolean
    onOpenChange: (open: boolean, eventDetails: { cancel: () => void }) => void
  } = {
    open,
    onOpenChange(next, eventDetails) {
      if (next || !dirty) return setOpen(next)
      eventDetails.cancel()
      ask()
    },
  }

  const question = asking ? (
    <React.Fragment key="confirm-close">
      <span role="status" className="sr-only">
        {title}
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
      <ConfirmButton {...buttonOptions} variant={variant} onConfirm={discard}>
        {discardLabel}
      </ConfirmButton>
      {onSave && <ConfirmButton onConfirm={save}>{saveLabel}</ConfirmButton>}
    </React.Fragment>
  ) : null

  return { rootProps, question, close: () => setOpen(false) }
}

export {
  useUnsavedChanges,
  useConfirmClose,
  type UnsavedChangesOptions,
  type ConfirmCloseOptions,
}
