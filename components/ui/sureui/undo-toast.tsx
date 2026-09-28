"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { startUndoWindow } from "@/components/ui/sureui/undo-window"

type UndoToastOptions = {
  description?: React.ReactNode
  duration?: number
  undoLabel?: string
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
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

function undoToast(
  message: React.ReactNode,
  {
    description,
    duration,
    undoLabel = "Undo",
    pauseOnHover = true,
    pauseOnFocus = true,
  }: UndoToastOptions = {}
) {
  return new Promise<boolean>((resolve) => {
    let settled = false
    let animation: Animation | undefined

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
      animation = fill.animate?.([{ scale: "1 1" }, { scale: "0 1" }], {
        duration: countdown.duration,
        easing: "linear",
        fill: "forwards",
      })
      if (animation) {
        animation.currentTime = countdown.elapsed()
        if (countdown.paused()) animation.pause()
      }

      const onPointerEnter = () => countdown.pause("hover")
      const onPointerLeave = () => countdown.resume("hover")
      const onFocusIn = () => countdown.pause("focus")
      const onFocusOut = (event: Event) => {
        const next = (event as FocusEvent).relatedTarget
        if (!(next instanceof Node && toaster.contains(next))) {
          countdown.resume("focus")
        }
      }

      if (pauseOnHover) {
        toaster.addEventListener("pointerenter", onPointerEnter)
        toaster.addEventListener("pointerleave", onPointerLeave)
      }
      if (pauseOnFocus) {
        toaster.addEventListener("focusin", onFocusIn)
        toaster.addEventListener("focusout", onFocusOut)
      }
      if (pauseOnHover && toaster.matches(":hover")) countdown.pause("hover")
      if (pauseOnFocus && toaster.contains(document.activeElement)) {
        countdown.pause("focus")
      }

      return () => {
        animation?.cancel()
        animation = undefined
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
      action: (
        <Button
          size="sm"
          className="relative ml-auto overflow-hidden"
          onClick={() => {
            settle(false)
            toast.dismiss(id)
          }}
        >
          <Countdown track={track} />
          {undoLabel}
        </Button>
      ),
      onDismiss: () => settle(true),
    })
  })
}

export { undoToast, type UndoToastOptions }
