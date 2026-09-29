import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BulkConfirm } from "@/components/ui/sureui/bulk-confirm"
import { click } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

const label = (count: number) => `Delete ${count} issues`

describe("BulkConfirm", () => {
  it("a few items: confirms after the undo window", async () => {
    const onConfirm = vi.fn()
    render(<BulkConfirm count={3} label={label} onConfirm={onConfirm} />)
    const button = screen.getByRole("button", { name: "Delete 3 issues" })
    await click(button)
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("dozens: needs a second click", async () => {
    const onConfirm = vi.fn()
    render(<BulkConfirm count={40} label={label} onConfirm={onConfirm} />)
    const button = screen.getByRole("button", { name: "Delete 40 issues" })
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hundreds: asks for the count to be typed", async () => {
    const onConfirm = vi.fn()
    render(<BulkConfirm count={248} label={label} onConfirm={onConfirm} />)
    const confirm = screen.getByRole("button", {
      name: "Delete 248 issues",
    }) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    await act(async () =>
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "248" },
      })
    )
    await click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("takes custom thresholds", async () => {
    const onConfirm = vi.fn()
    render(
      <BulkConfirm
        count={2}
        thresholds={{ undo: 1, clickAgain: 20 }}
        label={label}
        onConfirm={onConfirm}
      />
    )
    const button = screen.getByRole("button", { name: "Delete 2 issues" })
    await click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
  })

  it("is disabled with nothing selected", () => {
    render(<BulkConfirm count={0} label={label} onConfirm={vi.fn()} />)
    expect(
      (
        screen.getByRole("button", {
          name: "Delete 0 issues",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true)
  })

  it("starts over when the count crosses a threshold", async () => {
    const { rerender } = render(
      <BulkConfirm count={40} label={label} onConfirm={vi.fn()} />
    )
    await click(screen.getByRole("button", { name: "Delete 40 issues" }))
    rerender(<BulkConfirm count={5} label={label} onConfirm={vi.fn()} />)
    expect(
      screen
        .getByRole("button", { name: "Delete 5 issues" })
        .getAttribute("data-state")
    ).toBe("idle")
  })
})
