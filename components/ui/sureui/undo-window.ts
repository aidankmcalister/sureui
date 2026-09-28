"use client"

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

export {
  startUndoWindow,
  type UndoDuration,
  type UndoWindow,
  type UndoWindowOptions,
  type UndoPauseReason,
}
