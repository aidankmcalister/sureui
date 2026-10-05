"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import {
  isPromise,
  useConfirmation,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmSwitchProps
  extends
    Omit<
      React.ComponentProps<typeof Switch>,
      "onCheckedChange" | "render" | "nativeButton"
    >,
    Omit<ConfirmationOptions, "onConfirm"> {
  onConfirm: (checked: boolean) => void | Promise<unknown>
  onCheckedChange?: (checked: boolean) => void
  confirmWhen?: "on" | "off" | "both"
  undoIndicator?: "thumb" | "ring"
  undoLabel?: boolean | ((seconds: number) => React.ReactNode)
  undoLabelSide?: "left" | "right"
  announcements?: { undo?: string; error?: string }
}

function ConfirmSwitch(props: ConfirmSwitchProps) {
  const {
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    onConfirm,
    onCancel,
    onConfirmError,
    undo = true,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    confirmWhen = "both",
    undoIndicator = "thumb",
    undoLabel = false,
    undoLabelSide = "left",
    announcements,
    disabled,
    size,
    className,
    ...rest
  } = props
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const [target, setTarget] = React.useState(defaultChecked)
  const committed = checkedProp ?? uncontrolled
  const next = !committed
  const guarded =
    confirmWhen === "both" || (confirmWhen === "on" ? next : committed)

  function settle(value: boolean) {
    if (checkedProp === undefined) setUncontrolled(value)
    onCheckedChange?.(value)
  }

  const { state, failed, undoSeconds, fillRef, getTriggerProps } =
    useConfirmation<HTMLElement, SVGGeometryElement>({
      onConfirm: () => {
        const value = next
        const result = onConfirm(value)
        if (!isPromise(result)) return settle(value)
        return Promise.resolve(result).then(() => settle(value))
      },
      onCancel,
      onConfirmError,
      undo: guarded ? undo : false,
      pauseUndoOnHover,
      pauseUndoOnFocus,
      disabled,
    })

  const [previous, setPrevious] = React.useState(state)
  if (state !== previous) {
    setPrevious(state)
    if (previous === "idle") setTarget(next)
  }

  const shown = state === "idle" ? committed : target
  const verb = next ? "on" : "off"

  return (
    <>
      <Switch
        {...getTriggerProps(rest)}
        checked={shown}
        disabled={disabled}
        size={size}
        data-state={state}
        data-error={failed || undefined}
        nativeButton
        render={(renderProps) => (
          <button {...renderProps}>
            {renderProps.children}
            {undoLabel && undoSeconds !== null && (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs font-normal whitespace-nowrap text-muted-foreground tabular-nums",
                  undoLabelSide === "left"
                    ? "right-full mr-2.5"
                    : "left-full ml-2.5"
                )}
              >
                {undoLabel === true
                  ? `Saves in ${undoSeconds}s`
                  : undoLabel(undoSeconds)}
              </span>
            )}
            {undoIndicator === "ring" ? (
              <svg
                aria-hidden
                className="pointer-events-none absolute -inset-[3px] size-[calc(100%+6px)] overflow-visible text-primary"
              >
                <rect
                  ref={fillRef as React.Ref<SVGRectElement>}
                  width="100%"
                  height="100%"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  rx={size === "sm" ? 9 : 11.2}
                />
              </svg>
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-primary transition-transform group-data-[size=sm]/switch:size-3 group-data-checked/switch:translate-x-[calc(100%-2px)] dark:group-data-unchecked/switch:text-background"
              >
                <circle
                  ref={fillRef as React.Ref<SVGCircleElement>}
                  cx={8}
                  cy={8}
                  r={3}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  transform="rotate(-90 8 8)"
                />
              </svg>
            )}
          </button>
        )}
        className={cn(
          "touch-manipulation aria-disabled:opacity-50 motion-safe:data-[state=pending]:animate-pulse",
          className
        )}
      />
      <span aria-live="polite" className="sr-only">
        {state === "undo"
          ? (announcements?.undo ?? `Turned ${verb}. Activate again to undo.`)
          : failed && state === "idle"
            ? (announcements?.error ?? "Failed. The switch was put back.")
            : ""}
      </span>
    </>
  )
}

export { ConfirmSwitch, type ConfirmSwitchProps }
