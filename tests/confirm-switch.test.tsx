import * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Label } from "@/components/ui/label"
import {
  ConfirmSwitch,
  type ConfirmSwitchProps,
} from "@/components/ui/sureui/confirm-switch"

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "performance"],
    shouldAdvanceTime: true,
  })
})

function renderSwitch(props: Partial<ConfirmSwitchProps> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  const onCheckedChange = vi.fn()
  const all = {
    defaultChecked: true,
    onConfirm,
    onCancel,
    onCheckedChange,
    ...props,
  } as ConfirmSwitchProps
  render(
    <>
      <Label htmlFor="two-factor">Two-factor authentication</Label>
      <ConfirmSwitch id="two-factor" {...all} />
      <button>Outside</button>
    </>
  )
  const control = screen.getByRole("switch", {
    name: "Two-factor authentication",
  })
  return {
    control,
    onConfirm: all.onConfirm as ReturnType<typeof vi.fn>,
    onCancel,
    onCheckedChange,
  }
}

async function click(element: HTMLElement) {
  await act(async () => fireEvent.click(element))
}

function checked(control: HTMLElement) {
  return control.getAttribute("aria-checked")
}

function live() {
  return document.querySelector("[aria-live]")?.textContent
}

async function catchRejection(run: (seen: () => unknown) => Promise<void>) {
  const onRejection = vi.fn()
  process.on("unhandledRejection", onRejection)
  try {
    await run(() => onRejection.mock.calls[0]?.[0])
  } finally {
    process.off("unhandledRejection", onRejection)
  }
}

