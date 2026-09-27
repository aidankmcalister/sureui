import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Toaster } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { undoToast } from "@/components/ui/sureui/undo-toast"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
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
