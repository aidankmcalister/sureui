import type { ChatAddToolApproveResponseFunction, ToolUIPart } from "ai"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest"

import {
  ToolApproval,
  ToolApprovalBatch,
  type ToolApprovalBatchProps,
  type ToolApprovalPart,
  type ToolApprovalProps,
} from "@/components/ui/sureui/tool-approval"
import { click } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

const requested = {
  state: "approval-requested",
  approval: { id: "approval_1" },
}

describe("ToolApproval", () => {
  it("accepts AI SDK tool parts and addToolApprovalResponse", () => {
    expectTypeOf<ToolUIPart>().toExtend<ToolApprovalPart>()
    expectTypeOf<ChatAddToolApproveResponseFunction>().toExtend<
      ToolApprovalProps["onRespond"]
    >()
  })

  it("renders nothing before approval is requested", () => {
    const { container } = render(
      <ToolApproval part={{ state: "input-available" }} onRespond={vi.fn()} />
    )
    expect(container.innerHTML).toBe("")
  })

  it("low: approves on a click after the undo window", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval risk="low" part={requested} onRespond={onRespond} />)
    await click(screen.getByRole("button", { name: "Approve" }))
    expect(onRespond).not.toHaveBeenCalled()
    expect(
      (screen.getByRole("button", { name: "Deny" }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
    await act(async () => vi.advanceTimersByTime(5000))
    expect(onRespond).toHaveBeenCalledWith({ id: "approval_1", approved: true })
  })

  it("low: undo sends nothing and frees Deny", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval risk="low" part={requested} onRespond={onRespond} />)
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    await click(approve)
    await act(async () => vi.advanceTimersByTime(6000))
    expect(onRespond).not.toHaveBeenCalled()
    expect(
      (screen.getByRole("button", { name: "Deny" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  })

  it("medium: approves on the second click", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval part={requested} onRespond={onRespond} />)
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    expect(onRespond).not.toHaveBeenCalled()
    await click(approve)
    expect(onRespond).toHaveBeenCalledWith({ id: "approval_1", approved: true })
  })

  it("high: approves only after a full hold", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval risk="high" part={requested} onRespond={onRespond} />)
    const approve = screen.getByRole("button", { name: /Hold to approve/ })
    fireEvent.pointerDown(approve, { button: 0 })
    await act(async () => vi.advanceTimersByTime(600))
    await act(async () => fireEvent.pointerUp(approve))
    expect(onRespond).not.toHaveBeenCalled()
    fireEvent.pointerDown(approve, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    expect(onRespond).toHaveBeenCalledWith({ id: "approval_1", approved: true })
  })

  it("critical: approves only after the phrase is typed", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApproval
        risk="critical"
        phrase="acme-prod"
        part={requested}
        onRespond={onRespond}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve" })
    expect((approve as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "acme-prod" },
    })
    await click(approve)
    expect(onRespond).toHaveBeenCalledWith({ id: "approval_1", approved: true })
  })

  it("denies on one click and responds only once", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval part={requested} onRespond={onRespond} />)
    const deny = screen.getByRole("button", { name: "Deny" })
    await click(deny)
    await click(deny)
    expect(onRespond).toHaveBeenCalledOnce()
    expect(onRespond).toHaveBeenCalledWith({
      id: "approval_1",
      approved: false,
    })
  })

  it("locks Deny while an approval is pending, and frees it if that fails", async () => {
    let fail = () => {}
    const onRespond = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          fail = () => reject(new Error("offline"))
        })
    )
    render(<ToolApproval risk="high" part={requested} onRespond={onRespond} />)
    const approve = screen.getByRole("button", { name: /Hold to approve/ })
    fireEvent.pointerDown(approve, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    const deny = screen.getByRole("button", { name: "Deny" })
    expect((deny as HTMLButtonElement).disabled).toBe(true)
    await click(deny)
    expect(onRespond).toHaveBeenCalledOnce()
    const rejection = vi.fn()
    process.once("unhandledRejection", rejection)
    await act(async () => fail())
    expect((deny as HTMLButtonElement).disabled).toBe(false)
    await click(deny)
    expect(onRespond).toHaveBeenLastCalledWith({
      id: "approval_1",
      approved: false,
    })
  })

  it("armDelay ignores an approve that lands right after it appears", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApproval
        risk="low"
        undo={false}
        armDelay={500}
        part={requested}
        onRespond={onRespond}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    expect(onRespond).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(500))
    await click(approve)
    expect(onRespond).toHaveBeenCalledWith({ id: "approval_1", approved: true })
  })

  it("critical: locks Approve while the response is being sent", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApproval
        risk="critical"
        phrase="acme-prod"
        part={requested}
        onRespond={onRespond}
      />
    )
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "acme-prod" } })
    await click(screen.getByRole("button", { name: "Approve" }))
    fireEvent.change(input, { target: { value: "acme-prod" } })
    const approve = screen.getByRole("button", { name: "Approve" })
    expect((approve as HTMLButtonElement).disabled).toBe(true)
    expect(
      (screen.getByRole("button", { name: "Deny" }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
    expect(onRespond).toHaveBeenCalledOnce()
  })

  it("onConfirmError takes a failed approval and shows errorLabel", async () => {
    const error = new Error("offline")
    const onRespond = vi.fn(() => Promise.reject(error))
    const onConfirmError = vi.fn()
    render(
      <ToolApproval
        part={requested}
        errorLabel="Retry"
        onRespond={onRespond}
        onConfirmError={onConfirmError}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    await click(approve)
    await act(async () => {})
    expect(onConfirmError).toHaveBeenCalledWith(error)
    expect(screen.getByRole("button", { name: "Retry" })).toBe(approve)
    expect(approve.hasAttribute("data-error")).toBe(true)
    expect(
      (screen.getByRole("button", { name: "Deny" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  })

  it("onConfirmError takes a failed denial", async () => {
    const error = new Error("offline")
    const onConfirmError = vi.fn()
    render(
      <ToolApproval
        part={requested}
        onRespond={() => Promise.reject(error)}
        onConfirmError={onConfirmError}
      />
    )
    const deny = screen.getByRole("button", { name: "Deny" })
    await click(deny)
    await act(async () => {})
    expect(onConfirmError).toHaveBeenCalledWith(error)
    expect((deny as HTMLButtonElement).disabled).toBe(false)
  })

  it("shows the outcome once answered", () => {
    const { rerender } = render(
      <ToolApproval
        part={{
          state: "approval-responded",
          approval: { id: "approval_1", approved: true },
        }}
        onRespond={vi.fn()}
      />
    )
    expect(screen.getByText("Approved")).toBeTruthy()
    rerender(
      <ToolApproval
        part={{
          state: "output-denied",
          approval: { id: "approval_1", approved: false, reason: "Not now" },
        }}
        onRespond={vi.fn()}
      />
    )
    expect(screen.getByText("Denied: Not now")).toBeTruthy()
  })
})

describe("ToolApproval scopes", () => {
  it("shows no scope choice by default", () => {
    render(<ToolApproval part={requested} onRespond={vi.fn()} />)
    expect(screen.queryByRole("radiogroup")).toBeNull()
  })

  it("sends the chosen scope with the response", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApproval
        part={requested}
        scopes={["once", "session", "always"]}
        onRespond={onRespond}
      />
    )
    expect(screen.getByRole("radiogroup", { name: "Remember" })).toBeTruthy()
    expect(
      screen.getByRole("radio", { name: "Once" }).getAttribute("aria-checked")
    ).toBe("true")
    await click(screen.getByRole("radio", { name: "This session" }))
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    await click(approve)
    expect(onRespond).toHaveBeenCalledWith({
      id: "approval_1",
      approved: true,
      scope: "session",
    })
  })

  it("sends the scope with a denial too, and takes custom labels", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApproval
        part={requested}
        scopes={["once", "always"]}
        scopeLabels={{ group: "Apply", always: "Every time" }}
        onRespond={onRespond}
      />
    )
    expect(screen.getByRole("radiogroup", { name: "Apply" })).toBeTruthy()
    await click(screen.getByRole("radio", { name: "Every time" }))
    await click(screen.getByRole("button", { name: "Deny" }))
    expect(onRespond).toHaveBeenCalledWith({
      id: "approval_1",
      approved: false,
      scope: "always",
    })
  })
})

