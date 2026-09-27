"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  composeHandlers,
  useConfirmation,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

type ConfirmButtonProps = React.ComponentProps<typeof Button> &
  ConfirmationOptions & {
    gesture?: "click" | "click-again" | "hold"
    confirmLabel?: React.ReactNode
    undoLabel?: React.ReactNode
    announcements?: {
      hold?: string
      armed?: string
      undo?: string
    }
    timeout?: number
    duration?: number
  }

function ConfirmButton({
  onConfirm,
  onCancel,
  undo,
  gesture = "click",
  confirmLabel = "Click again to confirm",
  undoLabel = "Undo",
  announcements,
  timeout = 3000,
  duration = 1200,
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
  } = useConfirmation({ onConfirm, onCancel, undo })
  const hintId = React.useId()

  React.useEffect(() => {
    if (state !== "armed") return
    const timer = setTimeout(cancel, timeout)
    return () => clearTimeout(timer)
  }, [state, timeout, cancel])

  const handleClick = React.useCallback(() => {
    if (gesture === "hold") return
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
  }, [state, gesture, cancel, confirm, arm])

  const handleBlur = React.useCallback(() => {
    resumeUndo("focus")
    if (gesture === "hold") {
      if (state === "holding") release()
    } else if (gesture === "click-again" && state === "armed") {
      cancel()
    }
  }, [gesture, state, release, cancel, resumeUndo])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return
      if (state === "undo") {
        cancel()
        return
      }
      if (state === "idle") hold(duration)
    },
    [state, hold, duration, cancel]
  )

  const handlePointerUp = React.useCallback(() => {
    if (state === "holding") release()
  }, [state, release])

  const handlePointerLeave = React.useCallback(() => {
    resumeUndo("hover")
    if (state === "holding") release()
  }, [state, release, resumeUndo])

  const handlePointerCancel = React.useCallback(() => {
    if (state === "holding") release()
  }, [state, release])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== " " && event.key !== "Enter") return
      event.preventDefault()
      if (event.repeat) return
      if (state === "undo") {
        cancel()
        return
      }
      if (state === "idle") hold(duration)
    },
    [state, hold, duration, cancel]
  )

  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== " " && event.key !== "Enter") return
      if (state === "holding") release()
    },
    [state, release]
  )

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
    },
    []
  )

  const shown = state === "armed" || state === "undo" ? state : "idle"
  const labels = [
    { state: "idle", node: children },
    ...(gesture === "click-again"
      ? [{ state: "armed", node: confirmLabel }]
      : []),
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
            : onKeyDown?.(event)
        }
        onKeyUp={(event) =>
          gesture === "hold"
            ? composeHandlers(onKeyUp, handleKeyUp)(event)
            : onKeyUp?.(event)
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
        {state === "armed"
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
