"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type HoldButtonProps = React.ComponentProps<typeof Button> & {
  onConfirm: () => void
  duration?: number
}

function HoldButton({
  onConfirm,
  duration = 1200,
  className,
  children,
  ...props
}: HoldButtonProps) {
  const fill = React.useRef<HTMLSpanElement>(null)
  const animation = React.useRef<Animation | null>(null)
  const [confirmed, setConfirmed] = React.useState(false)
  const hintId = React.useId()
  const hold = Math.max(duration, 800)

  const start = () => {
    if (animation.current || !fill.current) return
    setConfirmed(false)
    animation.current = fill.current.animate(
      [{ scale: "0 1" }, { scale: "1 1" }],
      { duration: hold, fill: "forwards" }
    )
    animation.current.onfinish = () => {
      setConfirmed(true)
      onConfirm()
    }
  }

  const stop = () => {
    const current = animation.current
    if (!current || !fill.current) return
    const progress = Math.min(Number(current.currentTime) / hold, 1)
    current.cancel()
    animation.current = null
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    fill.current.animate([{ scale: `${progress} 1` }, { scale: "0 1" }], {
      duration: 200,
      easing: "ease-out",
    })
  }

  React.useEffect(() => () => animation.current?.cancel(), [])

  return (
    <>
      <Button
        aria-describedby={hintId}
        className={cn("relative touch-none overflow-hidden", className)}
        onPointerDown={(event) => {
          if (event.button === 0) start()
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(event) => {
          if (event.key !== " " && event.key !== "Enter") return
          event.preventDefault()
          if (!event.repeat) start()
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") stop()
        }}
        onBlur={stop}
        onContextMenu={(event) => event.preventDefault()}
        {...props}
      >
        <span
          ref={fill}
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
        />
        {children}
      </Button>
      <span id={hintId} className="sr-only">
        Press and hold to confirm
      </span>
      <span aria-live="polite" className="sr-only">
        {confirmed ? "Confirmed" : ""}
      </span>
    </>
  )
}

export { HoldButton, type HoldButtonProps }
