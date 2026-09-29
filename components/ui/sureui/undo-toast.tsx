"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { playFill, startUndoWindow } from "@/components/ui/sureui/confirmation"

interface UndoToastOptions {
  description?: React.ReactNode
  duration?: number | "manual"
  undoLabel?: string
  pauseUndoOnHover?: boolean
  pauseUndoOnFocus?: boolean
}

function Countdown({
  track,
}: {
  track: (fill: HTMLSpanElement | null) => (() => void) | undefined
}) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 origin-left bg-current opacity-20"
      ref={track}
    />
  )
}

function undoToast(message: React.ReactNode, options: UndoToastOptions = {}) {
  const {
    description,
    duration,
    undoLabel = "Undo",
    pauseUndoOnHover = true,
    pauseUndoOnFocus = true,
  } = options
  return new Promise<boolean>((resolve) => {
    let settled = false
    let animation: Animation | null = null

    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      countdown.cancel()
      resolve(value)
    }

    const countdown = startUndoWindow({
      duration,
      onExpire: () => {
        if (
          !document.querySelector("[data-sonner-toaster]") &&
          process.env.NODE_ENV !== "production"
        ) {
          console.warn(
            "undoToast needs the shadcn <Toaster /> in your root layout. It resolved true without showing an Undo."
          )
        }
        settle(true)
        toast.dismiss(id)
      },
      onPauseChange: (paused) => {
        if (paused) animation?.pause()
        else animation?.play()
      },
    })

    const track = (fill: HTMLSpanElement | null) => {
      const toaster = fill?.closest("[data-sonner-toaster]")
      if (!fill || !toaster) return
      animation = playFill(fill, {
        from: 1,
        to: 0,
        duration: countdown.duration,
        startedAt: performance.now() - countdown.elapsed(),
      })
      if (countdown.paused()) animation?.pause()

      const onPointerEnter = () => countdown.pause("hover")
      const onPointerLeave = () => countdown.resume("hover")
      const onFocusIn = () => countdown.pause("focus")
      const onFocusOut = (event: Event) => {
        const next = (event as FocusEvent).relatedTarget
        if (!(next instanceof Node && toaster.contains(next))) {
          countdown.resume("focus")
        }
      }

      if (pauseUndoOnHover) {
        toaster.addEventListener("pointerenter", onPointerEnter)
        toaster.addEventListener("pointerleave", onPointerLeave)
      }
      if (pauseUndoOnFocus) {
        toaster.addEventListener("focusin", onFocusIn)
        toaster.addEventListener("focusout", onFocusOut)
      }
      if (pauseUndoOnHover && toaster.matches(":hover"))
        countdown.pause("hover")
      if (pauseUndoOnFocus && toaster.contains(document.activeElement)) {
        countdown.pause("focus")
      }

      return () => {
        animation?.cancel()
        animation = null
        toaster.removeEventListener("pointerenter", onPointerEnter)
        toaster.removeEventListener("pointerleave", onPointerLeave)
        toaster.removeEventListener("focusin", onFocusIn)
        toaster.removeEventListener("focusout", onFocusOut)
        countdown.resume("hover")
        countdown.resume("focus")
      }
    }

    const id = toast(message, {
      description,
      duration: Infinity,
      closeButton: countdown.manual || undefined,
      action: (
        <Button
          size="sm"
          className="relative ml-auto overflow-hidden"
          onClick={() => {
            settle(false)
            toast.dismiss(id)
          }}
        >
          {!countdown.manual && <Countdown track={track} />}
          {undoLabel}
        </Button>
      ),
      onDismiss: () => settle(true),
    })
  })
}

export { undoToast, type UndoToastOptions }
