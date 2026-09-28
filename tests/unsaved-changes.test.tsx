import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  useUnsavedChanges,
  type UnsavedChangesOptions,
} from "@/components/ui/sureui/unsaved-changes"

type ConfirmLeave = ReturnType<typeof useUnsavedChanges>["confirmLeave"]

function Harness({
  onReady,
  ...options
}: UnsavedChangesOptions & { onReady: (confirmLeave: ConfirmLeave) => void }) {
  const { confirmLeave, dialog } = useUnsavedChanges(options)
  onReady(confirmLeave)
  return dialog
}

function setup(options: UnsavedChangesOptions) {
  let confirmLeave!: ConfirmLeave
  const onReady = (fn: ConfirmLeave) => (confirmLeave = fn)
  const view = render(<Harness {...options} onReady={onReady} />)
  return {
    view,
    rerender: (next: UnsavedChangesOptions) =>
      view.rerender(<Harness {...next} onReady={onReady} />),
    leave() {
      let result!: Promise<boolean>
      act(() => {
        result = confirmLeave()
      })
      return result
    },
  }
}

function unloadBlocked() {
  const event = new Event("beforeunload", { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe("useUnsavedChanges", () => {
  it("blocks unload only while there are changes", () => {
    const { rerender, view } = setup({ when: false })
    expect(unloadBlocked()).toBe(false)
    rerender({ when: true })
    expect(unloadBlocked()).toBe(true)
    rerender({ when: false })
    expect(unloadBlocked()).toBe(false)
    rerender({ when: true })
    view.unmount()
    expect(unloadBlocked()).toBe(false)
  })

  it("leaves unload alone with beforeUnload={false}", () => {
    setup({ when: true, beforeUnload: false })
    expect(unloadBlocked()).toBe(false)
  })

  it("resolves true without a dialog when there are no changes", async () => {
    const { leave } = setup({ when: false })
    await expect(leave()).resolves.toBe(true)
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("resolves false on Keep editing", async () => {
    const onDiscard = vi.fn()
    const { leave } = setup({ when: true, onDiscard })
    const result = leave()
    await screen.findByRole("alertdialog", {
      name: "Discard unsaved changes?",
    })
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }))
    await expect(result).resolves.toBe(false)
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it("resolves true and calls onDiscard on Discard changes", async () => {
    const onDiscard = vi.fn()
    const { leave } = setup({ when: true, onDiscard })
    const result = leave()
    fireEvent.click(
      await screen.findByRole("button", { name: "Discard changes" })
    )
    await expect(result).resolves.toBe(true)
    expect(onDiscard).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("asks once when called again while the dialog is open", async () => {
    const { leave } = setup({ when: true })
    const first = leave()
    const second = leave()
    expect(second).toBe(first)
    fireEvent.click(await screen.findByRole("button", { name: "Keep editing" }))
    await expect(first).resolves.toBe(false)
    const third = leave()
    expect(third).not.toBe(first)
    fireEvent.click(await screen.findByRole("button", { name: "Keep editing" }))
    await expect(third).resolves.toBe(false)
  })

  it("resolves false when it unmounts with the dialog open", async () => {
    const { leave, view } = setup({ when: true })
    const result = leave()
    await screen.findByRole("alertdialog")
    view.unmount()
    await expect(result).resolves.toBe(false)
  })

  it("uses the labels and description you pass", async () => {
    const { leave } = setup({
      when: true,
      title: "Leave without publishing?",
      description: "The draft stays on this device.",
      keepLabel: "Stay",
      discardLabel: "Leave",
    })
    const result = leave()
    const dialog = await screen.findByRole("alertdialog", {
      name: "Leave without publishing?",
    })
    expect(dialog.textContent).toContain("The draft stays on this device.")
    fireEvent.click(screen.getByRole("button", { name: "Leave" }))
    await expect(result).resolves.toBe(true)
  })

  describe("with onSave", () => {
    it("resolves true only after onSave settles", async () => {
      let finish!: () => void
      const onSave = vi.fn(() => new Promise<void>((res) => (finish = res)))
      const onDiscard = vi.fn()
      const { leave } = setup({ when: true, onSave, onDiscard })
      const result = leave()
      let settled: boolean | undefined
      result.then((value) => (settled = value))
      await screen.findByRole("alertdialog", {
        name: "Save changes before leaving?",
      })
      fireEvent.click(screen.getByRole("button", { name: "Save" }))
      await act(async () => {})
      expect(onSave).toHaveBeenCalledOnce()
      expect(settled).toBeUndefined()
      await act(async () => {
        finish()
        await Promise.resolve()
        await Promise.resolve()
      })
      await expect(result).resolves.toBe(true)
      expect(onDiscard).not.toHaveBeenCalled()
      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    })

    it("resolves false on Keep editing without saving", async () => {
      const onSave = vi.fn()
      const { leave } = setup({ when: true, onSave })
      const result = leave()
      fireEvent.click(
        await screen.findByRole("button", { name: "Keep editing" })
      )
      await expect(result).resolves.toBe(false)
      expect(onSave).not.toHaveBeenCalled()
    })

    it("asks again before discarding", async () => {
      const onSave = vi.fn()
      const onDiscard = vi.fn()
      const { leave } = setup({ when: true, onSave, onDiscard })
      const result = leave()
      fireEvent.click(
        await screen.findByRole("button", { name: "Discard changes" })
      )
      await screen.findByRole("alertdialog", {
        name: "Discard unsaved changes?",
      })
      expect(screen.queryByRole("button", { name: "Save" })).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Discard changes" }))
      await expect(result).resolves.toBe(true)
      expect(onSave).not.toHaveBeenCalled()
      expect(onDiscard).toHaveBeenCalledOnce()
    })

    it("keeps editing from the discard step", async () => {
      const onDiscard = vi.fn()
      const { leave } = setup({ when: true, onSave: vi.fn(), onDiscard })
      const result = leave()
      fireEvent.click(
        await screen.findByRole("button", { name: "Discard changes" })
      )
      await screen.findByRole("alertdialog", {
        name: "Discard unsaved changes?",
      })
      fireEvent.click(screen.getByRole("button", { name: "Keep editing" }))
      await expect(result).resolves.toBe(false)
      expect(onDiscard).not.toHaveBeenCalled()
    })
  })
})
