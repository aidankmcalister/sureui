import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { Toaster } from "sonner"
import { afterEach, describe, expect, it } from "vitest"

import { Sure, sure } from "@/components/ui/sure"

afterEach(cleanup)

function open<T>(call: () => Promise<T>) {
  let promise!: Promise<T>
  act(() => {
    promise = call()
  })
  return promise
}

describe("sure", () => {
  it("throws without a mount", () => {
    expect(() => sure.confirm({ title: "Delete?" })).toThrow(
      "Add <Sure /> to your root layout."
    )
  })

  it("resolves true on confirm", async () => {
    render(<Sure />)
    const result = open(() => sure.confirm({ title: "Delete?" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    await expect(result).resolves.toBe(true)
  })

  it("resolves false on cancel", async () => {
    render(<Sure />)
    const result = open(() => sure.confirm({ title: "Delete?" }))
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    await expect(result).resolves.toBe(false)
  })

  it("resolves false on escape", async () => {
    render(<Sure />)
    const result = open(() => sure.confirm({ title: "Delete?" }))
    await screen.findByRole("alertdialog")
    fireEvent.keyDown(document.activeElement!, { key: "Escape" })
    await expect(result).resolves.toBe(false)
  })

  it("resolves false when aborted", async () => {
    render(<Sure />)
    const controller = new AbortController()
    const result = open(() =>
      sure.confirm({ title: "Delete?", signal: controller.signal })
    )
    act(() => controller.abort())
    await expect(result).resolves.toBe(false)
  })

  it("resolves null when the mount unmounts", async () => {
    const { unmount } = render(<Sure />)
    const result = open(() => sure.prompt({ title: "Rename" }))
    unmount()
    await expect(result).resolves.toBe(null)
  })

  it("resolves the typed value on prompt", async () => {
    render(<Sure />)
    const result = open(() =>
      sure.prompt({ title: "Rename", defaultValue: "Design" })
    )
    fireEvent.change(await screen.findByRole("textbox"), {
      target: { value: "Product" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await expect(result).resolves.toBe("Product")
  })

  it("only confirms type when the phrase matches", async () => {
    render(<Sure />)
    const result = open(() =>
      sure.type({ title: "Delete acme?", phrase: "acme" })
    )
    const confirm = await screen.findByRole("button", { name: "Confirm" })
    expect(confirm).toHaveProperty("disabled", true)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "acme" },
    })
    fireEvent.click(confirm)
    await expect(result).resolves.toBe(true)
  })

  it("resolves false when undo is clicked", async () => {
    render(<Toaster />)
    const result = open(() => sure.undo("Deleted 3 files"))
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }))
    await expect(result).resolves.toBe(false)
  })

  it("focuses cancel on open and returns focus to the trigger", async () => {
    render(
      <>
        <button>Leave</button>
        <Sure />
      </>
    )
    const trigger = screen.getByRole("button", { name: "Leave" })
    trigger.focus()
    const result = open(() => sure.confirm({ title: "Leave?" }))
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(document.activeElement).toBe(cancel))
    fireEvent.click(cancel)
    await expect(result).resolves.toBe(false)
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("focuses the input on prompt", async () => {
    render(<Sure />)
    open(() => sure.prompt({ title: "Rename" }))
    const input = await screen.findByRole("textbox")
    await waitFor(() => expect(document.activeElement).toBe(input))
  })
})
