"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { type ConfirmButtonProps } from "@/components/ui/sureui/confirm-button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useConfirmation } from "@/components/ui/sureui/confirmation"

type ClickAgainOptions = {
  gesture?: "click-again"
  timeout?: number
  cancelOnBlur?: boolean
  announcements?: { armed?: string; pending?: string }
}

type HoldOptions = {
  gesture: "hold"
  duration?: number
  confirmOnRelease?: boolean
  cancelHoldOnLeave?: boolean
  holdFallback?: "click-again" | "none"
  announcements?: {
    hold?: string
    ready?: string
    fallback?: string
    pending?: string
  }
}

type PromptOptions = {
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmButtonProps["variant"]
  announcements?: { pending?: string }
}

type PopoverOptions = PromptOptions & {
  gesture: "popover"
  description: React.ReactNode
  title?: string
}

type DialogOptions = PromptOptions & {
  gesture: "dialog"
  title: string
  description?: React.ReactNode
}

type OptionKey =
  | keyof ClickAgainOptions
  | keyof HoldOptions
  | keyof PopoverOptions
  | keyof DialogOptions

type Only<T> = T & { [K in Exclude<OptionKey, keyof T>]?: never }

type Announcements = {
  armed?: string
  hold?: string
  ready?: string
  fallback?: string
  pending?: string
}

type ConfirmSwitchProps = Omit<
  React.ComponentProps<typeof Switch>,
  "onCheckedChange" | "render" | "nativeButton" | "className"
> & {
  onConfirm: (checked: boolean) => void | Promise<unknown>
  onCancel?: () => void
  onCheckedChange?: (checked: boolean) => void
  confirmWhen?: "off" | "on" | "both"
  className?: string
} & (
    | Only<ClickAgainOptions>
    | Only<HoldOptions>
    | Only<PopoverOptions>
    | Only<DialogOptions>
  )

function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
}

function ConfirmSwitch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  onConfirm,
  onCancel,
  confirmWhen = "off",
  gesture = "click-again",
  timeout,
  cancelOnBlur,
  duration,
  confirmOnRelease,
  cancelHoldOnLeave,
  holdFallback = "click-again",
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  announcements,
  disabled,
  readOnly,
  className,
  "aria-describedby": describedBy,
  ...props
}: ConfirmSwitchProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const [pendingValue, setPendingValue] = React.useState<boolean | null>(null)
  const [open, setOpen] = React.useState(false)
  const { confirm, dialog } = useConfirm()
  const hintId = React.useId()
  const latestRef = React.useRef({ checkedProp, onCheckedChange })
  const mountedRef = React.useRef(false)

  React.useEffect(() => {
    latestRef.current = { checkedProp, onCheckedChange }
  })

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const committed = checkedProp ?? uncontrolled
  const next = !committed
  const pending = pendingValue !== null
  const risky =
    confirmWhen === "both" || (confirmWhen === "off" ? committed : next)
  const inline = gesture === "click-again" || gesture === "hold"
  const holding = risky && gesture === "hold"

  function settle(value: boolean) {
    const latest = latestRef.current
    if (latest.checkedProp === undefined) setUncontrolled(value)
    latest.onCheckedChange?.(value)
  }

  function commit(value: boolean) {
    const result = onConfirm(value)
    if (!isPromise(result)) {
      settle(value)
      return result
    }
    setPendingValue(value)
    result.then(
      () => {
        setPendingValue(null)
        settle(value)
      },
      () => setPendingValue(null)
    )
    return result
  }

  async function ask(value: boolean) {
    const confirmed = await confirm({
      title: title ?? "",
      description,
      confirmLabel: confirmLabel ?? (value ? "Turn on" : "Turn off"),
      cancelLabel,
      variant,
      onConfirm: () => commit(value),
    })
    if (!confirmed && mountedRef.current) onCancel?.()
  }

  function handleConfirm() {
    if (pending || open) return
    if (!risky || inline) return commit(next)
    if (gesture === "popover") return setOpen(true)
    ask(next)
  }

  const { state, fillRef, getTriggerProps } = useConfirmation<HTMLElement>({
    onConfirm: handleConfirm,
    onCancel,
    gesture: risky && inline ? gesture : "click",
    timeout,
    cancelOnBlur,
    duration,
    confirmOnRelease,
    cancelHoldOnLeave,
    holdFallback,
    disabled,
  })

  const say: Announcements = announcements ?? {}
  const verb = next ? "turn on" : "turn off"
  const message = pending
    ? (say.pending ?? (pendingValue ? "Turning on" : "Turning off"))
    : state === "ready"
      ? (say.ready ?? `Release to ${verb}`)
      : state === "armed" && holding
        ? (say.fallback ?? `Activate again to ${verb}`)
        : state === "armed"
          ? (say.armed ?? `Click again to ${verb}`)
          : ""

  const control = (
    <Switch
      {...(readOnly ? props : getTriggerProps(props))}
      checked={pendingValue ?? committed}
      disabled={disabled}
      readOnly={readOnly}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      aria-describedby={
        holding ? [hintId, describedBy].filter(Boolean).join(" ") : describedBy
      }
      data-state={pending ? "pending" : state}
      nativeButton
      render={(renderProps) => (
        <button {...renderProps}>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span
              ref={fillRef}
              className={cn(
                "absolute inset-0 scale-x-0",
                next ? "origin-left bg-primary" : "origin-right bg-input"
              )}
            />
          </span>
          {renderProps.children}
        </button>
      )}
      className={cn(
        "data-[state=pending]:cursor-progress data-[state=pending]:opacity-60 data-[state=armed]:data-checked:bg-primary/50 data-[state=armed]:data-unchecked:bg-primary/50 dark:data-[state=armed]:data-unchecked:bg-primary/50",
        holding && "touch-none",
        className
      )}
    />
  )

  return (
    <>
      {gesture === "popover" ? (
        <ConfirmPopover
          open={open}
          onOpenChange={(value) => {
            if (!value) setOpen(false)
          }}
          title={title}
          description={description}
          confirmLabel={confirmLabel ?? (next ? "Turn on" : "Turn off")}
          cancelLabel={cancelLabel}
          variant={variant}
          onConfirm={() => commit(next)}
          onCancel={onCancel}
        >
          {control}
        </ConfirmPopover>
      ) : (
        control
      )}
      {holding && (
        <span id={hintId} className="sr-only">
          {say.hold ??
            (holdFallback === "none"
              ? `Press and hold to ${verb}`
              : `Press and hold, or activate twice, to ${verb}`)}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
      {gesture === "dialog" && dialog}
    </>
  )
}

export { ConfirmSwitch, type ConfirmSwitchProps }
