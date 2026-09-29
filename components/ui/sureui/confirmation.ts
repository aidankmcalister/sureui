"use client"

import * as React from "react"

type Fill = {
  from: number
  to: number
  duration: number
  startedAt: number
  easing?: string
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function keyframes(element: Element, fill: Fill) {
  if (element instanceof SVGElement)
    return [
      { strokeDashoffset: `${1 - fill.from}` },
      { strokeDashoffset: `${1 - fill.to}` },
    ]
  return [{ scale: `${fill.from} 1` }, { scale: `${fill.to} 1` }]
}

function playFill(element: Element | null, fill: Fill) {
  if (!element || typeof element.animate !== "function") return null
  const animation = element.animate(keyframes(element, fill), {
    duration: fill.duration,
    easing: prefersReducedMotion() ? "step-end" : (fill.easing ?? "linear"),
    fill: "forwards",
  })
  animation.currentTime = performance.now() - fill.startedAt
  return animation
}

function useFill(
  ref: React.RefObject<Element | null>,
  fill: Fill | null,
  paused: boolean
) {
  const animationRef = React.useRef<Animation | null>(null)

  React.useEffect(() => {
    if (!fill) return
    const animation = playFill(ref.current, fill)
    animationRef.current = animation
    return () => {
      animation?.cancel()
      animationRef.current = null
    }
  }, [ref, fill])

  React.useEffect(() => {
    const animation = animationRef.current
    if (paused) animation?.pause()
    else if (animation?.playState === "paused") animation.play()
  }, [paused, fill])
}

type UndoPauseReason = "hover" | "focus" | "hidden"

type UndoDuration = boolean | number | "manual"

type UndoWindowOptions = {
  duration?: UndoDuration
  onExpire: () => void
  onPauseChange?: (paused: boolean) => void
  within?: () => Element | null
}

type UndoWindow = {
  duration: number
  manual: boolean
  elapsed: () => number
  paused: () => boolean
  pause: (reason: UndoPauseReason) => void
  resume: (reason: UndoPauseReason) => void
  cancel: () => void
}

function undoDuration(value: UndoDuration | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 5000
  return Math.min(Math.max(value, 4000), 60000)
}

function startManualWindow({
  onExpire,
  within,
}: UndoWindowOptions): UndoWindow {
  let open = true

  function stop() {
    open = false
    document.removeEventListener("pointerdown", onOutside, true)
    document.removeEventListener("focusin", onOutside, true)
  }

  function onOutside(event: Event) {
    const container = within?.()
    const target = event.target
    if (!open || !container || !(target instanceof Node)) return
    if (container.contains(target)) return
    stop()
    onExpire()
  }

  if (within) {
    document.addEventListener("pointerdown", onOutside, true)
    document.addEventListener("focusin", onOutside, true)
  }

  return {
    duration: Infinity,
    manual: true,
    elapsed: () => 0,
    paused: () => false,
    pause: () => {},
    resume: () => {},
    cancel: stop,
  }
}

function startUndoWindow(options: UndoWindowOptions): UndoWindow {
  const { duration, onExpire, onPauseChange } = options
  if (duration === "manual") return startManualWindow(options)
  const total = undoDuration(duration)
  const pausedBy = new Set<UndoPauseReason>()
  let open = true
  let remaining = total
  let startedAt = performance.now()
  let timer = setTimeout(expire, remaining)

  function stop() {
    open = false
    clearTimeout(timer)
    document.removeEventListener("visibilitychange", onVisibilityChange)
  }

  function expire() {
    stop()
    onExpire()
  }

  function pause(reason: UndoPauseReason) {
    if (!open || pausedBy.has(reason)) return
    pausedBy.add(reason)
    if (pausedBy.size > 1) return
    clearTimeout(timer)
    remaining -= performance.now() - startedAt
    onPauseChange?.(true)
  }

  function resume(reason: UndoPauseReason) {
    if (!open || !pausedBy.delete(reason) || pausedBy.size > 0) return
    startedAt = performance.now()
    timer = setTimeout(expire, remaining)
    onPauseChange?.(false)
  }

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") pause("hidden")
    else resume("hidden")
  }

  document.addEventListener("visibilitychange", onVisibilityChange)
  onVisibilityChange()

  return {
    duration: total,
    manual: false,
    elapsed: () =>
      total -
      remaining +
      (pausedBy.size > 0 ? 0 : performance.now() - startedAt),
    paused: () => pausedBy.size > 0,
    pause,
    resume,
    cancel: stop,
  }
}

