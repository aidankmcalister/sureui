import * as React from "react"

import { Button } from "@/components/ui/button"

function useClickAgain({ timeout = 3000 }: { timeout?: number } = {}) {
  const [armed, setArmed] = React.useState(false)
  const pending = React.useRef<((value: boolean) => void) | null>(null)
  const armedAt = React.useRef(0)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const settle = React.useCallback((value: boolean) => {
    clearTimeout(timer.current)
    pending.current?.(value)
    pending.current = null
    setArmed(false)
  }, [])

  const request = React.useCallback(() => {
    if (pending.current) {
      if (performance.now() - armedAt.current > 300) settle(true)
      return Promise.resolve(false)
    }
    armedAt.current = performance.now()
    timer.current = setTimeout(() => settle(false), timeout)
    setArmed(true)
    return new Promise<boolean>((resolve) => {
      pending.current = resolve
    })
  }, [settle, timeout])

  const cancel = React.useCallback(() => settle(false), [settle])

  React.useEffect(() => cancel, [cancel])

  return { armed, request, cancel }
}

type ClickAgainButtonProps = React.ComponentProps<typeof Button> & {
  onConfirm: () => void
  timeout?: number
  confirmLabel?: React.ReactNode
}

function ClickAgainButton({
  onConfirm,
  timeout = 3000,
  confirmLabel = "Click again to confirm",
  children,
  onClick,
  onBlur,
  ...props
}: ClickAgainButtonProps) {
  const { armed, request, cancel } = useClickAgain({ timeout })
  return (
    <>
      <Button
        data-armed={armed || undefined}
        onClick={async (event) => {
          onClick?.(event)
          if (await request()) onConfirm()
        }}
        onBlur={(event) => {
          onBlur?.(event)
          cancel()
        }}
        {...props}
      >
        {armed ? confirmLabel : children}
      </Button>
      <span aria-live="polite" className="sr-only">
        {armed ? confirmLabel : " "}
      </span>
    </>
  )
}

export { ClickAgainButton, useClickAgain, type ClickAgainButtonProps }
