import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ConfirmMenuItem,
  type ConfirmMenuItemProps,
} from "@/components/ui/sureui/confirm-menu-item"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

function renderMenu(props: Partial<ConfirmMenuItemProps> = {}) {
  const onOpenChange = vi.fn()
  const onConfirm = props.onConfirm ?? vi.fn()
  render(
    <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>More</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <ConfirmMenuItem {...props} onConfirm={onConfirm}>
          Delete
        </ConfirmMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  const item = screen.getByRole("menuitem", { name: "Delete" })
  return { item, onConfirm, onOpenChange }
}

async function click(element: HTMLElement) {
  await act(async () => fireEvent.click(element))
}

async function flush() {
  await act(async () => {})
}

function closed(onOpenChange: ReturnType<typeof vi.fn>) {
  return onOpenChange.mock.calls.some(([open]) => open === false)
}

describe("ConfirmMenuItem", () => {
  it("click-again: arming keeps the menu open, confirming closes it", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu()
    await click(item)
    expect(item.getAttribute("data-state")).toBe("armed")
    expect(screen.getByRole("menu")).toBeTruthy()
    expect(closed(onOpenChange)).toBe(false)
    expect(item).toBe(
      screen.getByRole("menuitem", { name: "Click again to confirm" })
    )
    await click(item)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })

  it("click-again: disarms after the timeout and keeps the menu open", async () => {
    const onCancel = vi.fn()
    const { item, onConfirm, onOpenChange } = renderMenu({
      onCancel,
      timeout: 2000,
    })
    await click(item)
    await act(async () => vi.advanceTimersByTime(2000))
    expect(item.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(closed(onOpenChange)).toBe(false)
  })

  it("click-again: moving to another item disarms it", async () => {
    const onCancel = vi.fn()
    const { item } = renderMenu({ onCancel })
    act(() => item.focus())
    await click(item)
    act(() => screen.getByRole("menuitem", { name: "Rename" }).focus())
    expect(item.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("keyboard: Enter arms, Enter again confirms and closes", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu()
    act(() => item.focus())
    await act(async () => fireEvent.keyDown(item, { key: "Enter" }))
    expect(item.getAttribute("data-state")).toBe("armed")
    await act(async () =>
      fireEvent.keyDown(item, { key: "Enter", repeat: true })
    )
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => fireEvent.keyUp(item, { key: "Enter" }))
    await act(async () => fireEvent.keyDown(item, { key: "Enter" }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })

  it("announces the armed state", async () => {
    const { item } = renderMenu({
      announcements: { armed: "Press again to delete" },
    })
    await click(item)
    expect(item.querySelector("[aria-live]")?.textContent).toBe(
      "Press again to delete"
    )
  })

  it("hold: keeps the menu open while holding, confirms on release and closes", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu({ gesture: "hold" })
    expect(item.getAttribute("aria-describedby")).toBeTruthy()
    fireEvent.pointerDown(item, { button: 0 })
    expect(item.getAttribute("data-state")).toBe("holding")
    await act(async () => vi.advanceTimersByTime(1200))
    expect(item.getAttribute("data-state")).toBe("ready")
    expect(closed(onOpenChange)).toBe(false)
    await act(async () => fireEvent.pointerUp(item))
    await click(item)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })

  it("hold: releasing early cancels and keeps the menu open", async () => {
    const onCancel = vi.fn()
    const { item, onConfirm, onOpenChange } = renderMenu({
      gesture: "hold",
      onCancel,
    })
    fireEvent.pointerDown(item, { button: 0 })
    await act(async () => vi.advanceTimersByTime(600))
    await act(async () => fireEvent.pointerUp(item))
    await click(item)
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(closed(onOpenChange)).toBe(false)
  })

  it("hold: holding Enter confirms on release", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu({ gesture: "hold" })
    act(() => item.focus())
    await act(async () => fireEvent.keyDown(item, { key: "Enter" }))
    expect(item.getAttribute("data-state")).toBe("holding")
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.keyUp(item, { key: "Enter" }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })

  it("undo: keeps the menu open during the window, and Undo cancels and closes", async () => {
    const onCancel = vi.fn()
    const { item, onConfirm, onOpenChange } = renderMenu({
      gesture: "click",
      undo: true,
      onCancel,
    })
    await click(item)
    expect(item.getAttribute("data-state")).toBe("undo")
    expect(screen.getByRole("menuitem", { name: "Undo" })).toBe(item)
    expect(closed(onOpenChange)).toBe(false)
    await click(item)
    expect(onCancel).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: commits and closes when the window ends", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu({
      gesture: "click",
      undo: true,
    })
    await click(item)
    await act(async () => vi.advanceTimersByTime(5000))
    await flush()
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })

  it("undo: closing the menu during the window commits", async () => {
    const { item, onConfirm } = renderMenu({ gesture: "click", undo: true })
    await click(item)
    await act(async () => fireEvent.keyDown(item, { key: "Escape" }))
    await act(async () => vi.advanceTimersByTime(1000))
    expect(screen.queryByRole("menu")).toBeNull()
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: commitUndoOnClose={false} drops the action when the menu closes", async () => {
    const onCancel = vi.fn()
    const { item, onConfirm } = renderMenu({
      gesture: "click",
      undo: true,
      commitUndoOnClose: false,
      onCancel,
    })
    await click(item)
    await act(async () => fireEvent.keyDown(item, { key: "Escape" }))
    await act(async () => vi.advanceTimersByTime(10000))
    expect(screen.queryByRole("menu")).toBeNull()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("pending: stays open and disabled until the promise settles, then closes", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((done) => (resolve = done)))
    const { item, onOpenChange } = renderMenu({ gesture: "click", onConfirm })
    await click(item)
    expect(item.getAttribute("data-state")).toBe("pending")
    expect(item.getAttribute("aria-disabled")).toBe("true")
    expect(closed(onOpenChange)).toBe(false)
    await act(async () => resolve())
    await flush()
    expect(item.getAttribute("data-state")).toBe("idle")
    expect(closed(onOpenChange)).toBe(true)
  })

  it("closeOnConfirm={false} keeps the menu open after confirming", async () => {
    const { item, onConfirm, onOpenChange } = renderMenu({
      closeOnConfirm: false,
    })
    await click(item)
    await click(item)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(false)
  })

  it("closeOnUndo={false} keeps the menu open after Undo", async () => {
    const { item, onOpenChange } = renderMenu({
      gesture: "click",
      undo: true,
      closeOnUndo: false,
    })
    await click(item)
    await click(item)
    expect(item.getAttribute("data-state")).toBe("idle")
    expect(closed(onOpenChange)).toBe(false)
  })

  it("runs consumer handlers, but not for its own closing click", async () => {
    const onClick = vi.fn()
    const onKeyDown = vi.fn()
    const { item } = renderMenu({
      onClick,
      onKeyDown,
      variant: "destructive",
    })
    expect(item.getAttribute("data-variant")).toBe("destructive")
    await click(item)
    await act(async () => fireEvent.keyDown(item, { key: "ArrowDown" }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onKeyDown).toHaveBeenCalledOnce()
    expect(item.getAttribute("data-state")).toBe("armed")
    await click(item)
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("works in a context menu", async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenuTrigger>Row</ContextMenuTrigger>
        <ContextMenuContent>
          <ConfirmMenuItem menu="context" onConfirm={onConfirm}>
            Delete
          </ConfirmMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
    await act(async () => fireEvent.contextMenu(screen.getByText("Row")))
    const item = screen.getByRole("menuitem", { name: "Delete" })
    expect(item.getAttribute("data-slot")).toBe("context-menu-item")
    await click(item)
    expect(item.getAttribute("data-state")).toBe("armed")
    expect(closed(onOpenChange)).toBe(false)
    await click(item)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(closed(onOpenChange)).toBe(true)
  })
})
