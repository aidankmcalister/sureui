import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  useConfirmClose,
  type ConfirmCloseOptions,
} from "@/components/ui/sureui/unsaved-changes"

function EditDialog({
  initiallyDirty = false,
  options,
}: {
  initiallyDirty?: boolean
  options?: ConfirmCloseOptions
}) {
  const [name, setName] = React.useState(initiallyDirty ? "Ada" : "")
  const { rootProps, question, close } = useConfirmClose(name !== "", {
    onDiscard: () => setName(""),
    ...options,
  })

  return (
    <Dialog {...rootProps}>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <input
          aria-label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {question ?? <Button onClick={close}>Save</Button>}
      </DialogContent>
    </Dialog>
  )
}

async function openEditor(props: React.ComponentProps<typeof EditDialog>) {
  render(<EditDialog {...props} />)
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }))
  )
  return screen.findByRole("dialog", { name: "Edit profile" })
}

async function type(value: string) {
  await act(async () =>
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value },
    })
  )
}

function questionShown() {
  return screen.queryByRole("button", { name: "Keep editing" })
}

function pressOutside() {
  const backdrop = document.querySelector('[data-slot="dialog-overlay"]')!
  fireEvent.pointerDown(backdrop)
  fireEvent.mouseDown(backdrop)
  fireEvent.pointerUp(backdrop)
  fireEvent.mouseUp(backdrop)
  fireEvent.click(backdrop)
}

const attempts = {
  Escape: async () =>
    act(async () =>
      fireEvent.keyDown(document.activeElement!, { key: "Escape" })
    ),
  "a click outside": async () => act(async () => pressOutside()),
  "the close button": async () =>
    act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Close" }))
    ),
}

