"use client"

import * as React from "react"

type ConfirmationState = "idle" | "armed" | "holding" | "undo" | "pending"

type PauseReason = "hover" | "focus"

type UndoWindow = {
  run: ConfirmationOptions["onConfirm"]
  remaining: number
  startedAt: number
  pausable: Set<PauseReason>
  pausedBy: Set<PauseReason>
}

type ConfirmationOptions = {
  onConfirm: () => void | Promise<unknown>
  onCancel?: () => void
  undo?: boolean | number
  pauseUndoOnHover?: boolean
  pauseUndoOnFocus?: boolean
}

function toMs(value: number, fallback: number, min: number) {
  return Number.isFinite(value)
    ? Math.min(Math.max(value, min), 60000)
    : fallback
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
  const undoRef = React.useRef<UndoWindow | null>(null)
  const optionsRef = React.useRef(options)

  React.useEffect(() => {
    optionsRef.current = options
  })

  const clearTimer = React.useCallback(() => {
    undoRef.current = null
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

  const commit = React.useCallback(
    (run: ConfirmationOptions["onConfirm"]) => {
      clearTimer()
      cancelAnimation()
      let result: ReturnType<ConfirmationOptions["onConfirm"]>
      try {
        result = run()
      } catch (error) {
        setState("idle")
        throw error
      }
      if (
        result &&
        typeof (result as PromiseLike<unknown>).then === "function"
      ) {
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
    },
    [clearTimer, cancelAnimation]
  )

  const runUndo = React.useCallback(
    (undoWindow: UndoWindow) => {
      undoWindow.startedAt = performance.now()
      timerRef.current = setTimeout(
        () => commit(undoWindow.run),
        undoWindow.remaining
      )
    },
    [commit]
  )

  const confirm = React.useCallback(() => {
    const { undo, onConfirm } = optionsRef.current
    clearTimer()
    if (undo) {
      const undoMs = undo === true ? 5000 : toMs(undo, 5000, 4000)
      cancelAnimation()
      setState("undo")
      const undoWindow: UndoWindow = {
        run: onConfirm,
        remaining: undoMs,
        startedAt: 0,
        pausable: new Set(),
        pausedBy: new Set(),
      }
      undoRef.current = undoWindow
      runUndo(undoWindow)
      animationRef.current =
        fillRef.current?.animate?.([{ scale: "1 1" }, { scale: "0 1" }], {
          duration: undoMs,
          easing: "linear",
        }) ?? null
    } else {
      commit(onConfirm)
    }
  }, [commit, clearTimer, cancelAnimation, runUndo])

  const pauseUndo = React.useCallback((reason: PauseReason) => {
    const { pauseUndoOnHover = true, pauseUndoOnFocus = true } =
      optionsRef.current
    if (reason === "hover" ? !pauseUndoOnHover : !pauseUndoOnFocus) return
    const undoWindow = undoRef.current
    if (!undoWindow?.pausable.has(reason) || undoWindow.pausedBy.has(reason))
      return
    if (undoWindow.pausedBy.size === 0) {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      timerRef.current = null
      undoWindow.remaining -= performance.now() - undoWindow.startedAt
      animationRef.current?.pause?.()
    }
    undoWindow.pausedBy.add(reason)
  }, [])

  const resumeUndo = React.useCallback(
    (reason: PauseReason) => {
      const undoWindow = undoRef.current
      if (!undoWindow) return
      undoWindow.pausable.add(reason)
      if (!undoWindow.pausedBy.delete(reason) || undoWindow.pausedBy.size > 0)
        return
      runUndo(undoWindow)
      animationRef.current?.play?.()
    },
    [runUndo]
  )

  const arm = React.useCallback(() => {
    setState("armed")
  }, [])

  const hold = React.useCallback(
    (duration: number) => {
      const ms = toMs(duration, 1200, 800)
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

  return {
    state,
    fillRef,
    arm,
    hold,
    release,
    confirm,
    cancel,
    pauseUndo,
    resumeUndo,
  }
}

export {
  useConfirmation,
  composeHandlers,
  toMs,
  type ConfirmationState,
  type ConfirmationOptions,
}
