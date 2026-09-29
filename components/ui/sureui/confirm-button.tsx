"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  useConfirmation,
  useConfirmationLabels,
  type ConfirmationAnnouncements,
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmButtonProps
  extends
    React.ComponentProps<typeof Button>,
    ConfirmationOptions,
    GestureOptions {
  confirmLabel?: React.ReactNode
  undoLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  waitLabel?: (seconds: number) => React.ReactNode
  announcements?: ConfirmationAnnouncements
}

function ConfirmButton(props: ConfirmButtonProps) {
  const {
    onConfirm,
    onCancel,
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    gesture = "click",
    timeout,
    duration,
    holdFallback = "click-again",
    armDelay,
    wait,
    disabled,
    confirmLabel,
    undoLabel,
    errorLabel,
    waitLabel,
    announcements,
    className,
    children,
    "aria-describedby": describedBy,
    ...rest
  } = props
  const { state, failed, waiting, fillRef, getTriggerProps } =
    useConfirmation<HTMLButtonElement>({
      onConfirm,
      onCancel,
      onConfirmError,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
      gesture,
      timeout,
      duration,
      holdFallback,
      armDelay,
      wait,
      disabled,
    })
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
      wait,
      waiting,
      waitLabel,
      announcements,
      ariaLabel: rest["aria-label"],
      describedBy,
    })

  return (
    <>
      <Button
        {...getTriggerProps(rest)}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-state={state}
        data-error={failed || undefined}
        className={cn(
          "relative overflow-hidden transition-[color,background-color,border-color,box-shadow] active:not-aria-[haspopup]:translate-y-0 aria-disabled:opacity-50 motion-safe:data-[state=pending]:animate-pulse motion-safe:aria-disabled:data-[state=pending]:opacity-100",
          gesture === "hold"
            ? "touch-none"
            : gesture === "slide"
              ? "touch-pan-y"
              : "touch-manipulation",
          className
        )}
        focusableWhenDisabled={
          rest.focusableWhenDisabled || state === "pending"
        }
      >
        <span
          ref={fillRef}
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
        />
        <span className="grid gap-[inherit]">
          {labels.map((label) => (
            <span
              key={label.state}
              aria-hidden={label.state !== shown || undefined}
              className={cn(
                "col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]",
                label.state !== shown && "invisible"
              )}
            >
              {label.node}
            </span>
          ))}
        </span>
      </Button>
      {hint && (
        <span id={hint.id} className="sr-only">
          {hint.text}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
