import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { toast, Toaster } from "sonner"
import { describe, expect, it, vi } from "vitest"

import { AgentApproval } from "@/components/blocks/agent-approval-01/agent-approval"
import { ApiKeys } from "@/components/blocks/api-keys-01/api-keys"
import { BulkActions } from "@/components/blocks/bulk-actions-01/bulk-actions"
import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"
import { DeleteAccount } from "@/components/blocks/delete-account-01/delete-account"
import { FileManager } from "@/components/blocks/file-manager-01/file-manager"
import { Inbox } from "@/components/blocks/inbox-01/inbox"
import { Reauth } from "@/components/blocks/reauth-01/reauth"
import { ScheduledDeletion } from "@/components/blocks/scheduled-deletion-01/scheduled-deletion"
import { TeamMembers } from "@/components/blocks/team-members-01/team-members"
import { blockPreviewNames } from "@/components/site/blocks/previews"
import registry from "@/registry.json"

const settled = { timeout: 2000 }

function useHoldTimers() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "performance"],
    shouldAdvanceTime: true,
  })
}

describe("blocks", () => {
  it("has a preview for every registry block", () => {
    expect([...blockPreviewNames].sort()).toEqual(
      registry.items
        .filter((item) => item.type === "registry:block")
        .map((item) => item.name)
        .sort()
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
    expect(
      screen.getByText("Paused. New pushes wait until you resume.")
    ).toBeTruthy()
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
    expect(
      screen.getByText(/won't see the secret for Deploy bot again/)
    ).toBeTruthy()
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
    for (const item of ["Projects", "Invoices", "Team memberships"]) {
      expect(within(list).getByText(item)).toBeTruthy()
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
      name: "Remove Ava?",
    })
    await act(async () => fireEvent.click(armed))
    await waitFor(
      () => expect(screen.queryByText("ava@acme.com")).toBeNull(),
      settled
    )
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
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

describe("file-manager-01", () => {
  function names(list: string) {
    return within(screen.getByRole("list", { name: list }))
      .getAllByRole("listitem")
      .map((item) => item.textContent)
  }

  it("moves files to trash with an undo toast", async () => {
    render(
      <>
        <FileManager />
        <Toaster />
      </>
    )
    fireEvent.click(screen.getByRole("checkbox", { name: /q3-report\.pdf/ }))
    fireEvent.click(screen.getByRole("checkbox", { name: /meeting-notes\.md/ }))
    fireEvent.click(screen.getByRole("button", { name: "Move to trash" }))
    await screen.findByText("Moved 2 files to trash")
    expect(names("Files").join()).not.toMatch(/q3-report|meeting-notes/)
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() =>
      expect(names("Files").join()).toMatch(/q3-report.*meeting-notes/)
    )
    act(() => {
      toast.dismiss()
    })
  })

  it("restores from the Trash tab after the toast is gone", async () => {
    render(
      <>
        <FileManager />
        <Toaster />
      </>
    )
    fireEvent.click(screen.getByRole("checkbox", { name: /q3-report\.pdf/ }))
    fireEvent.click(screen.getByRole("button", { name: "Move to trash" }))
    await screen.findByText("Moved q3-report.pdf to trash")
    act(() => {
      toast.dismiss()
    })
    fireEvent.click(screen.getByRole("tab", { name: /Trash/ }))
    await waitFor(() => expect(names("Trash").join()).toMatch(/q3-report/))
    fireEvent.click(
      screen.getByRole("button", { name: "Restore q3-report.pdf" })
    )
    fireEvent.click(screen.getByRole("tab", { name: "Files" }))
    await waitFor(() => expect(names("Files").join()).toMatch(/q3-report/))
  })

  it("empties the trash only after the phrase is typed", async () => {
    render(<FileManager />)
    fireEvent.click(screen.getByRole("tab", { name: /Trash/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Empty trash" }))
    const dialog = await screen.findByRole("alertdialog")
    const list = within(dialog).getByRole("list", {
      name: "What gets deleted",
    })
    expect(within(list).getByText("old-logo.svg")).toBeTruthy()
    const confirm = within(dialog).getByRole("button", { name: "Empty trash" })
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "empty trash" },
    })
    await waitFor(() => expect(confirm.hasAttribute("disabled")).toBe(false))
    fireEvent.click(confirm)
    await screen.findByText("Trash is empty", undefined, settled)
  })
})

describe("inbox-01", () => {
  it("collapses a row in place with Undo, then removes it", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
    render(<Inbox />)
    fireEvent.click(
      screen.getByRole("button", { name: "Archive Launch checklist" })
    )
    expect(screen.getByText("Archived: Launch checklist")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(
      screen.getByRole("button", { name: "Archive Launch checklist" })
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Offsite venue options" })
    )
    expect(screen.getByText("Deleted: Offsite venue options")).toBeTruthy()
    await act(async () => vi.advanceTimersByTime(5000))
    expect(screen.queryByText("Deleted: Offsite venue options")).toBeNull()
    expect(screen.queryByText("Offsite venue options")).toBeNull()
  })

  it("archives the open message on a second click and deletes on a hold", async () => {
    useHoldTimers()
    render(<Inbox />)
    const reader = screen.getByRole("region", { name: "Message" })
    expect(within(reader).getByText("Launch checklist")).toBeTruthy()
    const archive = within(reader).getByRole("button", { name: "Archive" })
    await act(async () => fireEvent.click(archive))
    expect(archive.getAttribute("data-state")).toBe("armed")
    await act(async () => fireEvent.click(archive))
    await act(async () => vi.advanceTimersByTime(600))
    await waitFor(
      () => expect(within(reader).getByText("Re: Q3 numbers")),
      settled
    )
    expect(screen.queryByText("Launch checklist")).toBeNull()

    const remove = within(reader).getByRole("button", {
      name: "Hold to delete",
    })
    fireEvent.pointerDown(remove, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(remove))
    await act(async () => vi.advanceTimersByTime(600))
    await waitFor(
      () => expect(within(reader).getByText("Design review moved to Friday")),
      settled
    )
    expect(screen.queryByText("Re: Q3 numbers")).toBeNull()
  })
})

describe("agent-approval-01", () => {
  it("approves a call, runs it and shows its result", async () => {
    render(<AgentApproval />)
    const approve = within(
      screen
        .getByText("Archive 12 branches merged more than 30 days ago")
        .closest("li")!
    ).getByRole("button", { name: "Approve" })
    await act(async () => fireEvent.click(approve))
    await act(async () => fireEvent.click(approve))
    expect(await screen.findByText("Archived 12 branches")).toBeTruthy()
  })

  it("denies a call in one click", async () => {
    render(<AgentApproval />)
    const call = screen
      .getByText("Rotate the staging database password")
      .closest("li")!
    await act(async () =>
      fireEvent.click(within(call).getByRole("button", { name: "Deny" }))
    )
    expect(within(call).getByText("Denied")).toBeTruthy()
  })
})

describe("bulk-actions-01", () => {
  function titles() {
    return within(screen.getByRole("list", { name: "Issues" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent)
      .join()
  }

  it("hides a small batch during the undo window and Undo brings it back selected", async () => {
    useHoldTimers()
    render(<BulkActions />)
    fireEvent.click(screen.getByRole("checkbox", { name: /Login form/ }))
    fireEvent.click(screen.getByRole("checkbox", { name: /webhook/ }))
    const remove = screen.getByRole("button", { name: "Delete 2 issues" })
    await act(async () => fireEvent.click(remove))
    expect(titles()).not.toMatch(/Login form|webhook/)
    expect(screen.getByText("Deleted 2 issues")).toBeTruthy()

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    )
    expect(titles()).toMatch(/Login form.*webhook/)
    expect(
      screen
        .getByRole("checkbox", { name: /Login form/ })
        .getAttribute("aria-checked")
    ).toBe("true")
    expect(screen.getByText("2 selected")).toBeTruthy()

    await act(async () => fireEvent.click(remove))
    await act(async () => vi.advanceTimersByTime(6000))
    await waitFor(() => expect(screen.getByText("Select all")), settled)
    expect(titles()).not.toMatch(/Login form|webhook/)
  })

  it("deletes a few issues on a second click", async () => {
    render(<BulkActions />)
    for (const name of [/Login form/, /webhook/, /Dark mode/])
      fireEvent.click(screen.getByRole("checkbox", { name }))
    const remove = screen.getByRole("button", { name: "Delete 3 issues" })
    await act(async () => fireEvent.click(remove))
    expect(remove.getAttribute("data-state")).toBe("armed")
    expect(titles()).toMatch(/Login form/)
    await act(async () => fireEvent.click(remove))
    await waitFor(
      () => expect(titles()).not.toMatch(/Login form|webhook|Dark mode/),
      settled
    )
  })

  it("asks for the count before deleting every issue", async () => {
    render(<BulkActions />)
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }))
    expect(screen.getByText("8 selected")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Delete 8 issues" }))
    const dialog = await screen.findByRole("alertdialog")
    const confirm = within(dialog).getByRole("button", {
      name: "Delete 8 issues",
    })
    expect(confirm.hasAttribute("disabled")).toBe(true)
    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "8" },
    })
    await waitFor(() => expect(confirm.hasAttribute("disabled")).toBe(false))
    fireEvent.click(confirm)
    await screen.findByText("No open issues", undefined, settled)
  })
})

