"use client"

type UndoPauseReason = "hover" | "focus" | "hidden"

type UndoWindowOptions = {
  duration?: boolean | number
  onExpire: () => void
  onPauseChange?: (paused: boolean) => void
}

type UndoWindow = {
  duration: number
  elapsed: () => number
  paused: () => boolean
  pause: (reason: UndoPauseReason) => void
  resume: (reason: UndoPauseReason) => void
  cancel: () => void
}

function undoDuration(value: boolean | number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 5000
  return Math.min(Math.max(value, 4000), 60000)
}

function startUndoWindow({
  duration,
  onExpire,
  onPauseChange,
}: UndoWindowOptions): UndoWindow {
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
  type UndoWindow,
  type UndoWindowOptions,
  type UndoPauseReason,
}
