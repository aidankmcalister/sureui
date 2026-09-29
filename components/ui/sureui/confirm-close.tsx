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
    </React.Fragment>
  ) : null

  return { rootProps, question, close: () => setOpen(false) }
}

export { useConfirmClose, type ConfirmCloseOptions }
