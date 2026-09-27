"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type UndoToastOptions = {
  description?: React.ReactNode
  duration?: number
  undoLabel?: string
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
}

type PauseReason = "hover" | "focus" | "hidden"

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
    duration = 5000,
    undoLabel = "Undo",
    pauseOnHover = true,
    pauseOnFocus = true,
  }: UndoToastOptions = {}
) {
  const ms = Number.isFinite(duration)
    ? Math.min(Math.max(duration, 4000), 60000)
    : 5000

  return new Promise<boolean>((resolve) => {
    let settled = false
    let remaining = ms
    let startedAt = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let animation: Animation | undefined
    const pausedBy = new Set<PauseReason>()

    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(value)
    }

    const expire = () => {
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
    }

    const run = () => {
      startedAt = performance.now()
      timer = setTimeout(expire, remaining)
      animation?.play()
    }

    const pause = (reason: PauseReason) => {
      if (settled || pausedBy.has(reason)) return
      if (pausedBy.size === 0) {
        clearTimeout(timer)
        remaining -= performance.now() - startedAt
        animation?.pause()
      }
      pausedBy.add(reason)
    }

    const resume = (reason: PauseReason) => {
      if (settled || !pausedBy.delete(reason) || pausedBy.size > 0) return
      run()
    }

    const track = (fill: HTMLSpanElement | null) => {
      const toaster = fill?.closest("[data-sonner-toaster]")
      if (!fill || !toaster) return
      animation = fill.animate?.([{ scale: "1 1" }, { scale: "0 1" }], {
        duration: ms,
        easing: "linear",
        fill: "forwards",
      })
      if (animation) {
        animation.currentTime =
          ms -
          remaining +
          (pausedBy.size > 0 ? 0 : performance.now() - startedAt)
        if (pausedBy.size > 0) animation.pause()
      }

      const onPointerEnter = () => pause("hover")
      const onPointerLeave = () => resume("hover")
      const onFocusIn = () => pause("focus")
      const onFocusOut = (event: Event) => {
        const next = (event as FocusEvent).relatedTarget
        if (!(next instanceof Node && toaster.contains(next))) resume("focus")
      }
      const onVisibilityChange = () =>
        document.hidden ? pause("hidden") : resume("hidden")

      if (pauseOnHover) {
        toaster.addEventListener("pointerenter", onPointerEnter)
        toaster.addEventListener("pointerleave", onPointerLeave)
      }
      document.addEventListener("visibilitychange", onVisibilityChange)
      if (pauseOnFocus) {
        toaster.addEventListener("focusin", onFocusIn)
        toaster.addEventListener("focusout", onFocusOut)
      }
      if (pauseOnHover && toaster.matches(":hover")) pause("hover")
      if (pauseOnFocus && toaster.contains(document.activeElement)) {
        pause("focus")
      }
      onVisibilityChange()

      return () => {
        animation?.cancel()
        animation = undefined
        toaster.removeEventListener("pointerenter", onPointerEnter)
        toaster.removeEventListener("pointerleave", onPointerLeave)
        toaster.removeEventListener("focusin", onFocusIn)
        toaster.removeEventListener("focusout", onFocusOut)
        document.removeEventListener("visibilitychange", onVisibilityChange)
        if (settled || pausedBy.size === 0) return
        pausedBy.clear()
        run()
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

    run()
  })
}

export { undoToast, type UndoToastOptions }