describe("ConfirmSwitch", () => {
  it("is a switch named by its label, with aria-checked from the value", () => {
    const { control } = renderSwitch()
    expect(control.tagName).toBe("BUTTON")
    expect(checked(control)).toBe("true")
    expect(control.getAttribute("data-state")).toBe("idle")
  })

  it("turns on at once, the safe direction by default", async () => {
    const { control, onConfirm, onCheckedChange, onCancel } = renderSwitch({
      defaultChecked: false,
    })
    await click(control)
    expect(checked(control)).toBe("true")
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(true)
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("click-again: the first click arms without changing the value", async () => {
    const { control, onConfirm, onCheckedChange } = renderSwitch()
    await click(control)
    expect(control.getAttribute("data-state")).toBe("armed")
    expect(checked(control)).toBe("true")
    expect(live()).toBe("Click again to turn off")
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCheckedChange).not.toHaveBeenCalled()
    await click(control)
    expect(checked(control)).toBe("false")
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(live()).toBe("")
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(false)
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false)
  })

  it("click-again: the timeout disarms and leaves the value", async () => {
    const { control, onConfirm, onCancel } = renderSwitch({ timeout: 2000 })
    await click(control)
    await act(async () => vi.advanceTimersByTimeAsync(1900))
    expect(control.getAttribute("data-state")).toBe("armed")
    await act(async () => vi.advanceTimersByTimeAsync(200))
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(checked(control)).toBe("true")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("click-again: blur disarms, unless cancelOnBlur is false", async () => {
    const { control, onCancel } = renderSwitch()
    control.focus()
    await click(control)
    await act(async () => fireEvent.blur(control))
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(checked(control)).toBe("true")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("click-again: cancelOnBlur={false} stays armed", async () => {
    const { control } = renderSwitch({ cancelOnBlur: false })
    await click(control)
    await act(async () => fireEvent.blur(control))
    expect(control.getAttribute("data-state")).toBe("armed")
  })

  it("keyboard: Space arms, Space again turns it off, and focus stays", async () => {
    const { control, onConfirm } = renderSwitch()
    control.focus()
    async function space() {
      await act(async () => {
        fireEvent.keyDown(control, { key: " " })
        fireEvent.keyUp(control, { key: " " })
        fireEvent.click(control)
      })
    }
    await space()
    expect(control.getAttribute("data-state")).toBe("armed")
    await space()
    expect(checked(control)).toBe("false")
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(false)
    expect(document.activeElement).toBe(control)
    await space()
    expect(checked(control)).toBe("true")
  })

  it("keyboard: key-repeat clicks neither arm nor confirm", async () => {
    const { control, onConfirm } = renderSwitch()
    await act(async () => {
      fireEvent.keyDown(control, { key: "Enter", repeat: true })
      fireEvent.click(control)
    })
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("the label arms and confirms like the switch", async () => {
    const { control, onConfirm } = renderSwitch()
    const label = screen.getByText("Two-factor authentication")
    await click(label)
    expect(control.getAttribute("data-state")).toBe("armed")
    await click(label)
    expect(checked(control)).toBe("false")
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('confirmWhen="on" asks before turning on and turns off at once', async () => {
    const { control, onConfirm } = renderSwitch({ confirmWhen: "on" })
    await click(control)
    expect(checked(control)).toBe("false")
    expect(onConfirm).toHaveBeenLastCalledWith(false)
    await click(control)
    expect(control.getAttribute("data-state")).toBe("armed")
    expect(live()).toBe("Click again to turn on")
    await click(control)
    expect(checked(control)).toBe("true")
    expect(onConfirm).toHaveBeenLastCalledWith(true)
  })

  it('confirmWhen="both" asks in both directions', async () => {
    const { control } = renderSwitch({ confirmWhen: "both" })
    await click(control)
    expect(control.getAttribute("data-state")).toBe("armed")
    await click(control)
    expect(checked(control)).toBe("false")
    await click(control)
    expect(control.getAttribute("data-state")).toBe("armed")
  })

  it("hold: holding then releasing turns it off", async () => {
    const { control, onConfirm } = renderSwitch({ gesture: "hold" })
    fireEvent.pointerDown(control, { button: 0 })
    expect(control.getAttribute("data-state")).toBe("holding")
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    expect(control.getAttribute("data-state")).toBe("ready")
    expect(checked(control)).toBe("true")
    expect(live()).toBe("Release to turn off")
    await act(async () => fireEvent.pointerUp(control))
    expect(checked(control)).toBe("false")
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(false)
  })

  it("hold: letting go early cancels and leaves the value", async () => {
    const { control, onConfirm, onCancel } = renderSwitch({ gesture: "hold" })
    fireEvent.pointerDown(control, { button: 0 })
    await act(async () => vi.advanceTimersByTimeAsync(600))
    await act(async () => {
      fireEvent.pointerUp(control)
      fireEvent.click(control)
    })
    expect(checked(control)).toBe("true")
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("hold: a click with no press arms the fallback, and the next confirms", async () => {
    const { control, onConfirm } = renderSwitch({ gesture: "hold" })
    await click(control)
    expect(control.getAttribute("data-state")).toBe("armed")
    expect(live()).toBe("Activate again to turn off")
    await click(control)
    expect(checked(control)).toBe("false")
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('hold: holdFallback="none" ignores a click with no press', async () => {
    const { control } = renderSwitch({ gesture: "hold", holdFallback: "none" })
    await click(control)
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(checked(control)).toBe("true")
  })

  it("hold: Space held through the fill turns it off", async () => {
    const { control } = renderSwitch({ gesture: "hold" })
    control.focus()
    fireEvent.keyDown(control, { key: " " })
    await act(async () => vi.advanceTimersByTimeAsync(1200))
    await act(async () => fireEvent.keyUp(control, { key: " " }))
    expect(checked(control)).toBe("false")
    expect(document.activeElement).toBe(control)
  })

  it("hold: describes the gesture only in the risky direction", async () => {
    const { control } = renderSwitch({
      gesture: "hold",
      "aria-describedby": "extra",
    })
    const [hint, extra] = control.getAttribute("aria-describedby")!.split(" ")
    expect(document.getElementById(hint)?.textContent).toBe(
      "Press and hold, or activate twice, to turn off"
    )
    expect(extra).toBe("extra")
    await click(control)
    await click(control)
    expect(checked(control)).toBe("false")
    expect(control.getAttribute("aria-describedby")).toBe("extra")
    await click(control)
    expect(checked(control)).toBe("true")
  })

  it("popover: asks in a popover and turns off on confirm", async () => {
    const { control, onConfirm } = renderSwitch({
      gesture: "popover",
      description: "Sign-ins will only need a password.",
    })
    await click(control)
    const popup = await screen.findByRole("dialog", {
      name: "Sign-ins will only need a password.",
    })
    expect(checked(control)).toBe("true")
    await click(screen.getByRole("button", { name: "Turn off" }))
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(false)
    expect(checked(control)).toBe("false")
    await waitFor(() => expect(popup.isConnected).toBe(false))
    await click(control)
    expect(checked(control)).toBe("true")
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("popover: Cancel leaves the value and calls onCancel", async () => {
    const { control, onConfirm, onCancel } = renderSwitch({
      gesture: "popover",
      title: "Turn off two-factor?",
      description: "Sign-ins will only need a password.",
      cancelLabel: "Keep it on",
    })
    await click(control)
    await screen.findByRole("dialog", { name: "Turn off two-factor?" })
    await click(screen.getByRole("button", { name: "Keep it on" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(checked(control)).toBe("true")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("dialog: asks in an alert dialog and turns off on confirm", async () => {
    const { control, onConfirm } = renderSwitch({
      gesture: "dialog",
      title: "Turn off two-factor authentication?",
      description: "Sign-ins will only need a password.",
      confirmLabel: "Turn off 2FA",
      variant: "destructive",
    })
    control.focus()
    await click(control)
    await screen.findByRole("alertdialog", {
      name: "Turn off two-factor authentication?",
    })
    expect(checked(control)).toBe("true")
    await click(screen.getByRole("button", { name: "Turn off 2FA" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(false)
    expect(checked(control)).toBe("false")
    await waitFor(() => expect(document.activeElement).toBe(control))
  })

  it("dialog: Cancel leaves the value and calls onCancel", async () => {
    const { control, onConfirm, onCancel } = renderSwitch({
      gesture: "dialog",
      title: "Turn off two-factor authentication?",
    })
    await click(control)
    await click(await screen.findByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(checked(control)).toBe("true")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("pending: shows the new value, announces it, and ignores clicks until it saves", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const { control, onCheckedChange } = renderSwitch({ onConfirm })
    control.focus()
    await click(control)
    await click(control)
    expect(checked(control)).toBe("false")
    expect(control.getAttribute("data-state")).toBe("pending")
    expect(control.getAttribute("aria-busy")).toBe("true")
    expect(control.getAttribute("aria-disabled")).toBe("true")
    expect(live()).toBe("Turning off")
    expect(document.activeElement).toBe(control)
    expect(onCheckedChange).not.toHaveBeenCalled()
    await click(control)
    await click(control)
    expect(onConfirm).toHaveBeenCalledOnce()
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    expect(control.getAttribute("data-state")).toBe("idle")
    expect(checked(control)).toBe("false")
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false)
  })

  it("pending: a safe-direction save is pending too", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((res) => (resolve = res)))
    const { control } = renderSwitch({ defaultChecked: false, onConfirm })
    await click(control)
    expect(checked(control)).toBe("true")
    expect(live()).toBe("Turning on")
    await act(async () => {
      resolve()
      await Promise.resolve()
    })
    expect(checked(control)).toBe("true")
    expect(control.getAttribute("data-state")).toBe("idle")
  })

  it("reject: reverts to the old value and passes the error on", async () => {
    await catchRejection(async (seen) => {
      let reject!: (error: Error) => void
      const onConfirm = vi.fn(
        () => new Promise<void>((_, rej) => (reject = rej))
      )
      const { control, onCheckedChange } = renderSwitch({ onConfirm })
      await click(control)
      await click(control)
      expect(checked(control)).toBe("false")
      await act(async () => {
        reject(new Error("offline"))
        await new Promise((res) => setTimeout(res, 0))
      })
      expect(checked(control)).toBe("true")
      expect(control.getAttribute("data-state")).toBe("idle")
      expect(onCheckedChange).not.toHaveBeenCalled()
      await waitFor(() => expect(seen()).toHaveProperty("message", "offline"))
    })
  })

  it("reject: a popover stays open and the switch reverts", async () => {
    await catchRejection(async (seen) => {
      let reject!: (error: Error) => void
      const onConfirm = vi.fn(
        () => new Promise<void>((_, rej) => (reject = rej))
      )
      const { control } = renderSwitch({
        gesture: "popover",
        description: "Sign-ins will only need a password.",
        onConfirm,
      })
      await click(control)
      await click(await screen.findByRole("button", { name: "Turn off" }))
      expect(checked(control)).toBe("false")
      expect(control.getAttribute("data-state")).toBe("pending")
      await act(async () => {
        reject(new Error("offline"))
        await new Promise((res) => setTimeout(res, 0))
      })
      expect(checked(control)).toBe("true")
      expect(screen.getByRole("dialog")).toBeTruthy()
      await waitFor(() => expect(seen()).toHaveProperty("message", "offline"))
    })
  })

  it("controlled: follows checked and reports changes through onCheckedChange", async () => {
    const onConfirm = vi.fn()

    function Controlled() {
      const [on, setOn] = React.useState(true)
      return (
        <>
          <ConfirmSwitch
            aria-label="Two-factor authentication"
            checked={on}
            onCheckedChange={setOn}
            onConfirm={onConfirm}
          />
          <button onClick={() => setOn((value) => !value)}>Flip</button>
        </>
      )
    }

    render(<Controlled />)
    const control = screen.getByRole("switch")
    await click(control)
    await click(control)
    expect(checked(control)).toBe("false")
    await click(control)
    expect(checked(control)).toBe("true")
    await click(screen.getByRole("button", { name: "Flip" }))
    expect(checked(control)).toBe("false")
    expect(onConfirm.mock.calls).toEqual([[false], [true]])
  })

  it("controlled: stays put when the parent keeps its value", async () => {
    const onCheckedChange = vi.fn()
    render(
      <ConfirmSwitch
        aria-label="Two-factor authentication"
        checked
        onCheckedChange={onCheckedChange}
        onConfirm={() => {}}
      />
    )
    const control = screen.getByRole("switch")
    await click(control)
    await click(control)
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false)
    expect(checked(control)).toBe("true")
  })

  it("a disabled switch does nothing", async () => {
    const { control, onConfirm } = renderSwitch({ disabled: true })
    await click(control)
    await click(control)
    expect(checked(control)).toBe("true")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("readOnly ignores clicks", async () => {
    const { control, onConfirm } = renderSwitch({
      readOnly: true,
      defaultChecked: false,
    })
    await click(control)
    expect(checked(control)).toBe("false")
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("consumer handlers still run", async () => {
    const onClick = vi.fn()
    const onBlur = vi.fn()
    const { control } = renderSwitch({ onClick, onBlur })
    await click(control)
    await act(async () => fireEvent.blur(control))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it("announcements: the armed string can be replaced", async () => {
    const { control } = renderSwitch({
      announcements: { armed: "Otra vez para desactivar" },
    })
    await click(control)
    expect(live()).toBe("Otra vez para desactivar")
  })

  it("announcements: hold strings can be replaced", async () => {
    const { control } = renderSwitch({
      gesture: "hold",
      announcements: {
        hold: "Mantén pulsado",
        fallback: "Otra vez",
        ready: "Suelta",
        pending: "Guardando",
      },
      onConfirm: () => new Promise(() => {}),
    })
    const hint = control.getAttribute("aria-describedby")!
    expect(document.getElementById(hint)?.textContent).toBe("Mantén pulsado")
    await click(control)
    expect(live()).toBe("Otra vez")
    await click(control)
    expect(live()).toBe("Guardando")
  })

  it("submits its value with a form", async () => {
    render(
      <form aria-label="settings">
        <ConfirmSwitch
          aria-label="Two-factor authentication"
          name="twoFactor"
          defaultChecked
          onConfirm={() => {}}
        />
      </form>
    )
    const form = screen.getByRole("form") as HTMLFormElement
    expect(new FormData(form).get("twoFactor")).toBe("on")
    const control = screen.getByRole("switch")
    await click(control)
    await click(control)
    expect(new FormData(form).get("twoFactor")).toBeNull()
  })
})
