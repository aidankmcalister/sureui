"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import {
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

type ConfirmCloseOptions = Pick<ConfirmationOptions, "onConfirmError"> &
  Omit<GestureOptions, "disabled"> & {
    title?: string
    confirmLabel?: React.ReactNode
    cancelLabel?: React.ReactNode
    errorLabel?: React.ReactNode
    variant?: ConfirmButtonProps["variant"]
    announcements?: ConfirmButtonProps["announcements"]
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onDiscard?: () => void | Promise<unknown>
  }

type ConfirmCloseRootProps = {
  open: boolean
  onOpenChange: (open: boolean, eventDetails: { cancel: () => void }) => void
}

function useConfirmClose(
  dirty: boolean,
  {
    title = "Discard changes?",
    confirmLabel = "Discard changes",
    cancelLabel = "Keep editing",
    variant = "destructive",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onDiscard,
    ...options
  }: ConfirmCloseOptions = {}
) {
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

  const rootProps: ConfirmCloseRootProps = {
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
        {cancelLabel}
      </Button>
      <ConfirmButton {...options} variant={variant} onConfirm={discard}>
        {confirmLabel}
      </ConfirmButton>
    </React.Fragment>
  ) : null

  return { rootProps, question, close: () => setOpen(false) }
}

export { useConfirmClose, type ConfirmCloseOptions, type ConfirmCloseRootProps }
