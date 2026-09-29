"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { siteButton } from "@/components/site/ui/button"

const ResetContext = React.createContext<{
  version: number
  reset: () => void
  left: number
  setLeft: (left: number) => void
}>({ version: 0, reset() {}, left: 0, setLeft() {} })

function ResetScope({
  onReset,
  children,
}: {
  onReset?: () => void
  children: React.ReactNode
}) {
  const [version, setVersion] = React.useState(0)
  const [left, setLeft] = React.useState(0)

  function reset() {
    setLeft(0)
    setVersion((value) => value + 1)
    onReset?.()
  }

  return (
    <ResetContext value={{ version, reset, left, setLeft }}>
      {children}
    </ResetContext>
  )
}

function useReset() {
  return React.useContext(ResetContext).reset
}

function useAutoReset(after: number, seconds = 5) {
  const { version, reset, setLeft } = React.useContext(ResetContext)
  const resetRef = React.useRef(reset)

  React.useEffect(() => {
    resetRef.current = reset
  })

  React.useEffect(() => {
    let count = seconds
    let tick: ReturnType<typeof setTimeout>
    function step() {
      if (count === 0) return resetRef.current()
      setLeft(count)
      count -= 1
      tick = setTimeout(step, 1000)
    }
    tick = setTimeout(step, after)
    return () => {
      clearTimeout(tick)
      setLeft(0)
    }
  }, [version, after, seconds, setLeft])
}

function ResetTrigger({ className }: { className?: string }) {
  const { reset, left } = React.useContext(ResetContext)
  return (
    <span className="flex items-center gap-2">
      {left > 0 && (
        <span
          aria-live="polite"
          className="font-mono text-[11px] tracking-widest text-(--ink-label) uppercase tabular-nums"
        >
          Resetting in {left}
        </span>
      )}
      <button
        type="button"
        aria-label="Reset example"
        title="Reset"
        onClick={reset}
        className={siteButton({
          variant: "ghost",
          size: "icon",
          className: `size-7 rounded-full [&_svg:not([class*='size-'])]:size-3.5 ${className ?? ""}`,
        })}
      >
        <RotateCcwIcon />
      </button>
    </span>
  )
}

function ResetContent({ children }: { children: React.ReactNode }) {
  const { version } = React.useContext(ResetContext)
  return <React.Fragment key={version}>{children}</React.Fragment>
}

export { ResetContent, ResetScope, ResetTrigger, useAutoReset, useReset }
