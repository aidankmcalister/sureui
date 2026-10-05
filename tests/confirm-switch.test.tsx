import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { click } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

function checked() {
  return screen.getByRole("switch").getAttribute("aria-checked")
}

describe("ConfirmSwitch", () => {
  it("moves right away and confirms after the undo window", async () => {
    const onConfirm = vi.fn()
    const onCheckedChange = vi.fn()
    render(
      <ConfirmSwitch
        aria-label="Public"
        onConfirm={onConfirm}
        onCheckedChange={onCheckedChange}
      />
    )
    await click(screen.getByRole("switch"))
    expect(checked()).toBe("true")
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("undo")
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledWith(true)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(checked()).toBe("true")
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("idle")
  })

  it("flipping it again during the window undoes it", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmSwitch
        aria-label="Two-factor"
        defaultChecked
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    const toggle = screen.getByRole("switch")
    await click(toggle)
    expect(checked()).toBe("false")
    expect(screen.getByText("Turned off. Activate again to undo.")).toBeTruthy()
    await click(toggle)
    expect(checked()).toBe("true")
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("confirmWhen skips the window in the other direction", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmSwitch
        aria-label="Two-factor"
        confirmWhen="off"
        onConfirm={onConfirm}
      />
    )
    await click(screen.getByRole("switch"))
    expect(onConfirm).toHaveBeenCalledWith(true)
    expect(checked()).toBe("true")
    await click(screen.getByRole("switch"))
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("undo")
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("stays pending until an async onConfirm settles", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((done) => (resolve = done)))
    render(
      <ConfirmSwitch aria-label="Public" undo={false} onConfirm={onConfirm} />
    )
    await click(screen.getByRole("switch"))
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe(
      "pending"
    )
    expect(checked()).toBe("true")
    await act(async () => resolve())
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("idle")
    expect(checked()).toBe("true")
  })

  it("puts the switch back when onConfirm fails", async () => {
    const onConfirmError = vi.fn()
    render(
      <ConfirmSwitch
        aria-label="Public"
        undo={false}
        onConfirm={() => Promise.reject(new Error("offline"))}
        onConfirmError={onConfirmError}
      />
    )
    await click(screen.getByRole("switch"))
    await act(async () => {})
    expect(onConfirmError).toHaveBeenCalledOnce()
    expect(checked()).toBe("false")
    expect(screen.getByText("Failed. The switch was put back.")).toBeTruthy()
  })

  it("follows a controlled checked value", async () => {
    function Controlled() {
      const [on, setOn] = React.useState(false)
      return (
        <>
          <span>{on ? "on" : "off"}</span>
          <ConfirmSwitch
            aria-label="Public"
            checked={on}
            onCheckedChange={setOn}
            onConfirm={() => {}}
          />
        </>
      )
    }
    render(<Controlled />)
    await click(screen.getByRole("switch"))
    expect(screen.getByText("off")).toBeTruthy()
    await act(async () => vi.advanceTimersByTime(5000))
    expect(screen.getByText("on")).toBeTruthy()
    expect(checked()).toBe("true")
  })

  it("shows no time left unless undoLabel is set", async () => {
    render(<ConfirmSwitch aria-label="Public" onConfirm={() => {}} />)
    await click(screen.getByRole("switch"))
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("undo")
    expect(screen.getByRole("switch").textContent).toBe("")
  })

  it("counts down the undo window beside the switch", async () => {
    render(<ConfirmSwitch aria-label="Public" undoLabel onConfirm={() => {}} />)
    const control = screen.getByRole("switch")
    expect(control.textContent).toBe("")
    await click(control)
    expect(control.textContent).toBe("Saves in 5s")
    await act(async () => vi.advanceTimersByTime(999))
    expect(control.textContent).toBe("Saves in 5s")
    await act(async () => vi.advanceTimersByTime(2))
    expect(control.textContent).toBe("Saves in 4s")
    await act(async () => vi.advanceTimersByTime(4000))
    expect(control.textContent).toBe("")
    expect(control.getAttribute("aria-label")).toBe("Public")
  })

  it("holds the countdown while the window is paused", async () => {
    render(<ConfirmSwitch aria-label="Public" undoLabel onConfirm={() => {}} />)
    const control = screen.getByRole("switch")
    await click(control)
    await act(async () => vi.advanceTimersByTime(1500))
    expect(control.textContent).toBe("Saves in 4s")
    fireEvent.pointerLeave(control)
    fireEvent.pointerEnter(control)
    await act(async () => vi.advanceTimersByTime(3000))
    expect(control.textContent).toBe("Saves in 4s")
    fireEvent.pointerLeave(control)
    await act(async () => vi.advanceTimersByTime(600))
    expect(control.textContent).toBe("Saves in 3s")
  })

  it("takes a custom undoLabel", async () => {
    render(
      <ConfirmSwitch
        aria-label="Public"
        undoLabel={(seconds) => `${seconds}s`}
        undoLabelSide="right"
        onConfirm={() => {}}
      />
    )
    await click(screen.getByRole("switch"))
    const label = screen.getByText("5s")
    expect(label.getAttribute("aria-hidden")).toBe("true")
    expect(label.className).toContain("left-full")
  })

  it("shows no countdown for a manual undo window", async () => {
    render(
      <ConfirmSwitch
        aria-label="Public"
        undo="manual"
        undoLabel
        onConfirm={() => {}}
      />
    )
    await click(screen.getByRole("switch"))
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("undo")
    expect(screen.getByRole("switch").textContent).toBe("")
  })
})
