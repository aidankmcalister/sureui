"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  useConfirmation,
  useConfirmationLabels,
  type ConfirmationAnnouncements,
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmButtonProps
  extends
    React.ComponentProps<typeof Button>,
    ConfirmationOptions,
    GestureOptions {
  confirmLabel?: React.ReactNode
  undoLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  waitLabel?: (seconds: number) => React.ReactNode
  pendingIndicator?: "ring" | "spinner" | "pulse"
  pendingLabel?: React.ReactNode
  pendingDelay?: number
  successLabel?: React.ReactNode
  announcements?: ConfirmationAnnouncements
}

function useSpin<T extends Element>(duration: number) {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (still || typeof element.animate !== "function") return
    const animation = element.animate(
      [{ rotate: "0deg" }, { rotate: "360deg" }],
      { duration, iterations: Infinity }
    )
    return () => animation.cancel()
  }, [duration])

  return ref
}

function Spinner() {
  const ref = useSpin<SVGSVGElement>(800)

  return (
    <svg ref={ref} viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0">
      <circle
        cx="12"
        cy="12"
        r="9"
        pathLength={1}
        strokeDasharray="0.7 0.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function outline(button: HTMLElement, gap: number) {
  const style = getComputedStyle(button)
  const out = (parseFloat(style.borderTopWidth) || 0) + gap
  const width = button.clientWidth + out * 2
  const height = button.clientHeight + out * 2
  const corner = (value: string) =>
    Math.min((parseFloat(value) || 0) + gap, width / 2, height / 2)
  const tl = corner(style.borderTopLeftRadius)
  const tr = corner(style.borderTopRightRadius)
  const br = corner(style.borderBottomRightRadius)
  const bl = corner(style.borderBottomLeftRadius)
  const right = width - out
  const bottom = height - out
  return [
    `M${tl - out},${-out}`,
    `H${right - tr}`,
    `A${tr},${tr} 0 0 1 ${right},${tr - out}`,
    `V${bottom - br}`,
    `A${br},${br} 0 0 1 ${right - br},${bottom}`,
    `H${bl - out}`,
    `A${bl},${bl} 0 0 1 ${-out},${bottom - bl}`,
    `V${tl - out}`,
    `A${tl},${tl} 0 0 1 ${tl - out},${-out}`,
    "Z",
  ].join(" ")
}

function Ring(props: { className?: string }) {
  const ref = React.useRef<SVGPathElement>(null)

  React.useEffect(() => {
    const path = ref.current
    const button = path?.closest("button")
    if (!path || !button) return
    const draw = () => path.setAttribute("d", outline(button, 3))
    draw()
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(draw) : null
    observer?.observe(button)
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const animation =
      still || typeof path.animate !== "function"
        ? null
        : path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
            duration: 1400,
            iterations: Infinity,
          })
    return () => {
      observer?.disconnect()
      animation?.cancel()
    }
  }, [])

  return (
    <svg
      aria-hidden
      data-slot="pending-ring"
      className={cn(
        "pointer-events-none absolute inset-0 size-full overflow-visible",
        props.className
      )}
    >
      <path
        ref={ref}
        pathLength={1}
        strokeDasharray="0.3 0.7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  )
}

function pendingContent(
  indicator: NonNullable<ConfirmButtonProps["pendingIndicator"]>,
  label: React.ReactNode
) {
  if (indicator !== "spinner") return label ?? undefined
  return (
    <>
      <Spinner />
      {label}
    </>
  )
}

function ConfirmButton(props: ConfirmButtonProps) {
  const {
    onConfirm,
    onCancel,
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    gesture = "click",
    timeout,
    duration,
    holdFallback = "click-again",
    armDelay,
    wait,
    disabled,
    confirmLabel,
    undoLabel,
    errorLabel,
    waitLabel,
    pendingIndicator = "ring",
    pendingLabel,
    pendingDelay,
    successLabel,
    announcements,
    className,
    children,
    "aria-describedby": describedBy,
    ...rest
  } = props
  const { state, failed, waiting, fillRef, getTriggerProps } =
    useConfirmation<HTMLButtonElement>({
      onConfirm,
      onCancel,
      onConfirmError,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
      gesture,
      timeout,
      duration,
      holdFallback,
      armDelay,
      wait,
      disabled,
    })
  const {
    shown,
    busy,
    labels,
    ariaLabel,
    ariaDescribedBy,
    hint,
    announcement,
  } = useConfirmationLabels({
    state,
    failed,
    gesture,
    holdFallback,
    undo,
    label: children,
    confirmLabel,
    undoLabel,
    errorLabel,
    wait,
    waiting,
    waitLabel,
    pendingLabel: pendingContent(pendingIndicator, pendingLabel),
    pendingDelay,
    successLabel,
    announcements,
    ariaLabel: rest["aria-label"],
    describedBy,
  })

  return (
    <>
      <Button
        {...getTriggerProps(rest)}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-state={state}
        data-error={failed || undefined}
        aria-busy={state === "pending" || undefined}
        data-pending={busy || undefined}
        className={cn(
          "relative transition-[color,background-color,border-color,box-shadow] active:not-aria-[haspopup]:translate-none aria-disabled:opacity-50",
          pendingIndicator === "pulse"
            ? "motion-safe:data-pending:animate-pulse motion-safe:aria-disabled:data-[state=pending]:opacity-100"
            : "aria-disabled:data-[state=pending]:opacity-100",
          gesture === "hold"
            ? "touch-none"
            : gesture === "slide"
              ? "touch-pan-y"
              : "touch-manipulation",
          className
        )}
        focusableWhenDisabled={
          rest.focusableWhenDisabled || state === "pending"
        }
      >
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span
            ref={fillRef}
            className="absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
          />
        </span>
        {busy && pendingIndicator === "ring" && (
          <Ring
            className={
              rest.variant === "destructive"
                ? "text-destructive"
                : !rest.variant || rest.variant === "default"
                  ? "text-primary"
                  : undefined
            }
          />
        )}
        <span className="grid gap-[inherit]">
          {labels.map((label) => (
            <span
              key={label.state}
              aria-hidden={label.state !== shown || undefined}
              className={cn(
                "col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]",
                label.state !== shown && "invisible"
              )}
            >
              {label.node}
            </span>
          ))}
        </span>
      </Button>
      {hint && (
        <span id={hint.id} className="sr-only">
          {hint.text}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