type ConfirmationState = "idle" | "armed" | "holding" | "undo" | "pending"

type PauseReason = "hover" | "focus"

type InlineUndo = {
  window: UndoWindow
  pausable: Set<PauseReason>
}

interface ConfirmationOptions {
  onConfirm: () => void | Promise<unknown>
  onCancel?: () => void
  onConfirmError?: (error: unknown) => void
  undo?: boolean | number | "manual"
  pauseUndoOnHover?: boolean
  pauseUndoOnFocus?: boolean
}

interface GestureOptions {
  gesture?: "click" | "click-again" | "hold"
  timeout?: number
  duration?: number
  holdFallback?: "click-again" | "none"
  armDelay?: number
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
  onMouseDown?(event: React.MouseEvent<T>): void
}

function hasSelection() {
  const selection = window.getSelection()
  return !!selection && !selection.isCollapsed
}

function clearSelection() {
  if (hasSelection()) window.getSelection()?.removeAllRanges()
}

function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
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

function isVirtualPress(event: React.PointerEvent) {
  const { width, height, pressure, pointerType } = event.nativeEvent
  const android = /Android/i.test(navigator.userAgent)
  if (width < 1 && height < 1) return !android
  return (
    android &&
    pointerType === "mouse" &&
    width === 1 &&
    height === 1 &&
    pressure === 0
  )
}