describe("useConfirmClose", () => {
  it.each(Object.entries(attempts))(
    "%s closes straight away when nothing changed",
    async (_, attempt) => {
      await openEditor({})
      await attempt()
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    }
  )

  it.each(Object.entries(attempts))(
    "%s asks before closing with unsaved edits",
    async (_, attempt) => {
      const editor = await openEditor({})
      await type("Ada")
      await attempt()
      const ask = await screen.findByRole("button", { name: "Keep editing" })
      expect(editor.contains(ask)).toBe(true)
      expect(screen.getByRole("status").textContent).toBe("Discard changes?")
      expect(screen.getAllByRole("dialog")).toHaveLength(1)
    }
  )

  it("Discard closes the dialog and calls onDiscard", async () => {
    const onDiscard = vi.fn()
    await openEditor({ initiallyDirty: true, options: { onDiscard } })
    await attempts.Escape()
    await act(async () =>
      fireEvent.click(
        await screen.findByRole("button", { name: "Discard changes" })
      )
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(onDiscard).toHaveBeenCalledOnce()
  })

  it("Keep editing goes back to the form with focus where it was", async () => {
    const editor = await openEditor({ initiallyDirty: true })
    const input = screen.getByRole("textbox", { name: "Name" })
    input.focus()
    await attempts.Escape()
    const keep = await screen.findByRole("button", { name: "Keep editing" })
    await waitFor(() => expect(document.activeElement).toBe(keep))
    await act(async () => fireEvent.click(keep))
    expect(questionShown()).toBeNull()
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBe(editor)
    expect(input).toHaveProperty("value", "Ada")
    await waitFor(() => expect(document.activeElement).toBe(input))
  })

  it("Escape while asking keeps the dialog and the question", async () => {
    await openEditor({ initiallyDirty: true })
    await attempts.Escape()
    await screen.findByRole("button", { name: "Keep editing" })
    await attempts.Escape()
    expect(questionShown()).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeTruthy()
  })

  it("hides the question when the edits are undone by hand", async () => {
    await openEditor({ initiallyDirty: true })
    await attempts.Escape()
    await screen.findByRole("button", { name: "Keep editing" })
    await type("")
    expect(questionShown()).toBeNull()
    await type("Grace")
    expect(questionShown()).toBeNull()
  })

  it("Keep editing never submits a form whose footer it replaces", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    function FormDialog() {
      const [name, setName] = React.useState("Ada")
      const { rootProps, question } = useConfirmClose(name !== "Ada", {
        defaultOpen: true,
      })
      return (
        <Dialog {...rootProps}>
          <DialogContent>
            <DialogTitle>Edit profile</DialogTitle>
            <form onSubmit={onSubmit}>
              <input
                aria-label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {question ?? (
                <>
                  <Button type="button">Cancel</Button>
                  <Button type="submit">Save</Button>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )
    }
    render(<FormDialog />)
    await screen.findByRole("dialog", { name: "Edit profile" })
    await type("Ada L")
    await attempts.Escape()
    const keep = await screen.findByRole("button", { name: "Keep editing" })
    await act(async () => fireEvent.click(keep))
    expect(keep.isConnected).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeTruthy()
  })

  it("onSave adds Save, which saves and then closes", async () => {
    const onSave = vi.fn()
    const onDiscard = vi.fn()
    await openEditor({ initiallyDirty: true, options: { onSave, onDiscard } })
    await attempts.Escape()
    await act(async () =>
      fireEvent.click(await screen.findByRole("button", { name: "Save" }))
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(onSave).toHaveBeenCalledOnce()
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it("close() closes without asking", async () => {
    await openEditor({ initiallyDirty: true })
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Save" }))
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("uses the question's labels and forwards onOpenChange", async () => {
    const onOpenChange = vi.fn()
    await openEditor({
      initiallyDirty: true,
      options: {
        title: "Throw away your edits?",
        discardLabel: "Throw away",
        keepLabel: "Back",
        onOpenChange,
      },
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await attempts.Escape()
    await screen.findByRole("button", { name: "Back" })
    expect(screen.getByRole("status").textContent).toBe(
      "Throw away your edits?"
    )
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Throw away" }))
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("an async onDiscard keeps the question pending, then closes", async () => {
    let resolve!: () => void
    const onDiscard = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    await openEditor({ initiallyDirty: true, options: { onDiscard } })
    await attempts.Escape()
    const discard = await screen.findByRole("button", {
      name: "Discard changes",
    })
    await act(async () => fireEvent.click(discard))
    expect(discard.getAttribute("data-state")).toBe("pending")
    expect(questionShown()).toBeTruthy()
    await act(async () => {
      resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("works with open controlled by the caller", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(true)
      const { rootProps, question } = useConfirmClose(true, {
        open,
        onOpenChange: setOpen,
      })
      return (
        <>
          <span>{open ? "open" : "closed"}</span>
          <Dialog {...rootProps}>
            <DialogContent>
              <DialogTitle>Edit profile</DialogTitle>
              {question}
            </DialogContent>
          </Dialog>
        </>
      )
    }
    render(<Controlled />)
    await screen.findByRole("dialog")
    await attempts.Escape()
    await screen.findByRole("button", { name: "Keep editing" })
    expect(screen.getByText("open")).toBeTruthy()
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Discard changes" }))
    )
    await waitFor(() => expect(screen.getByText("closed")).toBeTruthy())
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("a failed onDiscard keeps the question and reaches onConfirmError", async () => {
    const onConfirmError = vi.fn()
    await openEditor({
      initiallyDirty: true,
      options: {
        onDiscard: () => Promise.reject(new Error("offline")),
        onConfirmError,
        errorLabel: "Try again",
      },
    })
    await attempts.Escape()
    await act(async () =>
      fireEvent.click(
        await screen.findByRole("button", { name: "Discard changes" })
      )
    )
    await waitFor(() =>
      expect(onConfirmError.mock.calls[0]?.[0]).toHaveProperty(
        "message",
        "offline"
      )
    )
    expect(
      await screen.findByRole("button", { name: "Try again" })
    ).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeTruthy()
  })
})
