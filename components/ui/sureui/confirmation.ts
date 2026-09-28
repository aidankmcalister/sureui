"use client"

import * as React from "react"

import {
  startUndoWindow,
  type UndoWindow,
} from "@/components/ui/sureui/undo-window"

type ConfirmationState =
  "idle" | "armed" | "holding" | "ready" | "undo" | "pending"

type Gesture = "click" | "click-again" | "hold"

type PauseReason = "hover" | "focus"

type InlineUndo = {
  window: UndoWindow
  pausable: Set<PauseReason>
}

type ConfirmationOptions = {
  onConfirm: () => void | Promise<unknown>
  onCancel?: () => void
  undo?: boolean | number
  pauseUndoOnHover?: boolean
  pauseUndoOnFocus?: boolean
}

type GestureOptions = {
  gesture?: Gesture
  timeout?: number
  duration?: number
  confirmOnRelease?: boolean
  cancelOnBlur?: boolean
  cancelHoldOnLeave?: boolean
  disabled?: boolean
}

type TriggerProps<T extends Element> = {
  disabled?: boolean
  onClick?(event: React.MouseEvent<T>): void
  onBlur?(event: React.FocusEvent<T>): void
  onFocus?(event: React.FocusEvent<T>): void
  onPointerDown?(event: React.PointerEvent<T>): void
  onPointerUp?(event: React.PointerEvent<T>): void
  onPointerEnter?(event: React.PointerEvent<T>): void
  onPointerLeave?(event: React.PointerEvent<T>): void
  onPointerCancel?(event: React.PointerEvent<T>): void
  onKeyDown?(event: React.KeyboardEvent<T>): void
  onKeyUp?(event: React.KeyboardEvent<T>): void
  onContextMenu?(event: React.MouseEvent<T>): void
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

function isPressKey(event: React.KeyboardEvent) {
  return event.key === " " || event.key === "Enter"
}

function isInside(event: React.PointerEvent) {
  const rect = event.currentTarget.getBoundingClientRect()
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  )
}

