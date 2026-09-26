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
  const ms = Math.max(duration, 4000)

  return new Promise<boolean>((resolve) => {
    const id = toast(message, {
      description,
      duration: ms,
      action: (
        <Button
          size="sm"
          className="relative ml-auto overflow-hidden"
          onClick={() => {
            resolve(false)
            toast.dismiss(id)
          }}
        >
          <Countdown duration={ms} />
          {undoLabel}
        </Button>
      ),
      onAutoClose: () => resolve(true),
      onDismiss: () => resolve(true),
    })
  })
}

export { undoToast, type UndoToastOptions }
