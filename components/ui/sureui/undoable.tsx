"use client"

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

import { Button } from "@/components/ui/button"
import {
  isPromise,
  composeHandlers,
  startUndoWindow,
  useFill,
  type ConfirmationOptions,
  type Fill,
  type UndoWindow,
} from "@/components/ui/sureui/confirmation"

type UndoableState = "idle" | "undo" | "pending" | "removed"

interface UndoableRenderProps {
  remove: () => void
  state: UndoableState
}

interface UndoableProps
  extends
    Omit<useRender.ComponentProps<"div", { state: UndoableState }>, "children">,
    ConfirmationOptions {
  children?: React.ReactNode | ((props: UndoableRenderProps) => React.ReactNode)
  label?: React.ReactNode
  undoLabel?: React.ReactNode
  focusAfterRemove?: (row: HTMLElement) => HTMLElement | null
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

function targetIn(row: Element, path: number[] | null) {
  if (
    row.getAttribute("data-slot") === "undoable" &&
    row.getAttribute("data-state") !== "idle"
  ) {
    return null
  }
  return (
    follow(row, path) ??
    (row instanceof HTMLElement && row.matches(focusable)
      ? row
      : row.querySelector<HTMLElement>(focusable))
  )
}

function nextFocus(row: HTMLElement, path: number[] | null) {
  for (
    let next = row.nextElementSibling;
    next;
    next = next.nextElementSibling
  ) {
    const target = targetIn(next, path)
    if (target) return target
  }
  for (
    let previous = row.previousElementSibling;
    previous;
    previous = previous.previousElementSibling
  ) {
    const target = targetIn(previous, path)
    if (target) return target
  }
  const list = row.parentElement
  if (!list || list === document.body) return null
  if (!list.matches(focusable) && !list.hasAttribute("tabindex")) {
    list.tabIndex = -1
  }
  return list
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
  onConfirmError,
  undo = true,
  pauseUndoOnHover = true,
  pauseUndoOnFocus = true,
  focusAfterRemove,
  announcement,
}: ConfirmationOptions &
  Pick<UndoableProps, "focusAfterRemove"> & { announcement?: string }) {
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
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    focusAfterRemove,
  })

  useFill(fillRef, fill, paused)

  React.useEffect(() => {
    optionsRef.current = {
      onConfirm,
      onCancel,
      onConfirmError,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
      focusAfterRemove,
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

  const fail = React.useCallback(
    (error: unknown) => {
      restore()
      const { onConfirmError } = optionsRef.current
      if (!onConfirmError) throw error
      onConfirmError(error)
    },
    [restore]
  )

  const removed = React.useCallback(() => {
    const host = hostRef.current
    const active = document.activeElement
    if (host && active instanceof Element && host.contains(active)) {
      const { focusAfterRemove } = optionsRef.current
      const target = focusAfterRemove
        ? focusAfterRemove(host)
        : nextFocus(host, triggerPathRef.current)
      target?.focus()
    }
    setState("removed")
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
        return fail(error)
      }
      if (!isPromise(result)) return removed()
      setState("pending")
      ;(async () => {
        try {
          await result
        } catch (error) {
          return fail(error)
        }
        removed()
      })()
    },
    [fail, removed]
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
      within: () => hostRef.current,
    })
    windowRef.current = undoWindow
    setFill(
      undoWindow.manual
        ? null
        : {
            from: 1,
            to: 0,
            duration: undoWindow.duration,
            startedAt: performance.now(),
          }
    )
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

function Undoable(props: UndoableProps) {
  const {
    onConfirm,
    onCancel,
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    label = "Deleted",
    undoLabel = "Undo",
    focusAfterRemove,
    announcements,
    render,
    ref,
    children,
    ...rest
  } = props
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
    onConfirmError,
    undo,
    pauseUndoOnHover,
    pauseUndoOnFocus,
    focusAfterRemove,
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
          className="relative ml-auto overflow-hidden motion-safe:aria-disabled:animate-pulse motion-reduce:aria-disabled:opacity-50"
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
      ...getHostProps(rest),
      "data-slot": "undoable",
      children: content,
    },
  })
}

export { Undoable, type UndoableProps, type UndoableState }