describe("ToolApproval note", () => {
  it("shows no note field by default", () => {
    render(<ToolApproval part={requested} onRespond={vi.fn()} />)
    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it("sends the note as the reason with an approval", async () => {
    const onRespond = vi.fn()
    render(<ToolApproval part={requested} note onRespond={onRespond} />)
    await act(async () =>
      fireEvent.change(
        screen.getByRole("textbox", { name: "Add a note for the agent" }),
        { target: { value: "  Only the staging table  " } }
      )
    )
    const approve = screen.getByRole("button", { name: "Approve" })
    await click(approve)
    await click(approve)
    expect(onRespond).toHaveBeenCalledWith({
      id: "approval_1",
      approved: true,
      reason: "Only the staging table",
    })
  })

  it("sends the note with a denial, and leaves out an empty one", async () => {
    const onRespond = vi.fn()
    const { unmount } = render(
      <ToolApproval
        part={requested}
        note
        noteLabel="Why?"
        onRespond={onRespond}
      />
    )
    await click(screen.getByRole("button", { name: "Deny" }))
    expect(onRespond).toHaveBeenLastCalledWith({
      id: "approval_1",
      approved: false,
    })
    unmount()
    render(<ToolApproval part={requested} note onRespond={onRespond} />)
    await act(async () =>
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Use the archive tool" },
      })
    )
    await click(screen.getByRole("button", { name: "Deny" }))
    expect(onRespond).toHaveBeenLastCalledWith({
      id: "approval_1",
      approved: false,
      reason: "Use the archive tool",
    })
  })

  it("shows the note in the outcome for an approval too", () => {
    render(
      <ToolApproval
        part={{
          state: "approval-responded",
          approval: {
            id: "approval_1",
            approved: true,
            reason: "Only staging",
          },
        }}
        onRespond={vi.fn()}
      />
    )
    expect(screen.getByText("Approved: Only staging")).toBeTruthy()
  })

  it("sends one note with every call in a batch", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[
          { state: "approval-requested", approval: { id: "a" } },
          { state: "approval-requested", approval: { id: "b" } },
        ]}
        note
        onRespond={onRespond}
      />
    )
    await act(async () =>
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Not these" },
      })
    )
    await click(screen.getByRole("button", { name: "Deny all" }))
    expect(onRespond.mock.calls).toEqual([
      [{ id: "a", approved: false, reason: "Not these" }],
      [{ id: "b", approved: false, reason: "Not these" }],
    ])
  })
})

