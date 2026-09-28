"use client"

import * as React from "react"

import { useFill, type Fill } from "@/components/ui/sureui/fill"
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
  const [fill, setFill] = React.useState<Fill | null>(null)
  const [paused, setPaused] = React.useState(false)
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

  React.useEffect(() => clearTimer, [clearTimer])

  const enter = React.useCallback(
    (next: ConfirmationState, nextFill: Fill | null = null) => {
      setState(next)
      setFill(nextFill)
      setPaused(false)
    },
    []
  )

  const commit = React.useCallback(
    (run: ConfirmationOptions["onConfirm"]) => {
      clearTimer()
      let result: ReturnType<ConfirmationOptions["onConfirm"]>
      try {
        result = run()
      } catch (error) {
        enter("idle")
        throw error
      }
      if (
        result &&
        typeof (result as PromiseLike<unknown>).then === "function"
      ) {
        enter("pending")
        ;(async () => {
          try {
            await result
          } finally {
            setState("idle")
          }
        })()
      } else {
        enter("idle")
      }
    },
    [clearTimer, enter]
  )

  const confirm = React.useCallback(() => {
    const { undo, onConfirm } = optionsRef.current
    clearTimer()
    if (!undo) return commit(onConfirm)
    const undoWindow = startUndoWindow({
      duration: undo,
      onExpire: () => commit(onConfirm),
      onPauseChange: setPaused,
    })
    undoRef.current = { window: undoWindow, pausable: new Set() }
    enter("undo", {
      from: 1,
      to: 0,
      duration: undoWindow.duration,
      startedAt: performance.now(),
    })
    setPaused(undoWindow.paused())
  }, [commit, clearTimer, enter])

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
    enter("armed")
  }, [enter])

  const hold = React.useCallback(
    (duration: number, waitForRelease: boolean) => {
      const ms = toMs(duration, 1200, 800)
      holdStartRef.current = performance.now()
      holdDurationRef.current = ms
      enter("holding", {
        from: 0,
        to: 1,
        duration: ms,
        startedAt: holdStartRef.current,
      })
      timerRef.current = setTimeout(
        waitForRelease
          ? () => {
              timerRef.current = null
              setState("ready")
            }
          : confirm,
        ms
      )
    },
    [confirm, enter]
  )

  const release = React.useCallback(() => {
    const now = performance.now()
    const fraction = Math.min(
      (now - holdStartRef.current) / holdDurationRef.current,
      1
    )
    clearTimer()
    enter("idle", {
      from: fraction,
      to: 0,
      duration: 200,
      startedAt: now,
      easing: "ease-out",
    })
    optionsRef.current.onCancel?.()
  }, [clearTimer, enter])

  const cancel = React.useCallback(() => {
    clearTimer()
    enter("idle")
    optionsRef.current.onCancel?.()
  }, [clearTimer, enter])

  return {
    state,
    fill,
    paused,
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
    fill,
    paused,
    arm,
    hold,
    release,
    confirm,
    cancel,
    pauseUndo,
    resumeUndo,
  } = useConfirmationMachine(options)
  const fillRef = React.useRef<HTMLSpanElement>(null)
  useFill(fillRef, fill, paused)
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
  composeHandlers,
  type ConfirmationState,
  type ConfirmationOptions,
  type GestureOptions,
  type Gesture,
  type TriggerProps,
}
