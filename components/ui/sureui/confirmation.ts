"use client"

import * as React from "react"

type ConfirmationState = "idle" | "armed" | "holding" | "undo" | "pending"

type ConfirmationOptions = {
  onConfirm: () => void | Promise<unknown>
  onCancel?: () => void
  undo?: boolean | number
}

function composeHandlers<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void
) {
  return (event: E) => {
    theirs?.(event)
    ours(event)
  }
}

function useConfirmation(options: ConfirmationOptions) {
  const [state, setState] = React.useState<ConfirmationState>("idle")
  const fillRef = React.useRef<HTMLSpanElement>(null)
  const animationRef = React.useRef<Animation | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdStartRef = React.useRef(0)
  const holdDurationRef = React.useRef(0)
  const optionsRef = React.useRef(options)

  React.useEffect(() => {
    optionsRef.current = options
  })

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const cancelAnimation = React.useCallback(() => {
    animationRef.current?.cancel?.()
    animationRef.current = null
  }, [])

  React.useEffect(() => {
    return () => {
      clearTimer()
      cancelAnimation()
    }
  }, [clearTimer, cancelAnimation])

  const commit = React.useCallback(() => {
    clearTimer()
    cancelAnimation()
    const result = optionsRef.current.onConfirm()
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      setState("pending")
      ;(async () => {
        try {
          await result
        } finally {
          setState("idle")
        }
      })()
    } else {
      setState("idle")
    }
  }, [clearTimer, cancelAnimation])

  const confirm = React.useCallback(() => {
    const undo = optionsRef.current.undo
    if (undo) {
      const undoMs = undo === true ? 5000 : Math.max(undo, 4000)
      cancelAnimation()
      setState("undo")
      timerRef.current = setTimeout(commit, undoMs)
      animationRef.current =
        fillRef.current?.animate?.([{ scale: "1 1" }, { scale: "0 1" }], {
          duration: undoMs,
          easing: "linear",
        }) ?? null
    } else {
      commit()
    }
  }, [commit, cancelAnimation])

  const arm = React.useCallback(() => {
    setState("armed")
  }, [])

  const hold = React.useCallback(
    (duration: number) => {
      const ms = Math.max(duration, 800)
      holdStartRef.current = performance.now()
      holdDurationRef.current = ms
      setState("holding")
      timerRef.current = setTimeout(confirm, ms)
      animationRef.current =
        fillRef.current?.animate?.([{ scale: "0 1" }, { scale: "1 1" }], {
          duration: ms,
          easing: "linear",
          fill: "forwards",
        }) ?? null
    },
    [confirm]
  )

  const release = React.useCallback(() => {
    const elapsed = performance.now() - holdStartRef.current
    const fraction = Math.min(elapsed / holdDurationRef.current, 1)
    clearTimer()
    cancelAnimation()
    setState("idle")
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      fillRef.current?.animate?.(
        [{ scale: `${fraction} 1` }, { scale: "0 1" }],
        { duration: 200, easing: "ease-out" }
      )
    }
    optionsRef.current.onCancel?.()
  }, [clearTimer, cancelAnimation])

  const cancel = React.useCallback(() => {
    clearTimer()
    cancelAnimation()
    setState("idle")
    optionsRef.current.onCancel?.()
  }, [clearTimer, cancelAnimation])

  const announcement =
    state === "armed"
      ? "Click again to confirm"
      : state === "undo"
        ? "Done. Undo is available."
        : ""

  return { state, fillRef, arm, hold, release, confirm, cancel, announcement }
}

export {
  useConfirmation,
  composeHandlers,
  type ConfirmationState,
  type ConfirmationOptions,
}
