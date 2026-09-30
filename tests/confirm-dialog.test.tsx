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

  it("gesture=hold: forwards duration", async () => {
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

  it("gesture=hold: forwards announcements", async () => {
    render(
      <ConfirmDialog
        title="Revoke key?"
        gesture="hold"
        announcements={{ hold: "Mantén pulsado" }}
        onConfirm={vi.fn()}
      >
        <Button>Revoke</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }))
    await screen.findByRole("button", { name: "Confirm" })
    expect(screen.getByText("Mantén pulsado")).toBeTruthy()
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

  it("initialFocus: focuses the confirm button or the dialog itself", async () => {
    const view = render(
      <ConfirmDialog
        title="Publish?"
        initialFocus="confirm"
        onConfirm={vi.fn()}
      >
        <Button>Publish</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    const confirmButton = await screen.findByRole("button", { name: "Confirm" })
    await waitFor(() => expect(document.activeElement).toBe(confirmButton))
    view.unmount()

    render(
      <ConfirmDialog title="Publish?" initialFocus="none" onConfirm={vi.fn()}>
        <Button>Publish</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    const dialog = await screen.findByRole("alertdialog")
    await waitFor(() => expect(document.activeElement).toBe(dialog))
  })

  it("initialFocus: a phrase starts in the field unless it says cancel", async () => {
    const view = render(
      <ConfirmDialog title="Delete?" phrase="acme" onConfirm={vi.fn()}>
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const input = await screen.findByRole("textbox")
    await waitFor(() => expect(document.activeElement).toBe(input))
    view.unmount()

    render(
      <ConfirmDialog
        title="Delete?"
        phrase="acme"
        initialFocus="cancel"
        onConfirm={vi.fn()}
      >
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(document.activeElement).toBe(cancel))
  })

  it("initialFocus: cancel by default even with choices before it", async () => {
    render(
      <ConfirmDialog
        title="Delete?"
        choices={[{ name: "snapshot", label: "Take a final snapshot" }]}
        onConfirm={vi.fn()}
      >
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(document.activeElement).toBe(cancel))
  })

  it("variant styles the confirm button, not the trigger", async () => {
    render(
      <ConfirmDialog title="Delete?" variant="destructive" onConfirm={vi.fn()}>
        <Button variant="outline">Delete</Button>
      </ConfirmDialog>
    )
    const trigger = screen.getByRole("button", { name: "Delete" })
    fireEvent.click(trigger)
    const confirmButton = await screen.findByRole("button", { name: "Confirm" })
    expect(confirmButton.className).toContain("text-destructive")
    expect(trigger.className).not.toContain("text-destructive")
  })

  it("phrase: several phrases must all match", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase={["acme", "delete my project"]}
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    await screen.findByRole("alertdialog")
    const [name, sentence] = screen.getAllByRole("textbox")
    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    fireEvent.change(name, { target: { value: "acme" } })
    expect(confirmButton).toHaveProperty("disabled", true)
    fireEvent.change(sentence, { target: { value: "delete my project" } })
    fireEvent.click(confirmButton)
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
  })

  it("choices: passes their values to onConfirm", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete database?"
        choices={[
          {
            name: "snapshot",
            label: "Take a final snapshot",
            defaultChecked: true,
          },
          { name: "notify", label: "Email the owners" },
        ]}
        onConfirm={onConfirm}
      >
        <Button>Delete database</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete database" }))
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "Take a final snapshot" })
    )
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ snapshot: false, notify: false })
    )
  })

  it("acknowledgements: without a phrase, confirm waits for every one", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete database?"
        acknowledgements={["Backups are deleted", "This can't be undone"]}
        onConfirm={onConfirm}
      >
        <Button>Delete database</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete database" }))
    const confirm = await screen.findByRole("button", { name: "Confirm" })
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Backups are deleted" })
    )
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.click(
      screen.getByRole("checkbox", { name: "This can't be undone" })
    )
    expect(confirm.hasAttribute("disabled")).toBe(false)
    fireEvent.click(confirm)
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({}))
  })

  it("choices: start from their defaults each time it opens", async () => {
    render(
      <ConfirmDialog
        title="Delete database?"
        choices={[{ name: "snapshot", label: "Take a final snapshot" }]}
        onConfirm={vi.fn()}
      >
        <Button>Delete database</Button>
      </ConfirmDialog>
    )
    const trigger = screen.getByRole("button", { name: "Delete database" })
    fireEvent.click(trigger)
    const box = await screen.findByRole("checkbox")
    fireEvent.click(box)
    expect(box.getAttribute("aria-checked")).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    fireEvent.click(trigger)
    expect(
      (await screen.findByRole("checkbox")).getAttribute("aria-checked")
    ).toBe("false")
  })

  it("phrase: choices reach onConfirm", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="acme"
        choices={[{ name: "snapshot", label: "Take a final snapshot" }]}
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    fireEvent.change(await screen.findByRole("textbox"), {
      target: { value: "acme" },
    })
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ snapshot: true })
    )
  })

  it("alternative: runs onSelect and closes without either handler", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onSelect = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase="acme"
        alternative={{ label: "Archive instead", onSelect }}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const archive = await screen.findByRole("button", {
      name: "Archive instead",
    })
    expect(archive.parentElement?.getAttribute("data-slot")).toBe(
      "alert-dialog-footer"
    )
    fireEvent.click(archive)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("alternative: stays open while onSelect is pending and blocks the rest", async () => {
    let resolve!: () => void
    const onSelect = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Delete project?"
        alternative={{ label: "Archive instead", onSelect }}
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    const archive = await screen.findByRole("button", {
      name: "Archive instead",
    })
    fireEvent.click(archive)
    await waitFor(() =>
      expect(archive.getAttribute("data-state")).toBe("pending")
    )
    const cancel = screen.getByRole("button", { name: "Cancel" })
    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    expect(cancel).toHaveProperty("disabled", true)
    expect(confirmButton).toHaveProperty("disabled", true)
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    })
    await act(async () => {})
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).not.toHaveBeenCalled()
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

  it("resolves false after the alternative", async () => {
    const onSelect = vi.fn()
    const { result } = renderHook({
      title: "Delete project?",
      alternative: { label: "Archive instead", onSelect },
    })
    fireEvent.click(
      await screen.findByRole("button", { name: "Archive instead" })
    )
    await expect(result).resolves.toBe(false)
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it("resolves false on unmount", async () => {
    const { result, view } = renderHook()
    view.unmount()
    await expect(result).resolves.toBe(false)
  })
})

