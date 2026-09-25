import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { HoldButton } from "@/components/ui/hold-button"

let animation: { cancel: () => void; onfinish: (() => void) | null }

beforeEach(() => {
  animation = { cancel: vi.fn(), onfinish: null }
  Element.prototype.animate = vi.fn(() => animation as unknown as Animation)
  window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList)
})

afterEach(cleanup)

function finish() {
  act(() => animation.onfinish?.())
}

describe("HoldButton", () => {
  it("confirms when the hold completes", () => {
    const onConfirm = vi.fn()
    render(<HoldButton onConfirm={onConfirm}>Hold to delete</HoldButton>)
    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 })
    finish()
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("animates scale to match the scale-x-0 class", () => {
    render(<HoldButton onConfirm={() => {}}>Hold to delete</HoldButton>)
    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 })
    expect(Element.prototype.animate).toHaveBeenCalledWith(
      [{ scale: "0 1" }, { scale: "1 1" }],
      expect.anything()
    )
  })

  it("cancels when released early", () => {
    const onConfirm = vi.fn()
    render(<HoldButton onConfirm={onConfirm}>Hold to delete</HoldButton>)
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    fireEvent.pointerUp(button)
    expect(animation.cancel).toHaveBeenCalled()
  })

  it("works with the keyboard", () => {
    const onConfirm = vi.fn()
    render(<HoldButton onConfirm={onConfirm}>Hold to delete</HoldButton>)
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: " " })
    finish()
    fireEvent.keyUp(button, { key: " " })
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("describes how to use it", () => {
    render(<HoldButton onConfirm={() => {}}>Hold to delete</HoldButton>)
    const id = screen.getByRole("button").getAttribute("aria-describedby")
    expect(document.getElementById(id!)?.textContent).toBe(
      "Press and hold to confirm"
    )
  })
})
