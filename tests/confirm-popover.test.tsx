import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import {
  ConfirmPopover,
  type ConfirmPopoverProps,
} from "@/components/ui/sureui/confirm-popover"

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "performance"],
    shouldAdvanceTime: true,
  })
})

function renderPopover(props: Partial<ConfirmPopoverProps> = {}) {
  const onConfirm = props.onConfirm ?? vi.fn()
  const onCancel = props.onCancel ?? vi.fn()
  render(
    <>
      <ConfirmPopover
        description="Collaborators lose access to this branch."
        {...props}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Delete branch</Button>
      </ConfirmPopover>
      <button>Outside</button>
    </>
  )
  const trigger = screen.getByRole("button", { name: "Delete branch" })
  return { trigger, onConfirm, onCancel }
}

async function open(trigger: HTMLElement) {
  await act(async () => fireEvent.click(trigger))
  return screen.findByRole("dialog")
}

async function closed() {
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
}

function confirmButton() {
  return screen.getByRole("button", { name: "Confirm" })
}

describe("ConfirmPopover", () => {
  it("opens on the trigger with the description as its name", async () => {
    const { trigger } = renderPopover()
    expect(screen.queryByRole("dialog")).toBeNull()
    const popup = await open(trigger)
    expect(
      screen.getByRole("dialog", {
        name: "Collaborators lose access to this branch.",
      })
    ).toBe(popup)
    expect(popup.hasAttribute("aria-describedby")).toBe(false)
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy()
  })

  it("names the popover by its title when there is one", async () => {
    const { trigger } = renderPopover({ title: "Delete branch?" })
    const popup = await open(trigger)
    expect(screen.getByRole("dialog", { name: "Delete branch?" })).toBe(popup)
    expect(
      screen.getByRole("dialog", {
        description: "Collaborators lose access to this branch.",
      })
    ).toBe(popup)
  })

  it("confirm calls onConfirm and closes", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover()
    await open(trigger)
    await act(async () => fireEvent.click(confirmButton()))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
    await closed()
  })

  it("Cancel calls onCancel and closes", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover()
    await open(trigger)
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    )
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    await closed()
  })

  it("Escape calls onCancel and closes", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover()
    await open(trigger)
    await act(async () =>
      fireEvent.keyDown(document.activeElement!, { key: "Escape" })
    )
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    await closed()
  })

  it("a click outside calls onCancel and closes", async () => {
    const { trigger, onCancel } = renderPopover()
    await open(trigger)
    const outside = screen.getByRole("button", { name: "Outside" })
    await act(async () => {
      fireEvent.pointerDown(outside)
      fireEvent.mouseDown(outside)
      fireEvent.pointerUp(outside)
      fireEvent.mouseUp(outside)
      fireEvent.click(outside)
    })
    expect(onCancel).toHaveBeenCalledOnce()
    await closed()
  })

  it("uses confirmLabel, cancelLabel and variant", async () => {
    const { trigger } = renderPopover({
      confirmLabel: "Delete",
      cancelLabel: "Keep",
      variant: "destructive",
    })
    await open(trigger)
    const confirm = screen.getByRole("button", { name: "Delete" })
    expect(confirm.className).toContain("text-destructive")
    expect(screen.getByRole("button", { name: "Keep" })).toBeTruthy()
  })

  it("moves focus to the confirm button and back to the trigger", async () => {
    const { trigger } = renderPopover()
    trigger.focus()
    await open(trigger)
    await waitFor(() => expect(document.activeElement).toBe(confirmButton()))
    await act(async () =>
      fireEvent.keyDown(document.activeElement!, { key: "Escape" })
    )
    await closed()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("initialFocus: cancel focuses Cancel", async () => {
    const { trigger } = renderPopover({ initialFocus: "cancel" })
    await open(trigger)
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Cancel" })
      )
    )
  })

  it("initialFocus: none focuses the popover itself", async () => {
    const { trigger } = renderPopover({ initialFocus: "none" })
    const popup = await open(trigger)
    await waitFor(() => expect(document.activeElement).toBe(popup))
  })

  it("returns focus to the trigger after confirming", async () => {
    const { trigger } = renderPopover()
    trigger.focus()
    await open(trigger)
    await waitFor(() => expect(document.activeElement).toBe(confirmButton()))
    await act(async () => fireEvent.click(confirmButton()))
    await closed()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("stays open while pending, blocks Escape and Cancel, then closes", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const { trigger, onCancel } = renderPopover({ onConfirm })
    await open(trigger)
    const confirm = confirmButton()
    await act(async () => fireEvent.click(confirm))
    expect(confirm.getAttribute("data-state")).toBe("pending")
    const cancel = screen.getByRole("button", { name: "Cancel" })
    expect(cancel).toHaveProperty("disabled", true)
    await act(async () =>
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      })
    )
    await act(async () => fireEvent.click(cancel))
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(onCancel).not.toHaveBeenCalled()
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    await closed()
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("stays open when onConfirm rejects and passes the error on", async () => {
    let reject!: (error: Error) => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_, rej) => {
          reject = rej
        })
    )
    const onRejection = vi.fn()
    process.on("unhandledRejection", onRejection)
    try {
      const { trigger } = renderPopover({ onConfirm })
      await open(trigger)
      await act(async () => fireEvent.click(confirmButton()))
      await act(async () => {
        reject(new Error("offline"))
        await new Promise((res) => setTimeout(res, 0))
      })
      expect(confirmButton().getAttribute("data-state")).toBe("idle")
      expect(screen.getByRole("dialog")).toBeTruthy()
      expect(
        screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled")
      ).toBe(false)
      await waitFor(() =>
        expect(onRejection.mock.calls[0]?.[0]).toHaveProperty(
          "message",
          "offline"
        )
      )
    } finally {
      process.off("unhandledRejection", onRejection)
    }
  })

  it("gesture=click-again: the first click arms inside the popover", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover({
      gesture: "click-again",
      announcements: { armed: "Pulsa otra vez" },
    })
    await open(trigger)
    const confirm = confirmButton()
    await act(async () => fireEvent.click(confirm))
    expect(confirm.getAttribute("data-state")).toBe("armed")
    expect(screen.getByText("Pulsa otra vez")).toBeTruthy()
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
    await act(async () => fireEvent.click(confirm))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
    await closed()
  })

  it("gesture=click-again: disarming after timeout keeps it open", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover({
      gesture: "click-again",
      timeout: 2000,
    })
    await open(trigger)
    const confirm = confirmButton()
    await act(async () => fireEvent.click(confirm))
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(confirm.getAttribute("data-state")).toBe("idle")
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("gesture=hold: releasing early keeps it open", async () => {
    const { trigger, onConfirm, onCancel } = renderPopover({
      gesture: "hold",
      duration: 2000,
    })
    await open(trigger)
    const confirm = confirmButton()
    fireEvent.pointerDown(confirm, { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(1500))
    await act(async () => fireEvent.pointerUp(confirm))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeTruthy()
  })

  it("gesture=hold: confirms when the fill completes and closes", async () => {
    const { trigger, onConfirm } = renderPopover({ gesture: "hold" })
    await open(trigger)
    fireEvent.pointerDown(confirmButton(), { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    expect(onConfirm).toHaveBeenCalledOnce()
    await closed()
  })

  it("controlled: open and onOpenChange drive it", async () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()

    function Controlled() {
      const [open, setOpen] = React.useState(true)
      return (
        <ConfirmPopover
          description="Discard changes?"
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next)
            setOpen(next)
          }}
          onConfirm={onConfirm}
        >
          <Button>Discard</Button>
        </ConfirmPopover>
      )
    }

    render(<Controlled />)
    await screen.findByRole("dialog")
    await act(async () => fireEvent.click(confirmButton()))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await closed()
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Discard" }))
    )
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await screen.findByRole("dialog")
  })

  it("unmounting while open calls neither handler", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const view = render(
      <ConfirmPopover
        description="Delete?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Delete</Button>
      </ConfirmPopover>
    )
    await open(screen.getByRole("button", { name: "Delete" }))
    view.unmount()
    await act(async () => {})
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})

