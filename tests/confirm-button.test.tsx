import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { click, setVisibility } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

afterEach(() => {
  Reflect.deleteProperty(document, "visibilityState")
})

describe("ConfirmButton", () => {
  it("click: confirms on a single click", async () => {
    const onConfirm = vi.fn()
    render(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
    await click(screen.getByRole("button"))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("click-again: arms on the first click and confirms on the second", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="click-again" onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
    expect(button).toBe(
      screen.getByRole("button", { name: "Click again to confirm" })
    )
    vi.advanceTimersByTime(500)
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("click-again: a quick double click confirms", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="click-again" onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("click-again: cancels after the timeout", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="click-again"
        onConfirm={onConfirm}
        onCancel={onCancel}
        timeout={3000}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(3000))
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("click-again: cancels on blur while armed", async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="click-again"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => fireEvent.blur(button))
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("hold: confirms as soon as the fill completes", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm}>
        Hold to delete
      </ConfirmButton>
    )
    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 })
    await act(async () => vi.advanceTimersByTime(1199))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: releasing early cancels and never confirms", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm} onCancel={onCancel}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(600))
    await act(async () => fireEvent.pointerUp(button))
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(1200))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: duration below the minimum still needs 800ms", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" duration={200} onConfirm={onConfirm}>
        Hold
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(200))
    expect(button.getAttribute("data-state")).toBe("holding")
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(600))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: holding Space confirms when the fill completes", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm}>
        Hold
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(1199))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("repeat clicks don't start a text selection", () => {
    render(
      <ConfirmButton gesture="hold" onConfirm={vi.fn()}>
        Hold
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    expect(fireEvent.mouseDown(button, { detail: 1 })).toBe(true)
    expect(fireEvent.mouseDown(button, { detail: 2 })).toBe(false)
    expect(fireEvent.mouseDown(button, { detail: 3 })).toBe(false)
  })

  it("a touch press clears a selection it created, and keeps one made before", async () => {
    render(
      <>
        <p>sk_test_71b3</p>
        <ConfirmButton gesture="hold" onConfirm={vi.fn()}>
          Hold
        </ConfirmButton>
      </>
    )
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "performance",
        "requestAnimationFrame",
      ],
    })
    const button = screen.getByRole("button")
    const text = screen.getByText("sk_test_71b3")
    const select = () => window.getSelection()!.selectAllChildren(text)

    fireEvent.pointerDown(button, { button: 0, pointerType: "touch" })
    select()
    fireEvent.pointerUp(button, { pointerType: "touch" })
    await act(async () => vi.advanceTimersToNextFrame())
    expect(window.getSelection()!.isCollapsed).toBe(true)

    select()
    fireEvent.pointerDown(button, { button: 0, pointerType: "touch" })
    fireEvent.pointerUp(button, { pointerType: "touch" })
    await act(async () => vi.advanceTimersToNextFrame())
    expect(window.getSelection()!.isCollapsed).toBe(false)
  })

  it("hold: aria-describedby resolves to the hold hint", () => {
    render(
      <ConfirmButton gesture="hold" onConfirm={vi.fn()}>
        Hold
      </ConfirmButton>
    )
    const id = screen.getByRole("button").getAttribute("aria-describedby")
    expect(document.getElementById(id!.split(" ")[0])?.textContent).toBe(
      "Press and hold, or activate twice, to confirm"
    )
  })

  it("keeps every label in the layout so the width never changes", async () => {
    render(
      <ConfirmButton
        gesture="click-again"
        undo
        confirmLabel="Are you sure?"
        onConfirm={() => {}}
      >
        Remove
      </ConfirmButton>
    )
    const button = screen.getByRole("button", { name: "Remove" })
    const hidden = () =>
      [...button.querySelectorAll("[aria-hidden=true].invisible")].map(
        (label) => label.textContent
      )
    expect(hidden()).toEqual(["Are you sure?", "Undo"])
    await click(button)
    expect(screen.getByRole("button", { name: "Are you sure?" })).toBe(button)
    expect(hidden()).toEqual(["Remove", "Undo"])
  })

  it("hold: the button does not shift while pressed", () => {
    render(
      <ConfirmButton gesture="hold" onConfirm={() => {}}>
        Hold
      </ConfirmButton>
    )
    expect(screen.getByRole("button").className).not.toContain("translate-y-px")
  })

  it("hold: a consumer onKeyDown and onPointerDown both still run", async () => {
    const onConfirm = vi.fn()
    const consumerKeyDown = vi.fn()
    const consumerPointerDown = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onConfirm={onConfirm}
        onKeyDown={consumerKeyDown}
        onPointerDown={consumerPointerDown}
      >
        Hold
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    expect(consumerPointerDown).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    expect(onConfirm).toHaveBeenCalledOnce()
    fireEvent.keyDown(button, { key: " " })
    expect(consumerKeyDown).toHaveBeenCalledOnce()
  })

  it("hold + undo: a native click after release does not cancel", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onConfirm={onConfirm}
        onCancel={onCancel}
        undo
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    await act(async () => fireEvent.click(button))
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("hold + undo: confirms once after the undo window", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm} undo>
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold + undo: pressing Undo cancels on click, not on pointerDown", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onConfirm={onConfirm}
        onCancel={onCancel}
        undo
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    expect(button.getAttribute("data-state")).toBe("undo")
    await act(async () => fireEvent.pointerDown(button, { button: 0 }))
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onCancel).not.toHaveBeenCalled()
    await act(async () => fireEvent.pointerUp(button))
    await act(async () => fireEvent.click(button))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold + undo: Space cancels on keyUp, not on keyDown", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onConfirm={onConfirm}
        onCancel={onCancel}
        undo
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    expect(button.getAttribute("data-state")).toBe("undo")
    await act(async () => fireEvent.keyDown(button, { key: " " }))
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onCancel).not.toHaveBeenCalled()
    await act(async () => fireEvent.keyUp(button, { key: " " }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: clicking Undo cancels and never confirms", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton onConfirm={onConfirm} onCancel={onCancel} undo>
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(button).toBe(screen.getByRole("button", { name: "Undo" }))
    await click(button)
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: confirms after the window, with a 4000ms minimum", async () => {
    const onConfirmDefault = vi.fn()
    const view = render(
      <ConfirmButton onConfirm={onConfirmDefault} undo>
        Delete
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    await act(async () => vi.advanceTimersByTime(4999))
    expect(onConfirmDefault).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirmDefault).toHaveBeenCalledOnce()
    view.unmount()

    const onConfirmMin = vi.fn()
    render(
      <ConfirmButton onConfirm={onConfirmMin} undo={1000}>
        Delete
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    await act(async () => vi.advanceTimersByTime(3999))
    expect(onConfirmMin).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirmMin).toHaveBeenCalledOnce()
  })

  it("undo: unmounting during the window calls neither handler", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const view = render(
      <ConfirmButton onConfirm={onConfirm} onCancel={onCancel} undo>
        Delete
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    view.unmount()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("undo: commits the onConfirm that was confirmed, not a later one", async () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(
      <ConfirmButton undo onConfirm={first}>
        Go
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    rerender(
      <ConfirmButton undo onConfirm={second}>
        Go
      </ConfirmButton>
    )
    await act(async () => vi.advanceTimersByTime(5000))
    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()
  })

  it("undo: a throwing onConfirm returns to idle and rethrows", async () => {
    render(
      <ConfirmButton
        undo
        onConfirm={() => {
          throw new Error("boom")
        }}
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    let error: unknown
    act(() => {
      try {
        vi.advanceTimersByTime(5000)
      } catch (caught) {
        error = caught
      }
    })
    expect((error as Error).message).toBe("boom")
    expect(screen.getByRole("button", { name: "Delete" })).toBe(button)
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("hold: a throwing onConfirm returns to idle", () => {
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onCancel={onCancel}
        onConfirm={() => {
          throw new Error("boom")
        }}
      >
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    let error: unknown
    act(() => {
      try {
        vi.advanceTimersByTime(1200)
      } catch (caught) {
        error = caught
      }
    })
    expect((error as Error).message).toBe("boom")
    expect(button.getAttribute("data-state")).toBe("idle")
    fireEvent.pointerUp(button)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("undo: hovering again after leaving pauses the window", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(1000))
    fireEvent.pointerLeave(button)
    fireEvent.pointerEnter(button)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(button.getAttribute("data-state")).toBe("undo")
    fireEvent.pointerLeave(button)
    await act(async () => vi.advanceTimersByTime(3999))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: focusing again after blurring pauses the window", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.blur(button)
    fireEvent.focus(button)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.blur(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: staying on the button after clicking does not pause", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerEnter(button)
    fireEvent.focus(button)
    await click(button)
    fireEvent.pointerEnter(button)
    fireEvent.focus(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: pauses while the tab is hidden", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    await act(async () => vi.advanceTimersByTime(1000))
    setVisibility("hidden")
    await act(async () => vi.advanceTimersByTime(20000))
    expect(onConfirm).not.toHaveBeenCalled()
    setVisibility("visible")
    await act(async () => vi.advanceTimersByTime(3999))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: a window that starts while the tab is hidden waits for it", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    setVisibility("hidden")
    await act(async () => vi.advanceTimersByTime(1200))
    expect(button.getAttribute("data-state")).toBe("undo")
    await act(async () => vi.advanceTimersByTime(20000))
    expect(onConfirm).not.toHaveBeenCalled()
    setVisibility("visible")
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: a hidden tab and hover pause independently", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.pointerLeave(button)
    fireEvent.pointerEnter(button)
    setVisibility("hidden")
    fireEvent.pointerLeave(button)
    await act(async () => vi.advanceTimersByTime(20000))
    expect(onConfirm).not.toHaveBeenCalled()
    setVisibility("visible")
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: stays paused while either hover or focus holds it", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.pointerLeave(button)
    fireEvent.blur(button)
    fireEvent.pointerEnter(button)
    fireEvent.focus(button)
    fireEvent.pointerLeave(button)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.blur(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("announcements: every screen reader string can be replaced", async () => {
    const { rerender } = render(
      <ConfirmButton
        gesture="hold"
        announcements={{ hold: "Mantén pulsado para confirmar" }}
        onConfirm={() => {}}
      >
        Borrar
      </ConfirmButton>
    )
    expect(
      screen.getByText("Mantén pulsado para confirmar").className
    ).toContain("sr-only")
    rerender(
      <ConfirmButton
        gesture="click-again"
        confirmLabel={<span aria-hidden>?</span>}
        announcements={{ armed: "Pulsa otra vez", undo: "Hecho" }}
        undo
        onConfirm={() => {}}
      >
        Borrar
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(screen.getByText("Pulsa otra vez")).toBeTruthy()
    await click(button)
    expect(screen.getByText("Hecho")).toBeTruthy()
  })

  it("undo: an aria-label is replaced by undoLabel during the window", async () => {
    render(
      <ConfirmButton undo aria-label="Archive" onConfirm={vi.fn()}>
        icon
      </ConfirmButton>
    )
    await click(screen.getByRole("button", { name: "Archive" }))
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy()
  })

  it("click-again: key-repeat clicks neither arm nor confirm", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="click-again" onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: "Enter" })
    await click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
    await act(async () => vi.advanceTimersByTime(400))
    fireEvent.keyDown(button, { key: "Enter", repeat: true })
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(button.getAttribute("data-state")).toBe("armed")
    fireEvent.keyUp(button, { key: "Enter" })
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("durations: non-finite values fall back to the defaults", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo={Number.POSITIVE_INFINITY} onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    await act(async () => vi.advanceTimersByTime(4999))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("durations: oversized values are capped at a minute", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo={1e12} onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    await act(async () => vi.advanceTimersByTime(59999))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("durations: a non-finite hold duration uses the default", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        duration={Number.POSITIVE_INFINITY}
        onConfirm={onConfirm}
      >
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1199))
    expect(button.getAttribute("data-state")).toBe("holding")
    await act(async () => vi.advanceTimersByTime(1))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("durations: a non-finite timeout uses the default", async () => {
    render(
      <ConfirmButton
        gesture="click-again"
        timeout={Number.NaN}
        onConfirm={vi.fn()}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(2999))
    expect(button.getAttribute("data-state")).toBe("armed")
    await act(async () => vi.advanceTimersByTime(1))
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  function renderHold(
    props: Partial<React.ComponentProps<typeof ConfirmButton>> = {}
  ) {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      >
        Hold to delete
      </ConfirmButton>
    )
    return { button: screen.getByRole("button"), onConfirm, onCancel }
  }

  it("click-again: turns off double-tap zoom so a quick second tap isn't delayed", () => {
    render(
      <ConfirmButton gesture="click-again" onConfirm={vi.fn()}>
        Archive
      </ConfirmButton>
    )
    expect(screen.getByRole("button").className).toContain("touch-manipulation")
  })

  it("hold: Space let go early cancels instead of arming", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(500))
    await act(async () => fireEvent.keyUp(button, { key: " " }))
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold fallback: a click with no press arms, and the next click confirms", async () => {
    const { button, onConfirm } = renderHold()
    await act(async () => fireEvent.click(button))
    expect(button.getAttribute("data-state")).toBe("armed")
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByText("Confirm").getAttribute("aria-hidden")).toBeNull()
    expect(screen.getByText("Hold to delete").getAttribute("aria-hidden")).toBe(
      "true"
    )
    await act(async () => fireEvent.click(button))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold fallback: a virtual press let go early arms without cancelling", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    const virtual = { button: 0, width: 0.3, height: 0.3, pointerType: "touch" }
    fireEvent.pointerDown(button, virtual)
    await act(async () => fireEvent.pointerUp(button, virtual))
    await act(async () => fireEvent.click(button))
    expect(onCancel).not.toHaveBeenCalled()
    expect(button.getAttribute("data-state")).toBe("armed")
    fireEvent.pointerDown(button, virtual)
    fireEvent.pointerUp(button, virtual)
    await act(async () => fireEvent.click(button))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold fallback: a zero-size Android touch let go early cancels instead of arming", async () => {
    const userAgent = vi
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue("Mozilla/5.0 (Linux; Android 14)")
    const { button, onCancel } = renderHold()
    const touch = { button: 0, width: 0, height: 0, pointerType: "touch" }
    fireEvent.pointerDown(button, touch)
    await act(async () => vi.advanceTimersByTime(300))
    await act(async () => fireEvent.pointerUp(button, touch))
    await act(async () => fireEvent.click(button))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
    userAgent.mockRestore()
  })

  it("hold fallback: a mouse let go early still cancels, and its click does not arm", async () => {
    const { button, onCancel } = renderHold()
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(300))
    await act(async () => fireEvent.pointerUp(button))
    await act(async () => fireEvent.click(button))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("hold fallback: Escape and blur clear the armed state", async () => {
    const { button, onCancel } = renderHold()
    await act(async () => fireEvent.click(button))
    await act(async () => fireEvent.keyDown(button, { key: "Escape" }))
    expect(button.getAttribute("data-state")).toBe("idle")
    await act(async () => fireEvent.click(button))
    await act(async () => fireEvent.blur(button))
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it("hold fallback: a click with no press undoes during the undo window", async () => {
    const { button, onConfirm, onCancel } = renderHold({ undo: true })
    await act(async () => fireEvent.click(button))
    await act(async () => fireEvent.click(button))
    expect(button.getAttribute("data-state")).toBe("undo")
    await act(async () => fireEvent.click(button))
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('hold fallback: holdFallback="none" ignores clicks and cancels an early key release', async () => {
    const { button, onConfirm, onCancel } = renderHold({ holdFallback: "none" })
    await act(async () => fireEvent.click(button))
    expect(button.getAttribute("data-state")).toBe("idle")
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(500))
    fireEvent.keyUp(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(2000))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: Enter starts the hold and keyUp confirms it", async () => {
    const { button, onConfirm } = renderHold()
    fireEvent.keyDown(button, { key: "Enter" })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.keyUp(button, { key: "Enter" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: blur while holding cancels", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    fireEvent.pointerDown(button, { button: 0 })
    fireEvent.blur(button)
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(2000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: pointerLeave releases", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    fireEvent.pointerDown(button, { button: 0 })
    fireEvent.pointerLeave(button)
    await act(async () => vi.advanceTimersByTime(2000))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: pointerCancel releases", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    fireEvent.pointerDown(button, { button: 0 })
    fireEvent.pointerCancel(button)
    await act(async () => vi.advanceTimersByTime(2000))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: a non-primary button does not start a hold", () => {
    const { button } = renderHold()
    fireEvent.pointerDown(button, { button: 2 })
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("hold: the context menu is suppressed", () => {
    const { button } = renderHold()
    expect(fireEvent.contextMenu(button)).toBe(false)
  })

  it("hold + undo: key auto-repeat after completing does not cancel", async () => {
    const { button, onCancel } = renderHold({ undo: true })
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.keyUp(button, { key: " " }))
    expect(button.getAttribute("data-state")).toBe("undo")
    fireEvent.keyDown(button, { key: " ", repeat: true })
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("hold: aria-describedby keeps the consumer's id", () => {
    const { button } = renderHold({ "aria-describedby": "extra" })
    expect(button.getAttribute("aria-describedby")).toMatch(/ extra$/)
  })

  it("click-again: a custom timeout disarms", async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="click-again"
        timeout={1000}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(999))
    expect(button.getAttribute("data-state")).toBe("armed")
    await act(async () => vi.advanceTimersByTime(1))
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("click-again + undo: confirming starts undo, clicking again cancels", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="click-again"
        undo
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(400))
    await click(button)
    expect(screen.getByRole("button", { name: "Undo" })).toBe(button)
    await click(button)
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("consumer onClick and onBlur still run", async () => {
    const onClick = vi.fn()
    const onBlur = vi.fn()
    render(
      <ConfirmButton
        gesture="click-again"
        onClick={onClick}
        onBlur={onBlur}
        onConfirm={vi.fn()}
      >
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.blur(button)
    expect(onClick).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("disabled passes through", () => {
    render(
      <ConfirmButton disabled onConfirm={vi.fn()}>
        Archive
      </ConfirmButton>
    )
    expect(screen.getByRole("button")).toHaveProperty("disabled", true)
  })

  it("undo: disabling the button during the window keeps Undo pressable", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { rerender } = render(
      <ConfirmButton undo onConfirm={onConfirm} onCancel={onCancel}>
        Archive
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    rerender(
      <ConfirmButton undo disabled onConfirm={onConfirm} onCancel={onCancel}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button", { name: "Undo" })
    expect(button).toHaveProperty("disabled", false)
    await click(button)
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button).toHaveProperty("disabled", true)
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: pauseUndoOnHover={false} keeps the window running on hover", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo pauseUndoOnHover={false} onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.pointerLeave(button)
    fireEvent.pointerEnter(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: pauseUndoOnFocus={false} keeps the window running on focus", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton undo pauseUndoOnFocus={false} onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    fireEvent.blur(button)
    fireEvent.focus(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("async: pending onConfirm disables the button but keeps focus", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    render(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
    const button = screen.getByRole("button")
    button.focus()
    await click(button)
    expect(button.getAttribute("data-state")).toBe("pending")
    expect(button.getAttribute("aria-disabled")).toBe("true")
    expect(button).toHaveProperty("disabled", false)
    expect(document.activeElement).toBe(button)
    await click(button)
    fireEvent.keyDown(button, { key: "Enter" })
    expect(onConfirm).toHaveBeenCalledOnce()
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(button.getAttribute("aria-disabled")).toBeNull()
    expect(document.activeElement).toBe(button)
  })
})

describe("ConfirmButton failures", () => {
  function liveText() {
    return document.querySelector('[aria-live="polite"]')?.textContent
  }

  it("rethrows without onConfirmError, even with errorLabel", async () => {
    render(
      <ConfirmButton
        undo
        errorLabel="Couldn't delete"
        onConfirm={() => {
          throw new Error("boom")
        }}
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(() => vi.advanceTimersByTime(5000)).toThrow("boom")
    await act(async () => {})
    expect(button).toBe(screen.getByRole("button", { name: "Couldn't delete" }))
    expect(button.hasAttribute("data-error")).toBe(true)
  })

  it("passes a thrown error to onConfirmError and shows errorLabel until the retry", async () => {
    const onConfirmError = vi.fn()
    let fail = true
    const onConfirm = vi.fn(() => {
      if (fail) throw new Error("boom")
    })
    render(
      <ConfirmButton
        errorLabel="Couldn't delete. Try again"
        onConfirm={onConfirm}
        onConfirmError={onConfirmError}
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(onConfirmError).toHaveBeenCalledOnce()
    expect(onConfirmError.mock.calls[0][0]).toHaveProperty("message", "boom")
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(button.hasAttribute("data-error")).toBe(true)
    expect(button).toBe(
      screen.getByRole("button", { name: "Couldn't delete. Try again" })
    )
    expect(liveText()).toBe("Couldn't delete. Try again")
    fail = false
    await click(button)
    expect(onConfirm).toHaveBeenCalledTimes(2)
    expect(onConfirmError).toHaveBeenCalledOnce()
    expect(button.hasAttribute("data-error")).toBe(false)
    expect(button).toBe(screen.getByRole("button", { name: "Delete" }))
    expect(liveText()).toBe("")
  })

  it("handles a rejection without an unhandled rejection", async () => {
    let reject!: (error: Error) => void
    const onConfirmError = vi.fn()
    const onRejection = vi.fn()
    process.on("unhandledRejection", onRejection)
    try {
      render(
        <ConfirmButton
          errorLabel="Failed"
          announcements={{ error: "Deleting failed. Activate to retry." }}
          onConfirmError={onConfirmError}
          onConfirm={() =>
            new Promise<void>((_, rej) => {
              reject = rej
            })
          }
        >
          Delete
        </ConfirmButton>
      )
      const button = screen.getByRole("button")
      await click(button)
      expect(button.getAttribute("data-state")).toBe("pending")
      await act(async () => {
        reject(new Error("offline"))
      })
      vi.useRealTimers()
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(onConfirmError.mock.calls[0][0]).toHaveProperty(
        "message",
        "offline"
      )
      expect(onRejection).not.toHaveBeenCalled()
      expect(button.getAttribute("data-state")).toBe("idle")
      expect(button).toBe(screen.getByRole("button", { name: "Failed" }))
      expect(liveText()).toBe("Deleting failed. Activate to retry.")
    } finally {
      process.off("unhandledRejection", onRejection)
    }
  })

  it("keeps the idle label when errorLabel isn't set", async () => {
    const onConfirmError = vi.fn()
    render(
      <ConfirmButton
        undo
        onConfirmError={onConfirmError}
        onConfirm={() => {
          throw new Error("boom")
        }}
      >
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirmError).toHaveBeenCalledOnce()
    expect(button).toBe(screen.getByRole("button", { name: "Delete" }))
    expect(liveText()).toBe("")
  })
})

describe("ConfirmButton manual undo", () => {
  function renderManual() {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <>
        <ConfirmButton undo="manual" onConfirm={onConfirm} onCancel={onCancel}>
          Archive
        </ConfirmButton>
        <button>Elsewhere</button>
      </>
    )
    const button = screen.getByRole("button", { name: "Archive" })
    return { button, onConfirm, onCancel }
  }

  it("keeps Undo open with no time limit", async () => {
    const { button, onConfirm } = renderManual()
    await click(button)
    expect(button.getAttribute("data-state")).toBe("undo")
    await act(async () => vi.advanceTimersByTime(600000))
    expect(button.getAttribute("data-state")).toBe("undo")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("commits on a press outside the button", async () => {
    const { button, onConfirm } = renderManual()
    await click(button)
    fireEvent.pointerDown(button, { button: 0 })
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () =>
      fireEvent.pointerDown(screen.getByRole("button", { name: "Elsewhere" }))
    )
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("commits when focus moves elsewhere", async () => {
    const { button, onConfirm } = renderManual()
    act(() => button.focus())
    await click(button)
    await act(async () =>
      screen.getByRole("button", { name: "Elsewhere" }).focus()
    )
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo cancels and stops listening", async () => {
    const { button, onConfirm, onCancel } = renderManual()
    await click(button)
    await click(button)
    expect(onCancel).toHaveBeenCalledOnce()
    fireEvent.pointerDown(document.body)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("unmounting discards the action", async () => {
    const onConfirm = vi.fn()
    const { unmount } = render(
      <ConfirmButton undo="manual" onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    await click(screen.getByRole("button"))
    unmount()
    fireEvent.pointerDown(document.body)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe("ConfirmButton armDelay", () => {
  it("ignores clicks for armDelay after mounting", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton armDelay={400} onConfirm={onConfirm}>
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(400))
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("click-again: ignores the second click for armDelay after arming", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="click-again" armDelay={300} onConfirm={onConfirm}>
        Archive
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    await act(async () => vi.advanceTimersByTime(300))
    await click(button)
    await click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(300))
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: ignores a press for armDelay after mounting", async () => {
    render(
      <ConfirmButton gesture="hold" armDelay={300} onConfirm={vi.fn()}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    expect(button.getAttribute("data-state")).toBe("idle")
    await act(async () => vi.advanceTimersByTime(300))
    fireEvent.pointerDown(button, { button: 0 })
    expect(button.getAttribute("data-state")).toBe("holding")
  })
})

describe("ConfirmButton wait", () => {
  it("counts down on the button and ignores clicks until it's done", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton wait={3000} onConfirm={onConfirm}>
        Delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button") as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(screen.getByText("Wait 3s")).toBeTruthy()
    expect(screen.getByText("Available in 3 seconds")).toBeTruthy()
    await click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1000))
    expect(screen.getByText("Wait 2s")).toBeTruthy()
    expect(screen.getByText("Available in 3 seconds")).toBeTruthy()
    await act(async () => vi.advanceTimersByTime(1000))
    await act(async () => vi.advanceTimersByTime(1000))
    expect(button.disabled).toBe(false)
    expect(screen.queryByText("Available in 3 seconds")).toBeNull()
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("takes a custom label and announcement", () => {
    render(
      <ConfirmButton
        wait={2000}
        waitLabel={(seconds) => `Delete in ${seconds}`}
        announcements={{ wait: "Delete unlocks soon" }}
        onConfirm={vi.fn()}
      >
        Delete
      </ConfirmButton>
    )
    expect(screen.getByText("Delete in 2")).toBeTruthy()
    expect(screen.getByText("Delete unlocks soon")).toBeTruthy()
  })
})

describe("ConfirmButton slide", () => {
  function setup(
    props: Partial<React.ComponentProps<typeof ConfirmButton>> = {}
  ) {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton
        gesture="slide"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      >
        Slide to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      width: 200,
    } as DOMRect)
    return { button, onConfirm, onCancel }
  }

  function drag(button: HTMLElement, to: number) {
    fireEvent.pointerDown(button, { button: 0, pointerId: 1, clientX: 0 })
    fireEvent.pointerMove(button, { pointerId: 1, clientX: to })
  }

  it("confirms when dragged to the end and let go", () => {
    const { button, onConfirm } = setup()
    drag(button, 200)
    expect(button.getAttribute("data-state")).toBe("holding")
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 200 })
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("letting go early cancels", () => {
    const { button, onConfirm, onCancel } = setup()
    drag(button, 80)
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 80 })
    fireEvent.click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("cancels when the browser takes the pointer to scroll", () => {
    const { button, onConfirm, onCancel } = setup()
    drag(button, 120)
    fireEvent.pointerCancel(button, { pointerId: 1 })
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("arms on a plain click and confirms on a second, without dragging", () => {
    const { button, onConfirm } = setup()
    fireEvent.pointerDown(button, { button: 0, pointerId: 1, clientX: 10 })
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10 })
    fireEvent.click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.pointerDown(button, { button: 0, pointerId: 1, clientX: 10 })
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10 })
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("confirms with two activations from the keyboard", async () => {
    const { button, onConfirm } = setup()
    await click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
    expect(document.querySelector("[aria-live=polite]")?.textContent).toBe(
      "Click again to confirm"
    )
    await click(button)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("describes the gesture to screen readers", () => {
    const { button } = setup()
    const hint = document.getElementById(
      button.getAttribute("aria-describedby")!
    )
    expect(hint?.textContent).toBe(
      "Slide to the end, or activate twice, to confirm"
    )
  })
})
