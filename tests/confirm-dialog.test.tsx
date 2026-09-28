import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import {
  ConfirmDialog,
  useConfirm,
} from "@/components/ui/sureui/confirm-dialog"

function renderDialog() {
  const onConfirm = vi.fn()
  render(
    <ConfirmDialog title="Delete?" onConfirm={onConfirm}>
      <Button>Delete</Button>
    </ConfirmDialog>
  )
  fireEvent.click(screen.getByRole("button", { name: "Delete" }))
  return onConfirm
}

describe("ConfirmDialog", () => {
  it("calls onConfirm on confirm", async () => {
    const onConfirm = renderDialog()
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("does not call onConfirm on cancel or escape", async () => {
    const onConfirm = renderDialog()
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    await screen.findByRole("alertdialog")
    fireEvent.keyDown(document.activeElement!, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("focuses cancel and returns focus to the trigger", async () => {
    renderDialog()
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(document.activeElement).toBe(cancel))
    fireEvent.click(cancel)
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Delete" })
      )
    )
  })

  it("gesture=hold: holding then releasing confirms and closes", async () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "performance"],
      shouldAdvanceTime: true,
    })
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog title="Revoke key?" gesture="hold" onConfirm={onConfirm}>
        <Button>Revoke</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }))
    const confirmButton = await screen.findByRole("button", {
      name: "Confirm",
    })
    fireEvent.pointerDown(confirmButton, { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    await act(async () => fireEvent.pointerUp(confirmButton))
    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("gesture=hold: forwards duration and confirmOnRelease", async () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "performance"],
      shouldAdvanceTime: true,
    })
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Revoke key?"
        gesture="hold"
        duration={2000}
        confirmOnRelease={false}
        onConfirm={onConfirm}
      >
        <Button>Revoke</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }))
    const confirmButton = await screen.findByRole("button", {
      name: "Confirm",
    })
    fireEvent.pointerDown(confirmButton, { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(1500))
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTimeAsync(500))
    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("gesture=hold: forwards cancelHoldOnLeave and announcements", async () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "performance"],
      shouldAdvanceTime: true,
    })
    render(
      <ConfirmDialog
        title="Revoke key?"
        gesture="hold"
        cancelHoldOnLeave={false}
        announcements={{ hold: "Mantén pulsado", ready: "Suelta ahora" }}
        onConfirm={vi.fn()}
      >
        <Button>Revoke</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }))
    const confirmButton = await screen.findByRole("button", {
      name: "Confirm",
    })
    expect(screen.getByText("Mantén pulsado")).toBeTruthy()
    fireEvent.pointerDown(confirmButton, { button: 0 })
    fireEvent.pointerLeave(confirmButton)
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    expect(confirmButton.getAttribute("data-state")).toBe("ready")
    expect(screen.getByText("Suelta ahora")).toBeTruthy()
  })

  it("gesture=click-again: forwards announcements.armed", async () => {
    render(
      <ConfirmDialog
        title="Archive?"
        gesture="click-again"
        announcements={{ armed: "Pulsa otra vez" }}
        onConfirm={vi.fn()}
      >
        <Button>Archive</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Archive" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    expect(screen.getByText("Pulsa otra vez")).toBeTruthy()
  })

  it("phrase: forwards caseSensitive, trim and announcements.match", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="Acme"
        caseSensitive={false}
        trim
        announcements={{ match: "Coincide" }}
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    fireEvent.change(await screen.findByRole("textbox"), {
      target: { value: " acme " },
    })
    expect(screen.getByText("Coincide")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
  })

  it("unmounting while open calls neither handler", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const view = render(
      <ConfirmDialog title="Delete?" onConfirm={onConfirm} onCancel={onCancel}>
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    await screen.findByRole("alertdialog")
    view.unmount()
    await act(async () => {})
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("phrase: typing it and submitting confirms and closes", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="acme"
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const input = await screen.findByRole("textbox")
    fireEvent.change(input, { target: { value: "acme" } })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("phrase: Cancel and Confirm share the footer", async () => {
    render(
      <ConfirmDialog title="Delete project?" phrase="acme" onConfirm={vi.fn()}>
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    const footer = cancel.parentElement!
    expect(footer.getAttribute("data-slot")).toBe("alert-dialog-footer")
    expect(screen.getByRole("button", { name: "Confirm" }).parentElement).toBe(
      footer
    )
  })

  it("phrase: Enter in the input confirms and closes", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="acme"
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const input = await screen.findByRole("textbox")
    fireEvent.change(input, { target: { value: "acme" } })
    fireEvent.submit(input)
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("phrase: Cancel closes without confirming", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="acme"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const input = await screen.findByRole("textbox")
    fireEvent.change(input, { target: { value: "acme" } })
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("async: stays open while pending and closes once resolved", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    render(
      <ConfirmDialog title="Leave team?" onConfirm={onConfirm}>
        <Button>Leave</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Leave" }))
    const confirmButton = await screen.findByRole("button", {
      name: "Confirm",
    })
    fireEvent.click(confirmButton)
    await waitFor(() =>
      expect(confirmButton.getAttribute("aria-disabled")).toBe("true")
    )
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("calls onCancel on Cancel but not after confirming", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog title="Delete?" onConfirm={onConfirm} onCancel={onCancel}>
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    expect(onCancel).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("ignores Cancel and Escape while onConfirm is pending", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        title="Leave team?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Leave</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Leave" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    const cancel = screen.getByRole("button", { name: "Cancel" })
    await waitFor(() => expect(cancel).toHaveProperty("disabled", true))
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    })
    await act(async () => {})
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    expect(onCancel).not.toHaveBeenCalled()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onCancel).not.toHaveBeenCalled()
  })
})

type Confirm = ReturnType<typeof useConfirm>["confirm"]

function Harness({ onReady }: { onReady: (confirm: Confirm) => void }) {
  const { confirm, dialog } = useConfirm()
  onReady(confirm)
  return dialog
}

function renderHook(options: Parameters<Confirm>[0] = { title: "Discard?" }) {
  let confirm!: Confirm
  const view = render(<Harness onReady={(fn) => (confirm = fn)} />)
  let result!: Promise<boolean>
  act(() => {
    result = confirm(options)
  })
  return { result, view, confirm }
}

describe("useConfirm", () => {
  it("resolves true on confirm", async () => {
    const { result } = renderHook()
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    await expect(result).resolves.toBe(true)
  })

  it("resolves false on cancel", async () => {
    const { result } = renderHook()
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    await expect(result).resolves.toBe(false)
  })

  it("focuses cancel on open", async () => {
    renderHook()
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(document.activeElement).toBe(cancel))
  })

  it("resolves true only after an async onConfirm settles", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const { result } = renderHook({ title: "Discard?", onConfirm })
    let settled: boolean | undefined
    result.then((value) => (settled = value))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    await act(async () => {})
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(settled).toBeUndefined()
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await expect(result).resolves.toBe(true)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("forwards phrase options", async () => {
    const { result } = renderHook({
      title: "Delete project?",
      phrase: "acme",
      trim: true,
    })
    const input = await screen.findByRole("textbox")
    fireEvent.change(input, { target: { value: "acme " } })
    fireEvent.submit(input)
    await expect(result).resolves.toBe(true)
  })

  it("a second confirm resolves the first with false", async () => {
    const { result, confirm } = renderHook()
    act(() => {
      confirm({ title: "Again?" })
    })
    await expect(result).resolves.toBe(false)
  })

  it("resolves false on unmount", async () => {
    const { result, view } = renderHook()
    view.unmount()
    await expect(result).resolves.toBe(false)
  })
})
