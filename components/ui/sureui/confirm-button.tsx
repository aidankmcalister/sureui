"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  composeHandlers,
  toMs,
  useConfirmation,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

type ConfirmButtonProps = React.ComponentProps<typeof Button> &
  ConfirmationOptions & {
    gesture?: "click" | "click-again" | "hold"
    confirmLabel?: React.ReactNode
    releaseLabel?: React.ReactNode
    undoLabel?: React.ReactNode
    announcements?: {
      hold?: string
      ready?: string
      armed?: string
      undo?: string
    }
    timeout?: number
    duration?: number
    confirmOnRelease?: boolean
    cancelHoldOnLeave?: boolean
  }

function ConfirmButton({
  onConfirm,
  onCancel,
  undo,
  pauseUndoOnHover,
  pauseUndoOnFocus,
  gesture = "click",
  confirmLabel = "Click again to confirm",
  releaseLabel,
  undoLabel = "Undo",
  announcements,
  timeout = 3000,
  duration = 1200,
  confirmOnRelease = true,
  cancelHoldOnLeave = true,
  className,
  children,
  disabled,
  onClick,
  onBlur,
  onFocus,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onContextMenu,
  "aria-describedby": describedBy,
  ...props
}: ConfirmButtonProps) {
  const {
    state,
    fillRef,
    arm,
    hold,
    release,
    confirm,
    cancel,
    pauseUndo,
    resumeUndo,
  } = useConfirmation({
    onConfirm,
    onCancel,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
  })
  const hintId = React.useId()

  React.useEffect(() => {
    if (state !== "armed") return
    const timer = setTimeout(cancel, toMs(timeout, 3000, 0))
    return () => clearTimeout(timer)
  }, [state, timeout, cancel])

  const repeatRef = React.useRef(false)
  const undoPressRef = React.useRef(false)

  const undoFromPress = React.useCallback(() => {
    if (state !== "undo" || !undoPressRef.current) return
    undoPressRef.current = false
    cancel()
  }, [state, cancel])

  const handleClick = React.useCallback(() => {
    if (gesture === "hold") {
      undoFromPress()
      return
    }
    if (repeatRef.current) return
    if (state === "undo") {
      cancel()
      return
    }
    if (gesture === "click") {
      confirm()
      return
    }
    if (gesture === "click-again") {
      if (state === "armed") confirm()
      else arm()
    }
  }, [state, gesture, cancel, confirm, arm, undoFromPress])

  const handleBlur = React.useCallback(() => {
    resumeUndo("focus")
    if (gesture === "hold") {
      if (state === "holding" || state === "ready") release()
    } else if (gesture === "click-again" && state === "armed") {
      cancel()
    }
  }, [gesture, state, release, cancel, resumeUndo])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return
      undoPressRef.current = state === "undo"
      if (state !== "idle") return
      const target = event.currentTarget
      if (!cancelHoldOnLeave) target.setPointerCapture?.(event.pointerId)
      else if (target.hasPointerCapture?.(event.pointerId))
        target.releasePointerCapture(event.pointerId)
      hold(duration, confirmOnRelease)
    },
    [state, hold, duration, confirmOnRelease, cancelHoldOnLeave]
  )

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (state === "holding") release()
      if (state !== "ready") return
      const rect = event.currentTarget.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      if (inside) confirm()
      else release()
    },
    [state, release, confirm]
  )

  const handlePointerLeave = React.useCallback(() => {
    resumeUndo("hover")
    if (cancelHoldOnLeave && (state === "holding" || state === "ready"))
      release()
  }, [state, release, resumeUndo, cancelHoldOnLeave])

  const handlePointerCancel = React.useCallback(() => {
    if (state === "holding" || state === "ready") release()
  }, [state, release])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== " " && event.key !== "Enter") return
      event.preventDefault()
      if (event.repeat) return
      undoPressRef.current = state === "undo"
      if (state === "idle") hold(duration, confirmOnRelease)
    },
    [state, hold, duration, confirmOnRelease]
  )

  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== " " && event.key !== "Enter") return
      if (state === "holding") release()
      else if (state === "ready") confirm()
      else undoFromPress()
    },
    [state, release, confirm, undoFromPress]
  )

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
    },
    []
  )

  const hasReleaseLabel = gesture === "hold" && releaseLabel != null
  const shown =
    state === "armed" ||
    state === "undo" ||
    (state === "ready" && hasReleaseLabel)
      ? state
      : "idle"
  const labels = [
    { state: "idle", node: children },
    ...(gesture === "click-again"
      ? [{ state: "armed", node: confirmLabel }]
      : []),
    ...(hasReleaseLabel ? [{ state: "ready", node: releaseLabel }] : []),
    ...(undo ? [{ state: "undo", node: undoLabel }] : []),
  ]

  const holdDescribedBy =
    gesture === "hold"
      ? [hintId, describedBy].filter(Boolean).join(" ")
      : describedBy

  return (
    <>
      <Button
        {...props}
        aria-label={
          state === "undo" &&
          typeof undoLabel === "string" &&
          props["aria-label"]
            ? undoLabel
            : props["aria-label"]
        }
        aria-describedby={holdDescribedBy}
        data-state={state}
        className={cn(
          "relative overflow-hidden",
          gesture === "hold" &&
            "touch-none active:not-aria-[haspopup]:translate-y-0",
          className
        )}
        disabled={disabled || state === "pending"}
        onClick={(event) => composeHandlers(onClick, handleClick)(event)}
        onBlur={(event) => composeHandlers(onBlur, handleBlur)(event)}
        onFocus={(event) =>
          composeHandlers(onFocus, () => pauseUndo("focus"))(event)
        }
        onPointerEnter={(event) =>
          composeHandlers(onPointerEnter, () => pauseUndo("hover"))(event)
        }
        onPointerDown={(event) =>
          gesture === "hold"
            ? composeHandlers(onPointerDown, handlePointerDown)(event)
            : onPointerDown?.(event)
        }
        onPointerUp={(event) =>
          gesture === "hold"
            ? composeHandlers(onPointerUp, handlePointerUp)(event)
            : onPointerUp?.(event)
        }
        onPointerLeave={(event) =>
          composeHandlers(onPointerLeave, handlePointerLeave)(event)
        }
        onPointerCancel={(event) =>
          gesture === "hold"
            ? composeHandlers(onPointerCancel, handlePointerCancel)(event)
            : onPointerCancel?.(event)
        }
        onKeyDown={(event) =>
          gesture === "hold"
            ? composeHandlers(onKeyDown, handleKeyDown)(event)
            : composeHandlers(onKeyDown, () => {
                repeatRef.current = event.repeat
              })(event)
        }
        onKeyUp={(event) =>
          gesture === "hold"
            ? composeHandlers(onKeyUp, handleKeyUp)(event)
            : composeHandlers(onKeyUp, () => {
                repeatRef.current = false
              })(event)
        }
        onContextMenu={(event) =>
          gesture === "hold"
            ? composeHandlers(onContextMenu, handleContextMenu)(event)
            : onContextMenu?.(event)
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
          {announcements?.hold ?? "Press and hold to confirm"}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {state === "ready"
          ? (announcements?.ready ?? "Release to confirm")
          : state === "armed"
            ? (announcements?.armed ??
              (typeof confirmLabel === "string"
                ? confirmLabel
                : "Click again to confirm"))
            : state === "undo"
              ? (announcements?.undo ?? "Done. Undo is available.")
              : ""}
      </span>
    </>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
