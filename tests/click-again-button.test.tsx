import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ClickAgainButton } from "@/components/ui/click-again-button"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

async function click(button: HTMLElement) {
  await act(async () => fireEvent.click(button))
}

describe("ClickAgainButton", () => {
  it("confirms on the second click", async () => {
    const onConfirm = vi.fn()
    render(<ClickAgainButton onConfirm={onConfirm}>Archive</ClickAgainButton>)
    const button = screen.getByRole("button")
    await click(button)
    expect(button.textContent).toBe("Click again to confirm")
    vi.advanceTimersByTime(500)
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(button.textContent).toBe("Archive")
  })

  it("ignores an accidental double click", async () => {
    const onConfirm = vi.fn()
    render(<ClickAgainButton onConfirm={onConfirm}>Archive</ClickAgainButton>)
    const button = screen.getByRole("button")
    await click(button)
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("cancels after the timeout", async () => {
    const onConfirm = vi.fn()
    render(
      <ClickAgainButton onConfirm={onConfirm} timeout={3000}>
        Archive
      </ClickAgainButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(3000))
    expect(button.textContent).toBe("Archive")
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("cancels on blur", async () => {
    const onConfirm = vi.fn()
    render(<ClickAgainButton onConfirm={onConfirm}>Archive</ClickAgainButton>)
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => fireEvent.blur(button))
    expect(button.textContent).toBe("Archive")
  })
})
