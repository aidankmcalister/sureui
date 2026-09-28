import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ApiKeys } from "@/components/blocks/api-keys-01/api-keys"
import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"
import { DeleteAccount } from "@/components/blocks/delete-account-01/delete-account"
import { TeamMembers } from "@/components/blocks/team-members-01/team-members"
import { blockDemoNames } from "@/components/site/blocks/demos"
import { blocks } from "@/lib/site/blocks"

const settled = { timeout: 2000 }

function useHoldTimers() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "performance"],
    shouldAdvanceTime: true,
  })
}

describe("blocks", () => {
  it("has a preview for every block", () => {
    expect([...blockDemoNames].sort()).toEqual(
      blocks.map((block) => block.name).sort()
    )
  })
})

describe("danger-zone-01", () => {
  it("pauses after the undo window and offers resume", async () => {
    useHoldTimers()
    render(<DangerZone />)
    fireEvent.click(screen.getByRole("button", { name: "Pause" }))
    await act(async () => vi.advanceTimersByTime(6000))
    await waitFor(
      () => expect(screen.getByRole("button", { name: "Resume" })),
      settled
    )
    expect(screen.getByText("Paused")).toBeTruthy()
  })

  it("deletes only after the project name is typed", async () => {
    render(<DangerZone project="acme-prod" />)
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const confirm = await screen.findByRole("button", {
      name: "Delete project",
    })
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "acme-prod" },
    })
    fireEvent.click(screen.getByRole("checkbox"))
    await waitFor(() => expect(confirm.hasAttribute("disabled")).toBe(false))
    fireEvent.click(confirm)
    await screen.findByText("acme-prod was deleted", undefined, settled)
  })
})

describe("api-keys-01", () => {
  it("shows a new secret once and adds the key to the table", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    render(<ApiKeys />)
    fireEvent.click(screen.getByRole("button", { name: "Create key" }))
    const name = await screen.findByRole("textbox", { name: "Name" })
    fireEvent.change(name, { target: { value: "Deploy bot" } })
    fireEvent.submit(name.closest("form")!)
    const secret = await screen.findByRole(
      "textbox",
      { name: "Secret key" },
      settled
    )
    const value = (secret as HTMLInputElement).value
    expect(value).toMatch(/^sk_live_[A-Za-z0-9]{32}$/)
    expect(screen.getByText(/won't see this secret again/)).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Copy secret key" }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(value))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.queryByDisplayValue(value)).toBeNull()
    expect(screen.getByText("Deploy bot")).toBeTruthy()
    expect(screen.getByText(`sk_live_••••${value.slice(-4)}`)).toBeTruthy()
  })

  it("revokes a key only after a full hold", async () => {
    useHoldTimers()
    render(<ApiKeys />)
    const button = screen.getByRole("button", {
      name: "Hold to revoke Staging",
    })
    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(500))
    await act(async () => fireEvent.pointerUp(button))
    expect(screen.queryByText("Revoked")).toBeNull()

    fireEvent.pointerDown(button, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(button))
    await act(async () => vi.advanceTimersByTime(600))
    await waitFor(() => expect(screen.getByText("Revoked")), settled)
    expect(
      screen.queryByRole("button", { name: "Hold to revoke Staging" })
    ).toBeNull()
  })
})

describe("delete-account-01", () => {
  it("lists what goes and offers an export before the form", () => {
    render(<DeleteAccount email="ada@example.com" />)
    const exportButton = screen.getByRole("button", { name: "Export data" })
    const deleteButton = screen.getByRole("button", { name: "Delete account" })
    expect(
      exportButton.compareDocumentPosition(deleteButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    const list = screen.getByRole("list", { name: "What gets deleted" })
    expect(
      list.compareDocumentPosition(screen.getByRole("textbox")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    for (const item of [
      "12 projects",
      "38 invoices",
      "Membership in 3 teams",
    ]) {
      expect(screen.getByText(item)).toBeTruthy()
    }
  })

  it("unlocks only after the email and every acknowledgement", async () => {
    render(<DeleteAccount email="ada@example.com" />)
    const confirm = screen.getByRole("button", { name: "Delete account" })
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: " Ada@Example.com " },
    })
    const [first, second] = screen.getAllByRole("checkbox")
    fireEvent.click(first)
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.click(second)
    await waitFor(() => expect(confirm.hasAttribute("disabled")).toBe(false))
    fireEvent.click(confirm)
    await screen.findByText("Your account was deleted", undefined, settled)
  })

  it("starts an export without touching the account", async () => {
    render(<DeleteAccount email="ada@example.com" />)
    fireEvent.click(screen.getByRole("button", { name: "Export data" }))
    await screen.findByRole("button", { name: "Export requested" }, settled)
    expect(screen.getByRole("button", { name: "Delete account" })).toBeTruthy()
  })
})

describe("team-members-01", () => {
  it("removes someone only after a second click in their row menu", async () => {
    render(<TeamMembers />)
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Ava Diaz" })
    )
    const item = await screen.findByRole("menuitem", {
      name: "Remove from team",
    })
    await act(async () => fireEvent.click(item))
    expect(screen.getByText("ava@acme.com")).toBeTruthy()
    const armed = screen.getByRole("menuitem", {
      name: "Click again to remove",
    })
    await act(async () => fireEvent.click(armed))
    await waitFor(
      () => expect(screen.queryByText("ava@acme.com")).toBeNull(),
      settled
    )
    expect(screen.getByText("4 people have access to Acme.")).toBeTruthy()
  })

  it("transfers ownership only from the dialog", async () => {
    render(<TeamMembers />)
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Leo Park" })
    )
    fireEvent.click(await screen.findByRole("menuitem", { name: "Make owner" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(
      within(dialog).getByText("Make Leo Park the owner of Acme?")
    ).toBeTruthy()
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Transfer ownership" })
    )
    await waitFor(
      () => expect(screen.queryByRole("alertdialog")).toBeNull(),
      settled
    )
    const rows = screen.getAllByRole("listitem")
    expect(within(rows[0]).getAllByText("Admin").length).toBeGreaterThan(0)
    expect(within(rows[1]).getAllByText("Owner").length).toBeGreaterThan(0)
    expect(
      screen.queryByRole("button", { name: "Actions for Leo Park" })
    ).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Actions for Sam Lee" }))
    await screen.findByRole("menuitem", { name: "Remove from team" })
    expect(screen.queryByRole("menuitem", { name: "Make owner" })).toBeNull()
  })
})
