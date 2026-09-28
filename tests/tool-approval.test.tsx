import type { ChatAddToolApproveResponseFunction, ToolUIPart } from "ai"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest"

import {
  ToolApproval,
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