function useConfirmationMachine(options: ConfirmationOptions) {
  const [state, setState] = React.useState<ConfirmationState>("idle")
  const fillRef = React.useRef<HTMLSpanElement>(null)
  const animationRef = React.useRef<Animation | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdStartRef = React.useRef(0)
  const holdDurationRef = React.useRef(0)
  const undoRef = React.useRef<InlineUndo | null>(null)
  const optionsRef = React.useRef(options)

  React.useEffect(() => {
    optionsRef.current = options
  })

  const clearTimer = React.useCallback(() => {
    undoRef.current?.window.cancel()
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

  const confirm = React.useCallback(() => {
    const { undo, onConfirm } = optionsRef.current
    clearTimer()
    if (!undo) return commit(onConfirm)
    cancelAnimation()
    setState("undo")
    const undoWindow = startUndoWindow({
      duration: undo,
      onExpire: () => commit(onConfirm),
      onPauseChange: (paused) => {
        if (paused) animationRef.current?.pause?.()
        else animationRef.current?.play?.()
      },
    })
    undoRef.current = { window: undoWindow, pausable: new Set() }
    animationRef.current =
      fillRef.current?.animate?.([{ scale: "1 1" }, { scale: "0 1" }], {
        duration: undoWindow.duration,
        easing: "linear",
      }) ?? null
  }, [commit, clearTimer, cancelAnimation])

  const pauseUndo = React.useCallback((reason: PauseReason) => {
    const { pauseUndoOnHover = true, pauseUndoOnFocus = true } =
      optionsRef.current
    if (reason === "hover" ? !pauseUndoOnHover : !pauseUndoOnFocus) return
    const undo = undoRef.current
    if (undo?.pausable.has(reason)) undo.window.pause(reason)
  }, [])

  const resumeUndo = React.useCallback((reason: PauseReason) => {
    const undo = undoRef.current
    if (!undo) return
    undo.pausable.add(reason)
    undo.window.resume(reason)
  }, [])

  const arm = React.useCallback(() => {
    setState("armed")
  }, [])

  const hold = React.useCallback(
    (duration: number, waitForRelease: boolean) => {
      const ms = toMs(duration, 1200, 800)
      holdStartRef.current = performance.now()
      holdDurationRef.current = ms
      setState("holding")
      timerRef.current = setTimeout(
        waitForRelease
          ? () => {
              timerRef.current = null
              setState("ready")
            }
          : confirm,
        ms
      )
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

function useConfirmation<T extends Element = HTMLElement>({
  gesture = "click",
  timeout = 3000,
  duration = 1200,
  confirmOnRelease = true,
  cancelOnBlur = true,
  cancelHoldOnLeave = true,
  disabled = false,
  ...options
}: ConfirmationOptions & GestureOptions) {
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
  } = useConfirmationMachine(options)
  const repeatRef = React.useRef(false)
  const undoPressRef = React.useRef(false)

  React.useEffect(() => {
    if (state !== "armed") return
    const timer = setTimeout(cancel, toMs(timeout, 3000, 0))
    return () => clearTimeout(timer)
  }, [state, timeout, cancel])

  const isHold = gesture === "hold"
  const isHolding = state === "holding" || state === "ready"

  function undoFromPress() {
    if (state !== "undo" || !undoPressRef.current) return
    undoPressRef.current = false
    cancel()
  }

  const handlers: Required<Omit<TriggerProps<T>, "disabled">> = {
    onClick() {
      if (isHold) return undoFromPress()
      if (repeatRef.current) return
      if (state === "undo") cancel()
      else if (state === "armed") confirm()
      else if (state === "idle" && gesture === "click") confirm()
      else if (state === "idle") arm()
    },
    onBlur() {
      resumeUndo("focus")
      if (isHolding) release()
      else if (state === "armed" && cancelOnBlur) cancel()
    },
    onFocus() {
      pauseUndo("focus")
    },
    onPointerEnter() {
      pauseUndo("hover")
    },
    onPointerLeave() {
      resumeUndo("hover")
      if (cancelHoldOnLeave && isHolding) release()
    },
    onPointerDown(event) {
      if (!isHold || event.button !== 0) return
      undoPressRef.current = state === "undo"
      if (state !== "idle") return
      const target = event.currentTarget
      if (!cancelHoldOnLeave) target.setPointerCapture?.(event.pointerId)
      else if (target.hasPointerCapture?.(event.pointerId))
        target.releasePointerCapture(event.pointerId)
      hold(duration, confirmOnRelease)
    },
    onPointerUp(event) {
      if (state === "holding") release()
      else if (state === "ready") {
        if (isInside(event)) confirm()
        else release()
      }
    },
    onPointerCancel() {
      if (isHolding) release()
    },
    onKeyDown(event) {
      if (!isHold) {
        repeatRef.current = event.repeat
        return
      }
      if (!isPressKey(event)) return
      event.preventDefault()
      if (event.repeat) return
      undoPressRef.current = state === "undo"
      if (state === "idle") hold(duration, confirmOnRelease)
    },
    onKeyUp(event) {
      if (!isHold) {
        repeatRef.current = false
        return
      }
      if (!isPressKey(event)) return
      if (state === "holding") release()
      else if (state === "ready") confirm()
      else undoFromPress()
    },
    onContextMenu(event) {
      if (isHold) event.preventDefault()
    },
  }

  function getTriggerProps<P extends TriggerProps<T>>(props: P) {
    const composed = { ...props }
    for (const name of Object.keys(handlers) as (keyof typeof handlers)[]) {
      const ours = handlers[name] as (event: unknown) => void
      const theirs = props[name] as ((event: unknown) => void) | undefined
      Object.assign(composed, { [name]: composeHandlers(theirs, ours) })
    }
    return {
      ...composed,
      disabled: (disabled && state !== "undo") || state === "pending",
    }
  }

  return { state, fillRef, getTriggerProps }
}

export {
  useConfirmation,
  useConfirmationMachine,
  composeHandlers,
  type ConfirmationState,
  type ConfirmationOptions,
  type GestureOptions,
  type Gesture,
  type TriggerProps,
}