describe("ConfirmDialog options", () => {
  it("armDelay ignores a click that lands right after opening", async () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "performance"],
      shouldAdvanceTime: true,
    })
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog title="Delete?" armDelay={5000} onConfirm={onConfirm}>
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const confirm = await screen.findByRole("button", { name: "Confirm" })
    fireEvent.click(confirm)
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(5000))
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("onConfirmError keeps it open and shows errorLabel", async () => {
    const onConfirmError = vi.fn()
    render(
      <ConfirmDialog
        title="Delete?"
        errorLabel="Try again"
        onConfirmError={onConfirmError}
        onConfirm={() => Promise.reject(new Error("offline"))}
      >
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    await waitFor(() =>
      expect(onConfirmError.mock.calls[0]?.[0]).toHaveProperty(
        "message",
        "offline"
      )
    )
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    expect(
      await screen.findByRole("button", { name: "Try again" })
    ).toBeTruthy()
  })

  it("phrase: a failed confirm with choices keeps it open and announces the error", async () => {
    const onConfirmError = vi.fn()
    const onConfirm = vi.fn(() => Promise.reject(new Error("offline")))
    render(
      <ConfirmDialog
        title="Delete project?"
        phrase={["acme", "delete my project"]}
        choices={[{ name: "snapshot", label: "Take a final snapshot" }]}
        errorLabel="Try again"
        announcements={{ error: "No se pudo borrar" }}
        onConfirmError={onConfirmError}
        onConfirm={onConfirm}
      >
        <Button>Delete project</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }))
    await screen.findByRole("alertdialog")
    const [name, sentence] = screen.getAllByRole("textbox")
    fireEvent.change(name, { target: { value: "acme" } })
    fireEvent.change(sentence, { target: { value: "delete my project" } })
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await waitFor(() => expect(onConfirmError).toHaveBeenCalledOnce())
    expect(onConfirm).toHaveBeenCalledWith({ snapshot: true })
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    expect(await screen.findByText("No se pudo borrar")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy()
  })
})

describe("confirm a select change example", () => {
  it("keeps the old value until the dialog is confirmed", async () => {
    const { Preview } = await import("@/components/site/docs/preview")
    const { default: Example } =
      await import("@/components/site/docs/examples/confirm-dialog/select-change")
    render(
      <Preview name="confirm-dialog/select-change" code={null} log>
        <Example />
      </Preview>
    )
    const trigger = screen.getByRole("combobox", { name: "Role" })
    async function pick(name: string) {
      fireEvent.click(trigger)
      const option = await screen.findByRole(
        "option",
        { name },
        { timeout: 2000 }
      )
      await act(async () => {
        fireEvent.pointerDown(option, { button: 0, pointerType: "mouse" })
        fireEvent.pointerUp(option, { button: 0, pointerType: "mouse" })
        fireEvent.click(option)
      })
    }
    await pick("Viewer")
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel" }, { timeout: 2000 })
    )
    await waitFor(() => expect(trigger.textContent).toContain("Admin"), {
      timeout: 2000,
    })
    await pick("Viewer")
    fireEvent.click(
      await screen.findByRole(
        "button",
        { name: "Make Viewer" },
        { timeout: 2000 }
      )
    )
    await waitFor(() => expect(trigger.textContent).toContain("Viewer"), {
      timeout: 2000,
    })
    expect(screen.getByRole("log").textContent).toContain(
      'changeRole("Viewer")'
    )
  })
})
