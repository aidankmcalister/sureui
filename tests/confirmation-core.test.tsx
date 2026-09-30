import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Preview } from "@/components/site/docs/preview"
import HoldCard from "@/components/site/docs/examples/confirmation-core/hold-card"
import IconButton from "@/components/site/docs/examples/confirmation-core/icon-button"
import Shortcut from "@/components/site/docs/examples/confirmation-core/shortcut"
import { click } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

function show(example: React.ReactNode) {
  render(
    <Preview name="confirmation-core" code={null} log>
      {example}
    </Preview>
  )
}

const ran = () => screen.getByRole("log").textContent

describe("confirmation core examples", () => {
  it("a card confirms after a hold", async () => {
    show(<HoldCard />)
    const card = screen.getByRole("button", { name: /acme-prod/ })
    fireEvent.pointerDown(card, { button: 0 })
    expect(card.textContent).toContain("Keep holding")
    await act(async () => vi.advanceTimersByTime(1300))
    expect(ran()).toContain("archiveProject()")
  })

  it("an icon button asks for a second click", async () => {
    show(<IconButton />)
    await click(screen.getByRole("button", { name: "Delete row" }))
    const armed = screen.getByRole("button", { name: "Click again to delete" })
    expect(ran()).not.toContain("deleteRow")
    await click(armed)
    expect(ran()).toContain("deleteRow()")
  })

  it("a shortcut pressed twice deletes, and typing is left alone", async () => {
    show(
      <>
        <input aria-label="Title" />
        <Shortcut />
      </>
    )
    const input = screen.getByRole("textbox", { name: "Title" })
    await act(async () => fireEvent.keyDown(input, { key: "Backspace" }))
    expect(screen.getByRole("button", { name: /Delete issue/ })).toBeTruthy()
    await act(async () =>
      fireEvent.keyDown(document.body, { key: "Backspace" })
    )
    expect(screen.getByRole("button", { name: /again to delete/ })).toBeTruthy()
    await act(async () =>
      fireEvent.keyDown(document.body, { key: "Backspace" })
    )
    expect(ran()).toContain("deleteIssue()")
  })
})
