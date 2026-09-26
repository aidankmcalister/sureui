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
  timeout = 3000,
  duration = 1200,
  className,
  children,
  disabled,
  onClick,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onContextMenu,
  "aria-describedby": describedBy,
  ...props
}: ConfirmButtonProps) {
  const { state, fillRef, arm, hold, release, confirm, cancel, announcement } =
    useConfirmation({ onConfirm, onCancel, undo })
  const hintId = React.useId()
  const armedAtRef = React.useRef<number | null>(null)

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
      if (state !== "armed") {
        armedAtRef.current = performance.now()
        arm()
      } else if (
        armedAtRef.current !== null &&
        performance.now() - armedAtRef.current > 300
      ) {
        armedAtRef.current = null
        confirm()
      }
    }
  }, [state, gesture, cancel, confirm, arm])

  const handleBlur = React.useCallback(() => {
    if (gesture === "hold") {
      if (state === "holding") release()
    } else if (gesture === "click-again" && state === "armed") {
      cancel()
    }
  }, [gesture, state, release, cancel])

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
    if (state === "holding") release()
  }, [state, release])

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
          gesture === "hold"
            ? composeHandlers(onPointerLeave, handlePointerLeave)(event)
            : onPointerLeave?.(event)
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
          Press and hold to confirm
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {state === "armed" && typeof confirmLabel === "string"
          ? confirmLabel
          : announcement}
      </span>
    </>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
