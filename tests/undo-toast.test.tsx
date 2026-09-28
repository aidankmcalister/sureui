import { act, fireEvent, render, screen } from "@testing-library/react"
import { toast, Toaster } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { undoToast } from "@/components/ui/sureui/undo-toast"
import { setVisibility } from "./helpers"

afterEach(() => {
  toast.dismiss()
  vi.restoreAllMocks()
  Reflect.deleteProperty(document, "visibilityState")
})

describe("undoToast", () => {
  it("resolves false when undo is clicked", async () => {
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted 3 files")
    })
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }))
    await expect(result).resolves.toBe(false)
  })

  it("resolves true when dismissed", async () => {
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted")
    })
    await screen.findByText("Deleted")
    act(() => {
      toast.dismiss()
    })
    await expect(result).resolves.toBe(true)
  })

  it("uses a custom undoLabel", async () => {
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted", { undoLabel: "Restore" })
    })
    fireEvent.click(await screen.findByRole("button", { name: "Restore" }))
    await expect(result).resolves.toBe(false)
  })

  it("resolves true and warns when no Toaster is mounted", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    let settled: boolean | undefined
    undoToast("Deleted 3 files").then((value) => (settled = value))
    await act(async () => vi.advanceTimersByTime(4999))
    expect(settled).toBeUndefined()
    await act(async () => vi.advanceTimersByTime(1))
    expect(settled).toBe(true)
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe("undoToast pausing", () => {
  function track(promise: Promise<boolean>) {
    const state: { value?: boolean } = {}
    promise.then((value) => (state.value = value))
    return state
  }

  async function advance(ms: number) {
    await act(async () => vi.advanceTimersByTime(ms))
  }

  async function show(options?: Parameters<typeof undoToast>[1]) {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted", options)
    })
    await advance(0)
    return {
      state: track(result),
      undo: screen.getByRole("button", { name: "Undo" }),
    }
  }

  it("pauses while focus is inside the toast", async () => {
    const { state, undo } = await show()
    await advance(1000)
    act(() => undo.focus())
    await advance(20000)
    expect(state.value).toBeUndefined()
    act(() => undo.blur())
    await advance(3999)
    expect(state.value).toBeUndefined()
    await advance(1)
    expect(state.value).toBe(true)
  })

  it("stays paused while focus moves within the toaster", async () => {
    const { state, undo } = await show()
    act(() => undo.focus())
    const toaster = undo.closest<HTMLElement>("[data-sonner-toaster]")!
    act(() => toaster.focus())
    await advance(20000)
    expect(state.value).toBeUndefined()
    act(() => toaster.blur())
    await advance(5000)
    expect(state.value).toBe(true)
  })

  it("pauses when the Sonner hotkey focuses the toaster", async () => {
    const { state } = await show()
    act(() => {
      fireEvent.keyDown(document, { altKey: true, code: "KeyT" })
    })
    await advance(20000)
    expect(state.value).toBeUndefined()
  })

  it("keeps running on focus when pauseOnFocus is false", async () => {
    const { state, undo } = await show({ pauseOnFocus: false })
    act(() => undo.focus())
    await advance(4999)
    expect(state.value).toBeUndefined()
    await advance(1)
    expect(state.value).toBe(true)
  })

  it("pauses while the toaster is hovered", async () => {
    const { state, undo } = await show()
    const toaster = undo.closest("[data-sonner-toaster]")!
    await advance(2000)
    fireEvent.pointerEnter(toaster)
    await advance(20000)
    expect(state.value).toBeUndefined()
    fireEvent.pointerLeave(toaster)
    await advance(2999)
    expect(state.value).toBeUndefined()
    await advance(1)
    expect(state.value).toBe(true)
  })

  it("keeps running on hover when pauseOnHover is false", async () => {
    const { state, undo } = await show({ pauseOnHover: false })
    fireEvent.pointerEnter(undo.closest("[data-sonner-toaster]")!)
    await advance(4999)
    expect(state.value).toBeUndefined()
    await advance(1)
    expect(state.value).toBe(true)
  })

  it("pauses while the tab is hidden", async () => {
    const { state } = await show()
    await advance(1000)
    setVisibility("hidden")
    await advance(20000)
    expect(state.value).toBeUndefined()
    setVisibility("visible")
    await advance(3999)
    expect(state.value).toBeUndefined()
    await advance(1)
    expect(state.value).toBe(true)
  })

  it("stays paused while hidden even after the pointer leaves", async () => {
    const { state, undo } = await show()
    const toaster = undo.closest("[data-sonner-toaster]")!
    fireEvent.pointerEnter(toaster)
    setVisibility("hidden")
    fireEvent.pointerLeave(toaster)
    await advance(20000)
    expect(state.value).toBeUndefined()
    setVisibility("visible")
    await advance(5000)
    expect(state.value).toBe(true)
  })

  it("resolves false when undo is pressed from the keyboard", async () => {
    const { state, undo } = await show()
    act(() => undo.focus())
    await advance(20000)
    fireEvent.click(undo)
    await advance(0)
    expect(state.value).toBe(false)
  })
})

describe("undoToast manual duration", () => {
  it("stays until dismissed and shows a close button", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted", { duration: "manual" })
    })
    const state: { value?: boolean } = {}
    result.then((value) => (state.value = value))
    await act(async () => vi.advanceTimersByTime(600000))
    expect(state.value).toBeUndefined()
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Close toast" }))
    await act(async () => vi.advanceTimersByTime(1000))
    expect(state.value).toBe(true)
  })

  it("resolves false on Undo", async () => {
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted", { duration: "manual" })
    })
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }))
    await expect(result).resolves.toBe(false)
  })
})
