import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import {
  ConfirmDialog,
  useConfirm,
  type ConfirmDialogOptions,
} from "@/components/ui/sureui/confirm-dialog"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

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

  it("gesture=hold: holding then advancing time confirms and closes", async () => {
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
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
    fireEvent.pointerDown(confirmButton, { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    expect(onConfirm).toHaveBeenCalledOnce()
    vi.useRealTimers()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
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
    await waitFor(() => expect(confirmButton).toHaveProperty("disabled", true))
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})

function Harness({
  onReady,
}: {
  onReady: (
    confirm: (
      options: Omit<ConfirmDialogOptions, "onConfirm" | "onCancel">
    ) => Promise<boolean>
  ) => void
}) {
  const { confirm, dialog } = useConfirm()
  onReady(confirm)
  return dialog
}

function renderHook() {
  let confirm!: (
    options: Omit<ConfirmDialogOptions, "onConfirm" | "onCancel">
  ) => Promise<boolean>
  const view = render(<Harness onReady={(fn) => (confirm = fn)} />)
  let result!: Promise<boolean>
  act(() => {
    result = confirm({ title: "Discard?" })
  })
  return { result, view }
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

  it("resolves false on unmount", async () => {
    const { result, view } = renderHook()
    view.unmount()
    await expect(result).resolves.toBe(false)
  })
})
