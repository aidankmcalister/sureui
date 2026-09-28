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

export { playFill, useFill, type Fill }
