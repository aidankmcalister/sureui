"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { siteButton } from "@/components/site/ui/button"

const ResetContext = React.createContext({ version: 0, reset() {} })

function ResetScope({
  onReset,
  children,
}: {
  onReset?: () => void
  children: React.ReactNode
}) {
  const [version, setVersion] = React.useState(0)

  function reset() {
    setVersion((value) => value + 1)
    onReset?.()
  }

  return <ResetContext value={{ version, reset }}>{children}</ResetContext>
}

function useReset() {
  return React.useContext(ResetContext).reset
}

function ResetTrigger({ className }: { className?: string }) {
  const reset = useReset()
  return (
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
  )
}

function ResetContent({ children }: { children: React.ReactNode }) {
  const { version } = React.useContext(ResetContext)
  return <React.Fragment key={version}>{children}</React.Fragment>
}

export { ResetContent, ResetScope, ResetTrigger, useReset }
