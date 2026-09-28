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

function playFill(element: HTMLElement | null, fill: Fill) {
  if (typeof element?.animate !== "function") return null
  const animation = element.animate(
    [{ scale: `${fill.from} 1` }, { scale: `${fill.to} 1` }],
    {
      duration: fill.duration,
      easing: prefersReducedMotion() ? "step-end" : (fill.easing ?? "linear"),
      fill: "forwards",
    }
  )
  animation.currentTime = performance.now() - fill.startedAt
  return animation
}

function useFill(
  ref: React.RefObject<HTMLElement | null>,
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

export { playFill, useFill, type Fill }
