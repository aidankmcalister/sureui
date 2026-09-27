import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function type(value: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value } })
}

describe("TypeToConfirm", () => {
  it("confirms only when the phrase matches", () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" onConfirm={onConfirm} />)
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acm")
    expect(confirm).toHaveProperty("disabled", true)
    type("acme")
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("requires every acknowledgement", () => {
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        acknowledgements={["I understand"]}
        onConfirm={onConfirm}
      />
    )
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acme")
    expect(confirm).toHaveProperty("disabled", true)
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("confirms with Enter", () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" onConfirm={onConfirm} />)
    type("acme")
    fireEvent.submit(screen.getByRole("textbox"))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("regression: does not confirm again on a second submit", () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" onConfirm={onConfirm} />)
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acme")
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.getByRole("textbox")).toHaveProperty("value", "")
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: clicking Undo cancels and never confirms", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        onConfirm={onConfirm}
        onCancel={onCancel}
        undo
      />
    )
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acme")
    fireEvent.click(confirm)
    const undoButton = screen.getByRole("button", { name: "Undo" })
    fireEvent.click(undoButton)
    expect(onCancel).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: re-submitting during the window does not commit twice or survive Undo", async () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" undo onConfirm={onConfirm} />)
    const form = screen.getByRole("textbox").closest("form")!
    type("acme")
    await act(async () => fireEvent.submit(form))
    type("acme")
    await act(async () => fireEvent.submit(form))
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("undo: commits once after the window", async () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" undo onConfirm={onConfirm} />)
    type("acme")
    await act(async () =>
      fireEvent.submit(screen.getByRole("textbox").closest("form")!)
    )
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo: hovering the Undo button after leaving pauses the window", async () => {
    const onConfirm = vi.fn()
    render(<TypeToConfirm phrase="acme" undo onConfirm={onConfirm} />)
    type("acme")
    await act(async () =>
      fireEvent.submit(screen.getByRole("textbox").closest("form")!)
    )
    const undoButton = screen.getByRole("button", { name: "Undo" })
    fireEvent.pointerLeave(undoButton)
    fireEvent.pointerEnter(undoButton)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.pointerLeave(undoButton)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("label and announcements can be replaced", () => {
    render(
      <TypeToConfirm
        phrase="acme"
        label="Escribe acme para confirmar"
        announcements={{ match: "Coincide" }}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByLabelText("Escribe acme para confirmar")).toBeTruthy()
    type("acme")
    expect(screen.getByText("Coincide")).toBeTruthy()
  })

  it("undo: announces that undo is available", async () => {
    render(<TypeToConfirm phrase="acme" undo onConfirm={vi.fn()} />)
    type("acme")
    await act(async () =>
      fireEvent.submit(screen.getByRole("textbox").closest("form")!)
    )
    expect(screen.getByText("Done. Undo is available.")).toBeTruthy()
  })

  it("unchecking an acknowledgement disables confirm again", () => {
    render(
      <TypeToConfirm
        phrase="acme"
        acknowledgements={["I understand"]}
        onConfirm={vi.fn()}
      />
    )
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acme")
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(confirm).toHaveProperty("disabled", false)
    fireEvent.click(checkbox)
    expect(confirm).toHaveProperty("disabled", true)
  })

  it("the phrase must match exactly", () => {
    render(<TypeToConfirm phrase="acme" onConfirm={vi.fn()} />)
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("Acme")
    expect(confirm).toHaveProperty("disabled", true)
    type("acme ")
    expect(confirm).toHaveProperty("disabled", true)
  })

  it("acknowledgements reset after confirming", () => {
    render(
      <TypeToConfirm
        phrase="acme"
        acknowledgements={["I understand"]}
        onConfirm={vi.fn()}
      />
    )
    type("acme")
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "false"
    )
    expect(screen.getByRole("textbox")).toHaveProperty("value", "")
  })

  it("announces when the phrase matches", () => {
    render(<TypeToConfirm phrase="acme" onConfirm={vi.fn()} />)
    type("acme")
    expect(screen.getByText("Phrase matches")).toBeTruthy()
  })

  it("undo: pauseUndoOnHover={false} keeps the window running", async () => {
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        undo
        pauseUndoOnHover={false}
        onConfirm={onConfirm}
      />
    )
    type("acme")
    await act(async () =>
      fireEvent.submit(screen.getByRole("textbox").closest("form")!)
    )
    const undoButton = screen.getByRole("button", { name: "Undo" })
    fireEvent.pointerLeave(undoButton)
    fireEvent.pointerEnter(undoButton)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("async: pending onConfirm disables the button", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    render(<TypeToConfirm phrase="acme" onConfirm={onConfirm} />)
    const confirm = screen.getByRole("button", { name: "Confirm" })
    type("acme")
    await act(async () => fireEvent.click(confirm))
    expect(confirm).toHaveProperty("disabled", true)
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("inline: the confirm button sits in the form by default", () => {
    render(<TypeToConfirm phrase="acme" onConfirm={vi.fn()} />)
    const form = screen.getByRole("textbox").closest("form")
    expect(screen.getByRole("button", { name: "Confirm" }).parentElement).toBe(
      form
    )
  })

  it("renderActions places the confirm button and Enter still submits", () => {
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        onConfirm={onConfirm}
        renderActions={(confirmButton) => (
          <div data-testid="actions">
            <button type="button">Back</button>
            {confirmButton}
          </div>
        )}
      />
    )
    const actions = screen.getByTestId("actions")
    expect(screen.getByRole("button", { name: "Confirm" }).parentElement).toBe(
      actions
    )
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    type("acme")
    fireEvent.submit(screen.getByRole("textbox"))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("renderActions: undo still pauses on hover", async () => {
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        undo
        onConfirm={onConfirm}
        renderActions={(confirmButton) => <div>{confirmButton}</div>}
      />
    )
    type("acme")
    await act(async () => fireEvent.submit(screen.getByRole("textbox")))
    const undoButton = screen.getByRole("button", { name: "Undo" })
    fireEvent.pointerLeave(undoButton)
    fireEvent.pointerEnter(undoButton)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(undoButton)
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy()
  })
})
