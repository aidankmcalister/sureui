import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

async function click(button: HTMLElement) {
  await act(async () => fireEvent.click(button))
}

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

  it("hold: fills, then confirms when released", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    expect(button.getAttribute("data-state")).toBe("holding")
    await act(async () => vi.advanceTimersByTime(1200))
    expect(button.getAttribute("data-state")).toBe("ready")
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => fireEvent.pointerUp(button))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: confirmOnRelease={false} confirms when the fill completes", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        confirmOnRelease={false}
        onConfirm={onConfirm}
      >
        Hold to delete
      </ConfirmButton>
    )
    fireEvent.pointerDown(screen.getByRole("button"), { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: releasing outside the button after the fill cancels", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm} onCancel={onCancel}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () =>
      fireEvent.pointerUp(button, { clientX: 500, clientY: 500 })
    )
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(button.getAttribute("data-state")).toBe("idle")
  })

  it("hold: leaving the button after the fill cancels", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm} onCancel={onCancel}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerLeave(button))
    await act(async () => fireEvent.pointerUp(button))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: cancelHoldOnLeave={false} lets the pointer leave and come back", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton
        gesture="hold"
        cancelHoldOnLeave={false}
        onConfirm={onConfirm}
      >
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    fireEvent.pointerLeave(button)
    await act(async () => vi.advanceTimersByTime(1200))
    expect(button.getAttribute("data-state")).toBe("ready")
    await act(async () => fireEvent.pointerUp(button))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: pointerCancel after the fill cancels", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm} onCancel={onCancel}>
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerCancel(button))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: releaseLabel and the ready announcement show once filled", async () => {
    render(
      <ConfirmButton
        gesture="hold"
        releaseLabel="Let go to delete"
        announcements={{ ready: "Let go now" }}
        onConfirm={vi.fn()}
      >
        Hold to delete
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    expect(screen.getByRole("button", { name: "Let go to delete" })).toBe(
      button
    )
    expect(screen.getByText("Let go now")).toBeTruthy()
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
    await act(async () => vi.advanceTimersByTime(600))
    expect(button.getAttribute("data-state")).toBe("ready")
    await act(async () => fireEvent.pointerUp(button))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: Space key starts the hold and keyUp confirms it", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton gesture="hold" onConfirm={onConfirm}>
        Hold
      </ConfirmButton>
    )
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(1200))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => fireEvent.keyUp(button, { key: " " }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("hold: aria-describedby resolves to the hold hint", () => {
    render(
      <ConfirmButton gesture="hold" onConfirm={vi.fn()}>
        Hold
      </ConfirmButton>
    )
    const id = screen.getByRole("button").getAttribute("aria-describedby")
    expect(document.getElementById(id!.split(" ")[0])?.textContent).toBe(
      "Press and hold to confirm"
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
        confirmOnRelease={false}
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
    expect(button.getAttribute("data-state")).toBe("ready")
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

  it("hold: Space keyUp before the duration cancels", async () => {
    const { button, onConfirm, onCancel } = renderHold()
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

  it("hold: blur after the fill cancels", async () => {
    const { button, onConfirm, onCancel } = renderHold()
    fireEvent.keyDown(button, { key: " " })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.blur(button))
    await act(async () => fireEvent.keyUp(button, { key: " " }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
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

  it("async: pending onConfirm disables the button until it resolves", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    render(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
    const button = screen.getByRole("button")
    await click(button)
    expect(button.getAttribute("data-state")).toBe("pending")
    expect(button).toHaveProperty("disabled", true)
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    expect(button.getAttribute("data-state")).toBe("idle")
    expect(button).toHaveProperty("disabled", false)
  })
})
