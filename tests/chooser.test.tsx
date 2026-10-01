import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Chooser } from "@/components/site/docs/chooser"

async function pick(question: string, option: string) {
  fireEvent.click(screen.getByRole("combobox", { name: question }))
  const item = await screen.findByRole(
    "option",
    { name: option },
    { timeout: 2000 }
  )
  await act(async () => {
    fireEvent.pointerDown(item, { button: 0, pointerType: "mouse" })
    fireEvent.pointerUp(item, { button: 0, pointerType: "mouse" })
    fireEvent.click(item)
  })
}

describe("Chooser", () => {
  it("starts with an answer, its demo and its highlighted code", () => {
    const { container } = render(<Chooser />)
    expect(
      screen.getByRole("link", { name: "ConfirmButton" }).getAttribute("href")
    ).toBe("/docs/confirm-button#click-again")
    expect(screen.getByRole("button", { name: "Delete branch" })).toBeTruthy()
    expect(container.querySelector('[data-token="sureui"]')?.textContent).toBe(
      "ConfirmButton"
    )
  })

  it("asks only what matters for the place, and updates the answer", async () => {
    render(<Chooser />)
    expect(
      screen.getByRole("combobox", { name: "How many things?" })
    ).toBeTruthy()
    await pick("Where does it happen?", "an AI tool call")
    expect(
      screen.queryByRole("combobox", { name: "How many things?" })
    ).toBeNull()
    expect(
      screen.getByRole("link", { name: "ToolApproval" }).getAttribute("href")
    ).toBe("/docs/tool-approval#medium-risk")
    await pick("Can it be undone?", "can't be undone")
    expect(
      screen.getByRole("link", { name: "ToolApproval" }).getAttribute("href")
    ).toBe("/docs/tool-approval#critical-risk")
  })

  it("shows a row answer inside rows of a list", async () => {
    render(<Chooser />)
    await pick("Where does it happen?", "a row in a list")
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(
      screen.getAllByRole("button", { name: "Delete branch" })
    ).toHaveLength(2)
    await pick("Can it be undone?", "can't be undone")
    expect(
      screen.getAllByRole("button", { name: "Delete project" })
    ).toHaveLength(2)
  })
})