function useConfirmationMachine(
  options: ConfirmationOptions,
  triggerRef: React.RefObject<Element | null>
) {
  const [state, setState] = React.useState<ConfirmationState>("idle")
  const [fill, setFill] = React.useState<Fill | null>(null)
  const [paused, setPaused] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
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
      setFailed(false)
    },
    []
  )

  const fail = React.useCallback((error: unknown) => {
    setFailed(true)
    const { onConfirmError } = optionsRef.current
    if (!onConfirmError) throw error
    onConfirmError(error)
  }, [])

  const commit = React.useCallback(
    (run: ConfirmationOptions["onConfirm"]) => {
      clearTimer()
      let result: ReturnType<ConfirmationOptions["onConfirm"]>
      try {
        result = run()
      } catch (error) {
        enter("idle")
        return fail(error)
      }
      if (isPromise(result)) {
        enter("pending")
        ;(async () => {
          try {
            await result
            setState("idle")
          } catch (error) {
            setState("idle")
            fail(error)
          }
        })()
      } else {
        enter("idle")
      }
    },
    [clearTimer, enter, fail]
  )

  const confirm = React.useCallback(() => {
    const { undo, onConfirm } = optionsRef.current
    clearTimer()
    if (!undo) return commit(onConfirm)
    const undoWindow = startUndoWindow({
      duration: undo,
      onExpire: () => commit(onConfirm),
      onPauseChange: setPaused,
      within: () => triggerRef.current,
    })
    undoRef.current = { window: undoWindow, pausable: new Set() }
    enter(
      "undo",
      undoWindow.manual
        ? null
        : {
            from: 1,
            to: 0,
            duration: undoWindow.duration,
            startedAt: performance.now(),
          }
    )
    setPaused(undoWindow.paused())
  }, [commit, clearTimer, enter, triggerRef])

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
    clearTimer()
    enter("armed")
  }, [clearTimer, enter])

  const hold = React.useCallback(
    (duration: number) => {
      const ms = toMs(duration, 1200, 800)
      holdStartRef.current = performance.now()
      holdDurationRef.current = ms
      enter("holding", {
        from: 0,
        to: 1,
        duration: ms,
        startedAt: holdStartRef.current,
      })
      timerRef.current = setTimeout(confirm, ms)
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

  const reset = React.useCallback(() => {
    clearTimer()
    enter("idle")
  }, [clearTimer, enter])

  return {
    state,
    fill,
    paused,
    failed,
    arm,
    hold,
    release,
    confirm,
    cancel,
    pauseUndo,
    resumeUndo,
    reset,
  }
}

function useConfirmation<
  T extends Element = HTMLElement,
  F extends Element = HTMLSpanElement,
>({
  gesture = "click",
  timeout = 3000,
  duration = 1200,
  holdFallback = "click-again",
  armDelay = 0,
  disabled = false,
  ...options
}: ConfirmationOptions & GestureOptions) {
  const triggerRef = React.useRef<T | null>(null)
  const {
    state,
    fill,
    paused,
    failed,
    arm,
    hold,
    release,
    confirm,
    cancel,
    pauseUndo,
    resumeUndo,
    reset,
  } = useConfirmationMachine(options, triggerRef)
  const fillRef = React.useRef<F>(null)
  useFill(fillRef, fill, paused)
  const armDelayRef = React.useRef(armDelay)
  const quietRef = React.useRef(false)
  const quietTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const repeatRef = React.useRef(false)
  const undoPressRef = React.useRef(false)
  const pressRef = React.useRef<"none" | "pointer" | "virtual" | "key">("none")
  const fallbackRef = React.useRef(false)
  const selectedRef = React.useRef(false)

  React.useEffect(() => {
    armDelayRef.current = armDelay
  })

  const quiet = React.useCallback(() => {
    const ms = toMs(armDelayRef.current, 0, 0)
    if (quietTimerRef.current !== null) clearTimeout(quietTimerRef.current)
    quietTimerRef.current = null
    quietRef.current = ms > 0
    if (ms <= 0) return
    quietTimerRef.current = setTimeout(() => {
      quietTimerRef.current = null
      quietRef.current = false
    }, ms)
  }, [])

  React.useEffect(() => {
    quiet()
    return () => {
      if (quietTimerRef.current !== null) clearTimeout(quietTimerRef.current)
      quietTimerRef.current = null
      quietRef.current = false
    }
  }, [quiet])

  React.useEffect(() => {
    if (state !== "armed") fallbackRef.current = false
  }, [state])

  React.useEffect(() => {
    if (state !== "armed" || fallbackRef.current) return
    const timer = setTimeout(cancel, toMs(timeout, 3000, 0))
    return () => clearTimeout(timer)
  }, [state, timeout, cancel])

  const isHold = gesture === "hold"
  const isHolding = state === "holding"
  const fallback = isHold && holdFallback === "click-again"
  const fallbackArmed = state === "armed" && fallbackRef.current

  function undoFromPress() {
    if (state !== "undo" || !undoPressRef.current) return
    undoPressRef.current = false
    cancel()
  }

  function armNow() {
    arm()
    quiet()
  }

  function armFallback() {
    fallbackRef.current = true
    armNow()
  }

  function holdClick() {
    const press = pressRef.current
    pressRef.current = "none"
    const unpressed = press === "none" || press === "virtual"
    if (state === "undo") {
      if (fallback && press === "none") undoPressRef.current = true
      return undoFromPress()
    }
    if (!fallback) return
    if (fallbackArmed) confirm()
    else if (state === "idle" && unpressed) armFallback()
  }

  const handlers: Required<Omit<TriggerProps<T>, "disabled">> = {
    onClick() {
      if (quietRef.current) return
      if (isHold) return holdClick()
      if (repeatRef.current) return
      if (state === "undo") cancel()
      else if (state === "armed") confirm()
      else if (state === "idle" && gesture === "click") confirm()
      else if (state === "idle") armNow()
    },
    onBlur() {
      resumeUndo("focus")
      if (isHolding) release()
      else if (state === "armed") cancel()
    },
    onFocus() {
      pauseUndo("focus")
    },
    onPointerEnter() {
      pauseUndo("hover")
    },
    onPointerLeave() {
      resumeUndo("hover")
      if (isHolding) release()
    },
    onPointerDown(event) {
      selectedRef.current = hasSelection()
      if (!isHold || event.button !== 0 || quietRef.current) return
      pressRef.current = isVirtualPress(event) ? "virtual" : "pointer"
      undoPressRef.current = state === "undo"
      if (state !== "idle") return
      const target = event.currentTarget
      if (target.hasPointerCapture?.(event.pointerId))
        target.releasePointerCapture(event.pointerId)
      hold(duration)
    },
    onPointerUp(event) {
      if (event.pointerType === "touch" && !selectedRef.current) {
        requestAnimationFrame(clearSelection)
      }
      if (state !== "holding") return
      if (fallback && pressRef.current === "virtual") reset()
      else release()
    },
    onPointerCancel() {
      if (isHolding) release()
    },
    onKeyDown(event) {
      if (!isHold) {
        repeatRef.current = event.repeat
        return
      }
      if (event.key === "Escape" && fallbackArmed) return cancel()
      if (!isPressKey(event)) return
      event.preventDefault()
      if (event.repeat || quietRef.current) return
      pressRef.current = "key"
      undoPressRef.current = state === "undo"
      if (state === "idle") hold(duration)
    },
    onKeyUp(event) {
      if (!isHold) {
        repeatRef.current = false
        return
      }
      if (!isPressKey(event)) return
      const pressed = pressRef.current === "key"
      pressRef.current = "none"
      if (state === "holding") release()
      else if (fallbackArmed && pressed) confirm()
      else undoFromPress()
    },
    onMouseDown(event) {
      if (event.detail > 1) event.preventDefault()
    },
    onContextMenu(event) {
      if (isHold) event.preventDefault()
    },
  }

  function getTriggerProps<P extends TriggerProps<T>>(props: P) {
    const composed = { ...props }
    for (const name of Object.keys(handlers) as (keyof typeof handlers)[]) {
      const handler = handlers[name] as (event: unknown) => void
      const theirs = props[name] as ((event: unknown) => void) | undefined
      const ours = (event: { currentTarget: T }) => {
        triggerRef.current = event.currentTarget
        handler(event)
      }
      Object.assign(composed, { [name]: composeHandlers(theirs, ours) })
    }
    return {
      ...composed,
      disabled: (disabled && state !== "undo") || state === "pending",
    }
  }

  return { state, failed, fillRef, getTriggerProps }
}

type ConfirmationAnnouncements = {
  hold?: string
  armed?: string
  fallback?: string
  undo?: string
  error?: string
}

interface ConfirmationLabelOptions {
  state: ConfirmationState
  failed: boolean
  gesture: NonNullable<GestureOptions["gesture"]>
  holdFallback: NonNullable<GestureOptions["holdFallback"]>
  undo: ConfirmationOptions["undo"]
  label: React.ReactNode
  confirmLabel?: React.ReactNode
  undoLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  announcements?: ConfirmationAnnouncements
  ariaLabel?: string
  describedBy?: string
}

function text(node: React.ReactNode, fallback: string) {
  return typeof node === "string" ? node : fallback
}

function useConfirmationLabels(options: ConfirmationLabelOptions) {
  const {
    state,
    failed,
    gesture,
    holdFallback,
    undo,
    label,
    confirmLabel,
    undoLabel = "Undo",
    errorLabel,
    announcements,
    ariaLabel,
    describedBy,
  } = options
  const hintId = React.useId()
  const isHold = gesture === "hold"
  const showError = failed && state === "idle" && errorLabel != null
  const shown =
    state === "armed" || state === "undo" ? state : showError ? "error" : "idle"
  const labels: { state: string; node: React.ReactNode }[] = [
    { state: "idle", node: label },
  ]
  if (
    gesture === "click-again" ||
    (isHold && (confirmLabel != null || holdFallback !== "none"))
  ) {
    labels.push({
      state: "armed",
      node: confirmLabel ?? (isHold ? "Confirm" : "Click again to confirm"),
    })
  }
  if (undo) labels.push({ state: "undo", node: undoLabel })
  if (errorLabel != null) labels.push({ state: "error", node: errorLabel })

  let announcement = ""
  if (state === "armed" && isHold) {
    announcement = announcements?.fallback ?? "Activate again to confirm"
  } else if (state === "armed") {
    announcement =
      announcements?.armed ?? text(confirmLabel, "Click again to confirm")
  } else if (state === "undo") {
    announcement = announcements?.undo ?? "Done. Undo is available."
  } else if (showError) {
    announcement =
      announcements?.error ??
      text(errorLabel, "Failed. Activate again to retry.")
  }

  return {
    shown,
    labels,
    ariaLabel:
      ariaLabel && shown === "undo"
        ? text(undoLabel, ariaLabel)
        : ariaLabel && shown === "error"
          ? text(errorLabel, ariaLabel)
          : ariaLabel,
    ariaDescribedBy: isHold
      ? [hintId, describedBy].filter(Boolean).join(" ")
      : describedBy,
    hint: isHold
      ? {
          id: hintId,
          text:
            announcements?.hold ??
            (holdFallback === "none"
              ? "Press and hold to confirm"
              : "Press and hold, or activate twice, to confirm"),
        }
      : null,
    announcement,
  }
}

export {
  useConfirmation,
  useConfirmationLabels,
  composeHandlers,
  isPromise,
  playFill,
  useFill,
  startUndoWindow,
  type ConfirmationState,
  type ConfirmationAnnouncements,
  type ConfirmationOptions,
  type GestureOptions,
  type Fill,
  type UndoWindow,
}