function call(id: string, risk: "low" | "medium" | "high" | "critical") {
  return { state: "approval-requested", approval: { id }, risk }
}

describe("ToolApprovalBatch", () => {
  it("accepts AI SDK tool parts and addToolApprovalResponse", () => {
    expectTypeOf<ToolUIPart[]>().toExtend<
      ToolApprovalBatchProps<ToolUIPart>["parts"]
    >()
    expectTypeOf<ChatAddToolApproveResponseFunction>().toExtend<
      ToolApprovalBatchProps["onRespond"]
    >()
    expectTypeOf<(part: ToolUIPart) => "high">().toExtend<
      NonNullable<ToolApprovalBatchProps<ToolUIPart>["risk"]>
    >()
  })

  it("renders nothing without pending approvals", () => {
    const { container } = render(
      <ToolApprovalBatch
        parts={[{ state: "input-available" }]}
        onRespond={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("responds once per pending call, in order", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[
          call("a", "medium"),
          { state: "input-available" },
          {
            state: "approval-responded",
            approval: { id: "b", approved: true },
          },
          call("c", "low"),
        ]}
        onRespond={onRespond}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve all" })
    await click(approve)
    expect(onRespond).not.toHaveBeenCalled()
    await click(approve)
    expect(onRespond.mock.calls).toEqual([
      [{ id: "a", approved: true }],
      [{ id: "c", approved: true }],
    ])
  })

  it("follows the riskiest call in the batch", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[call("a", "low"), call("b", "high"), call("c", "medium")]}
        risk={(part) => part.risk}
        onRespond={onRespond}
      />
    )
    const approve = screen.getByRole("button", { name: /Hold to approve all/ })
    fireEvent.pointerDown(approve, { button: 0 })
    await act(async () => vi.advanceTimersByTime(1200))
    expect(onRespond).toHaveBeenCalledTimes(3)
  })

  it("asks for the phrase when a call is critical", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[call("a", "low"), call("b", "critical")]}
        risk={(part) => part.risk}
        phrase="acme-prod"
        onRespond={onRespond}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve all" })
    expect((approve as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "acme-prod" },
    })
    await click(approve)
    expect(onRespond).toHaveBeenCalledTimes(2)
  })

  it("denies every pending call on one click, only once", async () => {
    const onRespond = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[call("a", "medium"), call("b", "medium")]}
        scopes={["once", "session"]}
        onRespond={onRespond}
      />
    )
    await click(screen.getByRole("radio", { name: "This session" }))
    const deny = screen.getByRole("button", { name: "Deny all" })
    await click(deny)
    await click(deny)
    expect(onRespond.mock.calls).toEqual([
      [{ id: "a", approved: false, scope: "session" }],
      [{ id: "b", approved: false, scope: "session" }],
    ])
    expect(
      (screen.getByRole("button", { name: "Deny all" }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
  })

  it("frees a call whose response fails, and retries only that one", async () => {
    const onRespond = vi.fn(({ id }: { id: string }) =>
      id === "b" ? Promise.reject(new Error("offline")) : Promise.resolve()
    )
    const parts = [call("a", "medium"), call("b", "medium")]
    const { rerender } = render(
      <ToolApprovalBatch parts={parts} onRespond={onRespond} />
    )
    const rejection = vi.fn()
    process.on("unhandledRejection", rejection)
    await click(screen.getByRole("button", { name: "Deny all" }))
    await act(async () => {})
    rerender(
      <ToolApprovalBatch
        parts={[
          {
            state: "approval-responded",
            approval: { id: "a", approved: false },
            risk: "medium",
          },
          parts[1],
        ]}
        onRespond={onRespond}
      />
    )
    const deny = screen.getByRole("button", { name: "Deny all" })
    expect((deny as HTMLButtonElement).disabled).toBe(false)
    await click(deny)
    expect(onRespond).toHaveBeenCalledTimes(3)
    expect(onRespond).toHaveBeenLastCalledWith({ id: "b", approved: false })
    await act(async () => {})
    process.off("unhandledRejection", rejection)
    expect(rejection).toHaveBeenCalledTimes(2)
  })

  it("onConfirmError takes a failed batch approval", async () => {
    const error = new Error("offline")
    const onConfirmError = vi.fn()
    render(
      <ToolApprovalBatch
        parts={[call("a", "medium"), call("b", "medium")]}
        armDelay={500}
        errorLabel="Retry"
        onRespond={({ id }) =>
          id === "b" ? Promise.reject(error) : Promise.resolve()
        }
        onConfirmError={onConfirmError}
      />
    )
    const approve = screen.getByRole("button", { name: "Approve all" })
    await click(approve)
    expect(approve.getAttribute("data-state")).toBe("idle")
    await act(async () => vi.advanceTimersByTime(500))
    await click(approve)
    await act(async () => vi.advanceTimersByTime(500))
    await click(approve)
    await act(async () => {})
    expect(onConfirmError).toHaveBeenCalledWith(error)
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy()
  })

  it("starts the gesture over when a new call arrives", async () => {
    const onRespond = vi.fn()
    const { rerender } = render(
      <ToolApprovalBatch parts={[call("a", "medium")]} onRespond={onRespond} />
    )
    await click(screen.getByRole("button", { name: "Approve all" }))
    rerender(
      <ToolApprovalBatch
        parts={[call("a", "medium"), call("b", "medium")]}
        onRespond={onRespond}
      />
    )
    await click(screen.getByRole("button", { name: "Approve all" }))
    expect(onRespond).not.toHaveBeenCalled()
  })

  it("shows the outcome once every call is answered the same way", () => {
    const { rerender } = render(
      <ToolApprovalBatch
        parts={[
          { state: "output-available", approval: { id: "a", approved: true } },
          { state: "output-available", approval: { id: "b", approved: true } },
        ]}
        onRespond={vi.fn()}
      />
    )
    expect(screen.getByText("Approved")).toBeTruthy()
    rerender(
      <ToolApprovalBatch
        parts={[
          { state: "output-available", approval: { id: "a", approved: true } },
          { state: "output-denied", approval: { id: "b", approved: false } },
        ]}
        onRespond={vi.fn()}
      />
    )
    expect(screen.queryByText("Approved")).toBeNull()
  })
})
