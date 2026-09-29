"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ContextMenuItem } from "@/components/ui/context-menu"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  isPromise,
  useConfirmation,
  useConfirmationLabels,
  type ConfirmationAnnouncements,
  type ConfirmationOptions,
  type ConfirmationState,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmMenuItemProps
  extends
    Omit<React.ComponentProps<typeof DropdownMenuItem>, "closeOnClick">,
    ConfirmationOptions,
    GestureOptions {
  menu?: "dropdown" | "context"
  confirmLabel?: React.ReactNode
  undoLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  closeOnConfirm?: boolean
  announcements?: ConfirmationAnnouncements
}

function ConfirmMenuItem(props: ConfirmMenuItemProps) {
  const {
    onConfirm,
    onCancel,
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    gesture = "click-again",
    timeout,
    duration,
    holdFallback = "click-again",
    armDelay,
    disabled,
    menu = "dropdown",
    confirmLabel,
    undoLabel,
    errorLabel,
    closeOnConfirm = true,
    announcements,
    className,
    children,
    "aria-describedby": describedBy,
    ...rest
  } = props
  const [closing, setClosing] = React.useState(false)
  const closingRef = React.useRef(false)
  const stateRef = React.useRef<ConfirmationState>("idle")
  const latestRef = React.useRef({ onConfirm, onConfirmError })

  function handleConfirm() {
    stateRef.current = "pending"
    const result = onConfirm()
    if (!closeOnConfirm) return result
    if (isPromise(result)) {
      result.then(
        () => setClosing(true),
        () => {}
      )
    } else {
      setClosing(true)
    }
    return result
  }

  function handleCancel() {
    const fromUndo = stateRef.current === "undo"
    onCancel?.()
    if (fromUndo) setClosing(true)
  }

  const { state, failed, fillRef, getTriggerProps } =
    useConfirmation<HTMLDivElement>({
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      onConfirmError,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
      gesture,
      timeout,
      duration,
      holdFallback,
      armDelay,
      disabled,
    })
  const labelId = React.useId()

  React.useEffect(() => {
    stateRef.current = state
    latestRef.current = { onConfirm, onConfirmError }
  })

  React.useEffect(() => {
    if (!closing || state !== "idle") return
    closingRef.current = true
    fillRef.current?.closest<HTMLElement>('[role="menuitem"]')?.click()
    closingRef.current = false
  }, [closing, state, fillRef])

  React.useEffect(
    () => () => {
      const latest = latestRef.current
      if (stateRef.current !== "undo") return
      if (!latest.onConfirmError) return void latest.onConfirm()
      try {
        const result = latest.onConfirm()
        if (isPromise(result)) result.then(undefined, latest.onConfirmError)
      } catch (error) {
        latest.onConfirmError(error)
      }
    },
    []
  )

  const triggerProps = getTriggerProps(rest)
  const Item = menu === "context" ? ContextMenuItem : DropdownMenuItem

  const { shown, labels, ariaLabel, ariaDescribedBy, hint, announcement } =
    useConfirmationLabels({
      state,
      failed,
      gesture,
      holdFallback,
      undo,
      label: children,
      confirmLabel,
      undoLabel,
      errorLabel,
      announcements,
      ariaLabel: rest["aria-label"],
      describedBy,
    })
  const named = rest["aria-label"] != null || rest["aria-labelledby"] != null

  return (
    <Item
      {...triggerProps}
      onClick={(event) => {
        if (closingRef.current) {
          setClosing(false)
          return
        }
        triggerProps.onClick?.(event)
      }}
      closeOnClick={closing}
      aria-label={ariaLabel}
      aria-labelledby={named ? rest["aria-labelledby"] : labelId}
      aria-describedby={ariaDescribedBy}
      data-state={state}
      data-error={failed || undefined}
      className={cn(
        "overflow-hidden motion-safe:data-[state=pending]:animate-pulse motion-safe:data-disabled:data-[state=pending]:opacity-100",
        gesture === "hold" ? "touch-none" : "touch-manipulation",
        className
      )}
    >
      <span
        ref={fillRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
      />
      <span id={labelId} className="grid flex-1 gap-[inherit]">
        {labels.map((label) => (
          <span
            key={label.state}
            aria-hidden={label.state !== shown || undefined}
            className={cn(
              "col-start-1 row-start-1 flex items-center gap-[inherit]",
              label.state !== shown && "invisible"
            )}
          >
            {label.node}
          </span>
        ))}
      </span>
      {hint && (
        <span id={hint.id} className="sr-only">
          {hint.text}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </Item>
  )
}

export { ConfirmMenuItem, type ConfirmMenuItemProps }