describe("scheduled-deletion-01", () => {
  function trashed() {
    return within(screen.getByRole("list", { name: "Trash" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent)
      .join()
  }

  it("schedules deletion 30 days out and keeps the workspace on Keep", async () => {
    render(<ScheduledDeletion />)
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText(/deleted for good on Jun 11/)).toBeTruthy()
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Schedule deletion" })
    )
    await screen.findByText(
      "Scheduled for deletion on Jun 11",
      undefined,
      settled
    )
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Keep" }))
    await screen.findByRole("button", { name: "Delete" }, settled)
    expect(screen.queryByText(/Scheduled for deletion/)).toBeNull()
    expect(screen.getByText("Acme won't be deleted.")).toBeTruthy()
  })

  it("shows when each project in the trash is deleted", () => {
    render(<ScheduledDeletion />)
    expect(trashed()).toMatch(
      /marketing-siteDeletes on Jun 8.*legacy-apiDeletes on May 30.*hackweek-demoDeletes on May 15/
    )
  })

  it("restores a project and deletes another forever on a full hold", async () => {
    useHoldTimers()
    render(<ScheduledDeletion />)
    await act(async () =>
      fireEvent.click(
        screen.getByRole("button", { name: "Restore marketing-site" })
      )
    )
    await waitFor(() => expect(trashed()).not.toMatch(/marketing-site/))
    expect(screen.getByText("Restored marketing-site.")).toBeTruthy()

    const hold = screen.getByRole("button", {
      name: "Hold to delete legacy-api forever",
    })
    fireEvent.pointerDown(hold, { button: 0 })
    await act(async () => vi.advanceTimersByTime(500))
    await act(async () => fireEvent.pointerUp(hold))
    expect(trashed()).toMatch(/legacy-api/)

    fireEvent.pointerDown(hold, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    await act(async () => fireEvent.pointerUp(hold))
    await waitFor(() => expect(trashed()).not.toMatch(/legacy-api/), settled)
    expect(screen.getByText("Deleted legacy-api forever.")).toBeTruthy()
  })
})

describe("reauth-01", () => {
  async function submitCode(code: string) {
    const dialog = await screen.findByRole("dialog")
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Code" }), {
      target: { value: code },
    })
    await act(async () =>
      fireEvent.click(within(dialog).getByRole("button", { name: "Verify" }))
    )
    return dialog
  }

  it("asks for a code, shows an error on a wrong one, then saves", async () => {
    render(<Reauth />)
    fireEvent.change(screen.getByRole("textbox", { name: "Billing email" }), {
      target: { value: "finance@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    const dialog = await submitCode("000000")
    expect(within(dialog).getByRole("alert").textContent).toBe(
      "That code didn't work. Try again."
    )
    expect(screen.getByText("Invoices go to billing@example.com.")).toBeTruthy()

    await submitCode("123456")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await screen.findByText("Invoices go to finance@example.com.")
  })

  it("cancels the action when the dialog is dismissed", async () => {
    render(<Reauth />)
    const remove = screen.getByRole("button", { name: "Remove" })
    await act(async () => fireEvent.click(remove))
    await act(async () => fireEvent.click(remove))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("This demo accepts 123456.")).toBeTruthy()
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(remove.getAttribute("data-state")).toBe("idle"))
    expect(screen.getByText("Card ending 4242")).toBeTruthy()
  })

  it("skips the code while verified and asks again once it expires", async () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "performance"],
      shouldAdvanceTime: true,
    })
    const verify = vi.fn(async (code: string) => code === "424242")
    render(<Reauth verify={verify} rememberFor={60 * 60 * 1000} />)
    const email = screen.getByRole("textbox", { name: "Billing email" })
    fireEvent.change(email, { target: { value: "finance@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    const dialog = await submitCode("424242")
    expect(within(dialog).queryByText(/demo/)).toBeNull()
    await screen.findByText("Invoices go to finance@example.com.")

    const remove = screen.getByRole("button", { name: "Remove" })
    await act(async () => fireEvent.click(remove))
    await act(async () => fireEvent.click(remove))
    await screen.findByText("No card on file", undefined, settled)
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(verify).toHaveBeenCalledTimes(1)

    await act(async () => vi.advanceTimersByTime(60 * 60 * 1000))
    fireEvent.change(email, { target: { value: "ap@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("dialog")).toBeTruthy()
  })
})