describe("ConfirmPopover options", () => {
  it("armDelay ignores a click that lands right after opening", async () => {
    const { trigger, onConfirm } = renderPopover({ armDelay: 5000 })
    await open(trigger)
    await act(async () => fireEvent.click(confirmButton()))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeTruthy()
    await act(async () => vi.advanceTimersByTime(5000))
    await act(async () => fireEvent.click(confirmButton()))
    expect(onConfirm).toHaveBeenCalledOnce()
    await closed()
  })

  it("onConfirmError keeps it open with errorLabel and retries", async () => {
    let attempt = 0
    const onConfirm = vi.fn(() => {
      attempt += 1
      return attempt === 1 ? Promise.reject(new Error("offline")) : undefined
    })
    const onConfirmError = vi.fn()
    const onRejection = vi.fn()
    process.on("unhandledRejection", onRejection)
    try {
      const { trigger } = renderPopover({
        onConfirm,
        onConfirmError,
        errorLabel: "Retry",
      })
      await open(trigger)
      await act(async () => fireEvent.click(confirmButton()))
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(onConfirmError.mock.calls[0]?.[0]).toHaveProperty(
        "message",
        "offline"
      )
      expect(screen.getByRole("dialog")).toBeTruthy()
      const retry = screen.getByRole("button", { name: "Retry" })
      await act(async () => fireEvent.click(retry))
      expect(onConfirm).toHaveBeenCalledTimes(2)
      await closed()
      expect(onRejection).not.toHaveBeenCalled()
    } finally {
      process.off("unhandledRejection", onRejection)
    }
  })
})
