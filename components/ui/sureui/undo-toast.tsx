"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type UndoToastOptions = {
  description?: React.ReactNode
  duration?: number
  undoLabel?: string
}

function Countdown({ duration }: { duration: number }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 origin-left bg-current opacity-20"
      ref={(fill) => {
        const animation = fill?.animate?.(
          [{ scale: "1 1" }, { scale: "0 1" }],
          { duration, easing: "linear", fill: "forwards" }
        )
        if (!fill || !animation) return
        const toaster = fill.closest("[data-sonner-toaster]")
        const pause = () => animation.pause()
        const play = () => animation.play()
        toaster?.addEventListener("pointerenter", pause)
        toaster?.addEventListener("pointerleave", play)
        return () => {
          animation.cancel()
          toaster?.removeEventListener("pointerenter", pause)
          toaster?.removeEventListener("pointerleave", play)
        }
      }}
    />
  )
}

function undoToast(
  message: React.ReactNode,
  { description, duration = 5000, undoLabel = "Undo" }: UndoToastOptions = {}
) {
  const ms = Number.isFinite(duration)
    ? Math.min(Math.max(duration, 4000), 60000)
    : 5000

  return new Promise<boolean>((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const id = toast(message, {
      description,
      duration: ms,
      action: (
        <Button
          size="sm"
          className="relative ml-auto overflow-hidden"
          onClick={() => {
            settle(false)
            toast.dismiss(id)
          }}
        >
          <Countdown duration={ms} />
          {undoLabel}
        </Button>
      ),
      onAutoClose: () => settle(true),
      onDismiss: () => settle(true),
    })
    setTimeout(() => {
      if (settled || document.querySelector("[data-sonner-toaster]")) return
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "undoToast needs the shadcn <Toaster /> in your root layout. It resolved true without showing an Undo."
        )
      }
      toast.dismiss(id)
      settle(true)
    }, ms)
  })
}

export { undoToast, type UndoToastOptions }
