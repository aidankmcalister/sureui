"use client"

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

import { Button } from "@/components/ui/button"
import {
  composeHandlers,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"
import { useFill, type Fill } from "@/components/ui/sureui/fill"
import {
  startUndoWindow,
  type UndoWindow,
} from "@/components/ui/sureui/undo-window"

type UndoableState = "idle" | "undo" | "pending" | "removed"

type UndoableRenderProps = {
  remove: () => void
  state: UndoableState
}

type UndoableProps = Omit<
  useRender.ComponentProps<"div", { state: UndoableState }>,
  "children"
> &
  ConfirmationOptions & {
    children?:
      React.ReactNode | ((props: UndoableRenderProps) => React.ReactNode)
    label?: React.ReactNode
    undoLabel?: React.ReactNode
    announcements?: {
      undo?: string
    }
  }

type HostProps = {
  style?: React.CSSProperties
  onPointerEnter?: React.PointerEventHandler<HTMLDivElement>
  onPointerLeave?: React.PointerEventHandler<HTMLDivElement>
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  onBlur?: React.FocusEventHandler<HTMLDivElement>
}

type Collapsed = {
  height: number
  columns: number | null
}

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function isPromise(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
}

function pathTo(root: Element, node: Element) {
  const path: number[] = []
  let current: Element | null = node
  while (current && current !== root) {
    const parent: Element | null = current.parentElement
    if (!parent) return null
    path.unshift(Array.prototype.indexOf.call(parent.children, current))
    current = parent
  }
  return current === root ? path : null
}

function follow(root: Element, path: number[] | null) {
  if (!path) return null
  let current: Element | undefined = root
  for (const index of path) current = current?.children[index]
  return current instanceof HTMLElement && current.matches(focusable)
    ? current
    : null
}

function measure(host: HTMLElement): Collapsed {
  return {
    height: host.getBoundingClientRect().height,
    columns:
      host instanceof HTMLTableRowElement
        ? Math.max(
            1,
            Array.from(host.cells).reduce((sum, cell) => sum + cell.colSpan, 0)
          )
        : null,
  }
}

function announcer() {
  let region = document.querySelector<HTMLElement>("[data-sureui-announcer]")
  if (!region) {
    region = document.createElement("div")
    region.setAttribute("data-sureui-announcer", "")
    region.setAttribute("aria-live", "polite")
    region.className = "sr-only"
    document.body.append(region)
  }
  return region
}

function useUndoable({
  onConfirm,
  onCancel,
  undo = true,
  pauseUndoOnHover = true,
  pauseUndoOnFocus = true,
  announcement,
}: ConfirmationOptions & { announcement?: string }) {
  const [state, setState] = React.useState<UndoableState>("idle")
  const [collapsed, setCollapsed] = React.useState<Collapsed | null>(null)
  const [fill, setFill] = React.useState<Fill | null>(null)
  const [paused, setPaused] = React.useState(false)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const undoRef = React.useRef<HTMLButtonElement>(null)
  const fillRef = React.useRef<HTMLSpanElement>(null)
  const windowRef = React.useRef<UndoWindow | null>(null)
  const busyRef = React.useRef(false)
  const hoverPausableRef = React.useRef(true)
  const focusingRef = React.useRef(false)
  const focusUndoRef = React.useRef(false)
  const restoreFocusRef = React.useRef(false)
  const triggerPathRef = React.useRef<number[] | null>(null)
  const announcedRef = React.useRef("")
  const optionsRef = React.useRef({
    onConfirm,
    onCancel,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
  })

  useFill(fillRef, fill, paused)

  React.useEffect(() => {
    optionsRef.current = {
      onConfirm,
      onCancel,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
    }
  })

  const clearAnnouncement = React.useCallback(() => {
    const region = document.querySelector("[data-sureui-announcer]")
    if (announcedRef.current && region?.textContent === announcedRef.current) {
      region.textContent = ""
    }
    announcedRef.current = ""
  }, [])

  React.useEffect(
    () => () => {
      windowRef.current?.cancel()
      windowRef.current = null
      clearAnnouncement()
    },
    [clearAnnouncement]
  )

  const restore = React.useCallback(() => {
    windowRef.current?.cancel()
    windowRef.current = null
    busyRef.current = false
    restoreFocusRef.current = true
    setFill(null)
    setPaused(false)
    setCollapsed(null)
    setState("idle")
  }, [])

  const commit = React.useCallback(
    (run: ConfirmationOptions["onConfirm"]) => {
      windowRef.current = null
      setFill(null)
      setPaused(false)
      let result: ReturnType<ConfirmationOptions["onConfirm"]>
      try {
        result = run()
      } catch (error) {
        restore()
        throw error
      }
      if (!isPromise(result)) {
        setState("removed")
        return
      }
      setState("pending")
      ;(async () => {
        try {
          await result
          setState("removed")
        } catch (error) {
          restore()
          throw error
        }
      })()
    },
    [restore]
  )

  const remove = React.useCallback(() => {
    const host = hostRef.current
    if (!host || busyRef.current) return
    busyRef.current = true
    const { onConfirm: run, undo: duration } = optionsRef.current
    const active = document.activeElement
    const hadFocus = active instanceof Element && host.contains(active)
    triggerPathRef.current = hadFocus ? pathTo(host, active) : null
    focusUndoRef.current = hadFocus
    hoverPausableRef.current = !host.matches(":hover")
    setCollapsed(measure(host))
    if (!duration) {
      commit(run)
      return
    }
    const undoWindow = startUndoWindow({
      duration,
      onExpire: () => commit(run),
      onPauseChange: setPaused,
    })
    windowRef.current = undoWindow
    setFill({
      from: 1,
      to: 0,
      duration: undoWindow.duration,
      startedAt: performance.now(),
    })
    setPaused(undoWindow.paused())
    setState("undo")
  }, [commit])

  const cancel = React.useCallback(() => {
    if (!windowRef.current) return
    restore()
    optionsRef.current.onCancel?.()
  }, [restore])

  React.useLayoutEffect(() => {
    if (state === "undo") {
      if (focusUndoRef.current) {
        focusUndoRef.current = false
        focusingRef.current = true
        undoRef.current?.focus()
        focusingRef.current = false
      }
      const text = (labelRef.current?.textContent ?? "")
        .trim()
        .replace(/[.!?]$/, "")
      const message = announcement ?? `${text || "Deleted"}. Undo is available.`
      announcedRef.current = message
      announcer().textContent = message
      return
    }
    if (state !== "idle") return
    clearAnnouncement()
    if (!restoreFocusRef.current) return
    restoreFocusRef.current = false
    const host = hostRef.current
    const active = document.activeElement
    if (!host || (active && active !== document.body && active.isConnected)) {
      return
    }
    const target =
      follow(host, triggerPathRef.current) ??
      host.querySelector<HTMLElement>(focusable)
    target?.focus()
  }, [state, announcement, clearAnnouncement])

  function getHostProps<P extends HostProps>(props: P) {
    return {
      ...props,
      style:
        collapsed && collapsed.height > 0
          ? {
              ...props.style,
              [collapsed.columns === null ? "minHeight" : "height"]:
                collapsed.height,
            }
          : props.style,
      onPointerEnter: composeHandlers(props.onPointerEnter, () => {
        if (optionsRef.current.pauseUndoOnHover && hoverPausableRef.current) {
          windowRef.current?.pause("hover")
        }
      }),
      onPointerLeave: composeHandlers(props.onPointerLeave, () => {
        hoverPausableRef.current = true
        windowRef.current?.resume("hover")
      }),
      onFocus: composeHandlers(props.onFocus, () => {
        if (optionsRef.current.pauseUndoOnFocus && !focusingRef.current) {
          windowRef.current?.pause("focus")
        }
      }),
      onBlur: composeHandlers(
        props.onBlur,
        (event: React.FocusEvent<HTMLDivElement>) => {
          const next = event.relatedTarget
          if (next instanceof Node && event.currentTarget.contains(next)) {
            return
          }
          windowRef.current?.resume("focus")
        }
      ),
    }
  }

  return {
    state,
    columns: collapsed?.columns ?? null,
    remove,
    cancel,
    getHostProps,
    hostRef,
    labelRef,
    undoRef,
    fillRef,
  }
}

function Undoable({
  onConfirm,
  onCancel,
  undo,
  pauseUndoOnHover,
  pauseUndoOnFocus,
  label = "Deleted",
  undoLabel = "Undo",
  announcements,
  render,
  ref,
  children,
  ...props
}: UndoableProps) {
  const {
    state,
    columns,
    remove,
    cancel,
    getHostProps,
    hostRef,
    labelRef,
    undoRef,
    fillRef,
  } = useUndoable({
    onConfirm,
    onCancel,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    announcement: announcements?.undo,
  })
  const labelId = React.useId()

  const strip = (
    <span className="flex w-full min-w-0 items-center gap-2">
      <span
        ref={labelRef}
        id={labelId}
        className="min-w-0 truncate text-muted-foreground"
      >
        {label}
      </span>
      {(state === "undo" || state === "pending") && (
        <Button
          ref={undoRef}
          variant="outline"
          size="sm"
          aria-describedby={labelId}
          disabled={state === "pending"}
          focusableWhenDisabled
          onClick={cancel}
          className="relative ml-auto overflow-hidden"
        >
          <span
            ref={fillRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
          />
          {undoLabel}
        </Button>
      )}
    </span>
  )

  let content: React.ReactNode
  if (state === "idle") {
    content =
      typeof children === "function" ? children({ remove, state }) : children
  } else if (columns !== null) {
    content = (
      <td
        data-slot="undoable-strip"
        colSpan={columns}
        className="p-2 align-middle"
      >
        {strip}
      </td>
    )
  } else {
    content = (
      <span data-slot="undoable-strip" className="col-span-full flex w-full">
        {strip}
      </span>
    )
  }

  return useRender({
    defaultTagName: "div",
    render,
    ref: ref ? [ref, hostRef] : hostRef,
    state: { state },
    props: {
      ...getHostProps(props),
      "data-slot": "undoable",
      children: content,
    },
  })
}

export { Undoable, type UndoableProps, type UndoableState }
