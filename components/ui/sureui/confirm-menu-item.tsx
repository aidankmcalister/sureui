"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ContextMenuItem } from "@/components/ui/context-menu"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  isPromise,
  useConfirmation,
  type ConfirmationOptions,
  type ConfirmationState,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

type ConfirmMenuItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuItem>,
  "closeOnClick"
> &
  ConfirmationOptions &
  GestureOptions & {
    menu?: "dropdown" | "context"
    confirmLabel?: React.ReactNode
    releaseLabel?: React.ReactNode
    undoLabel?: React.ReactNode
    closeOnConfirm?: boolean
    closeOnUndo?: boolean
    commitUndoOnClose?: boolean
    announcements?: {
      hold?: string
      ready?: string
      armed?: string
      fallback?: string
      undo?: string
    }
  }

function ConfirmMenuItem({
  onConfirm,
  onCancel,
  undo,
  pauseUndoOnHover,
  pauseUndoOnFocus,
  gesture = "click-again",
  timeout,
  duration,
  confirmOnRelease,
  cancelOnBlur,
  cancelHoldOnLeave,
  holdFallback = "click-again",
  disabled,
  menu = "dropdown",
  confirmLabel,
  releaseLabel,
  undoLabel = "Undo",
  closeOnConfirm = true,
  closeOnUndo = true,
  commitUndoOnClose = true,
  announcements,
  className,
  children,
  "aria-describedby": describedBy,
  ...props
}: ConfirmMenuItemProps) {
  const [closing, setClosing] = React.useState(false)
  const closingRef = React.useRef(false)
  const stateRef = React.useRef<ConfirmationState>("idle")
  const latestRef = React.useRef({ onConfirm, commitUndoOnClose })

  function handleConfirm() {
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
    if (fromUndo && closeOnUndo) setClosing(true)
  }

  const { state, fillRef, getTriggerProps } = useConfirmation<HTMLDivElement>({
    onConfirm: handleConfirm,
    onCancel: handleCancel,
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
    disabled,
  })
  const labelId = React.useId()
  const hintId = React.useId()

  React.useEffect(() => {
    stateRef.current = state
    latestRef.current = { onConfirm, commitUndoOnClose }
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
      if (stateRef.current === "undo" && latest.commitUndoOnClose) {
        latest.onConfirm()
      }
    },
    []
  )

  const triggerProps = getTriggerProps(props)
  const Item = menu === "context" ? ContextMenuItem : DropdownMenuItem

  const hasReleaseLabel = gesture === "hold" && releaseLabel != null
  const shown =
    state === "armed" ||
    state === "undo" ||
    (state === "ready" && hasReleaseLabel)
      ? state
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
  ]

  const holdDescribedBy =
    gesture === "hold"
      ? [hintId, describedBy].filter(Boolean).join(" ")
      : describedBy
  const named = props["aria-label"] != null || props["aria-labelledby"] != null

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
      aria-label={
        state === "undo" && typeof undoLabel === "string" && props["aria-label"]
          ? undoLabel
          : props["aria-label"]
      }
      aria-labelledby={named ? props["aria-labelledby"] : labelId}
      aria-describedby={holdDescribedBy}
      data-state={state}
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
                : ""}
      </span>
    </Item>
  )
}

export { ConfirmMenuItem, type ConfirmMenuItemProps }
