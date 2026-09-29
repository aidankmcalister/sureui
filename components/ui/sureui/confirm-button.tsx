"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  useConfirmation,
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmButtonProps
  extends
    React.ComponentProps<typeof Button>,
    ConfirmationOptions,
    GestureOptions {
  confirmLabel?: React.ReactNode
  releaseLabel?: React.ReactNode
  undoLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  announcements?: {
    hold?: string
    ready?: string
    armed?: string
    fallback?: string
    undo?: string
    error?: string
  }
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
    confirmOnRelease,
    cancelOnBlur,
    cancelHoldOnLeave,
    holdFallback = "click-again",
    armDelay,
    disabled,
    confirmLabel,
    releaseLabel,
    undoLabel = "Undo",
    errorLabel,
    announcements,
    className,
    children,
    "aria-describedby": describedBy,
    ...rest
  } = props
  const { state, failed, fillRef, getTriggerProps } =
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
      confirmOnRelease,
      cancelOnBlur,
      cancelHoldOnLeave,
      holdFallback,
      armDelay,
      disabled,
    })
  const hintId = React.useId()

  const hasReleaseLabel = gesture === "hold" && releaseLabel != null
  const showError = failed && state === "idle" && errorLabel != null
  const shown =
    state === "armed" ||
    state === "undo" ||
    (state === "ready" && hasReleaseLabel)
      ? state
      : showError
        ? "error"
        : "idle"
  const labels = [
    { state: "idle", node: children },
    ...(gesture === "click-again" ||
    (gesture === "hold" && (confirmLabel != null || holdFallback !== "none"))
      ? [
          {
            state: "armed",
            node:
              confirmLabel ??
              (gesture === "hold" ? "Confirm" : "Click again to confirm"),
          },
        ]
      : []),
    ...(hasReleaseLabel ? [{ state: "ready", node: releaseLabel }] : []),
    ...(undo ? [{ state: "undo", node: undoLabel }] : []),
    ...(errorLabel != null ? [{ state: "error", node: errorLabel }] : []),
  ]

  const holdDescribedBy =
    gesture === "hold"
      ? [hintId, describedBy].filter(Boolean).join(" ")
      : describedBy

  return (
    <>
      <Button
        {...getTriggerProps(rest)}
        aria-label={
          rest["aria-label"] &&
          shown === "undo" &&
          typeof undoLabel === "string"
            ? undoLabel
            : rest["aria-label"] &&
                shown === "error" &&
                typeof errorLabel === "string"
              ? errorLabel
              : rest["aria-label"]
        }
        aria-describedby={holdDescribedBy}
        data-state={state}
        data-error={failed || undefined}
        className={cn(
          "relative overflow-hidden transition-[color,background-color,border-color,box-shadow] active:not-aria-[haspopup]:translate-y-0 aria-disabled:opacity-50 motion-safe:data-[state=pending]:animate-pulse motion-safe:aria-disabled:data-[state=pending]:opacity-100",
          gesture === "hold" ? "touch-none" : "touch-manipulation",
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
      {gesture === "hold" && (
        <span id={hintId} className="sr-only">
          {announcements?.hold ??
            (holdFallback === "none"
              ? "Press and hold to confirm"
              : "Press and hold, or activate twice, to confirm")}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {state === "ready"
          ? (announcements?.ready ?? "Release to confirm")
          : state === "armed" && gesture === "hold"
            ? (announcements?.fallback ?? "Activate again to confirm")
            : state === "armed"
              ? (announcements?.armed ??
                (typeof confirmLabel === "string"
                  ? confirmLabel
                  : "Click again to confirm"))
              : state === "undo"
                ? (announcements?.undo ?? "Done. Undo is available.")
                : showError
                  ? (announcements?.error ??
                    (typeof errorLabel === "string"
                      ? errorLabel
                      : "Failed. Activate again to retry."))
                  : ""}
      </span>
    </>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
