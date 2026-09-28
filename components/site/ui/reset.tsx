"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { siteButton } from "@/components/site/ui/button"

const ResetContext = React.createContext({ version: 0, reset() {} })

function ResetButton({
  onReset,
  className,
}: {
  onReset: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label="Reset example"
      title="Reset"
      onClick={onReset}
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

function ResetScope({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = React.useState(0)
  const reset = React.useCallback(() => setVersion((value) => value + 1), [])
  const value = React.useMemo(() => ({ version, reset }), [version, reset])
  return <ResetContext value={value}>{children}</ResetContext>
}

function ResetTrigger({ className }: { className?: string }) {
  const { reset } = React.useContext(ResetContext)
  return <ResetButton onReset={reset} className={className} />
}

function ResetContent({ children }: { children: React.ReactNode }) {
  const { version } = React.useContext(ResetContext)
  return <React.Fragment key={version}>{children}</React.Fragment>
}

export { ResetButton, ResetContent, ResetScope, ResetTrigger }
