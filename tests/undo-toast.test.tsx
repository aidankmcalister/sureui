import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Toaster } from "sonner"
import { afterEach, describe, expect, it } from "vitest"

import { undoToast } from "@/components/ui/sureui/undo-toast"

afterEach(cleanup)

describe("undoToast", () => {
  it("resolves false when undo is clicked", async () => {
    render(<Toaster />)
    let result!: Promise<boolean>
    act(() => {
      result = undoToast("Deleted 3 files")
    })
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }))
    await expect(result).resolves.toBe(false)
  })
})
