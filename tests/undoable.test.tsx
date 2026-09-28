import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Undoable, type UndoableProps } from "@/components/ui/sureui/undoable"
import { click, setVisibility } from "./helpers"

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
})

afterEach(() => {
  Reflect.deleteProperty(document, "visibilityState")
})

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function setHeight(element: HTMLElement, height: number) {
  element.getBoundingClientRect = () =>
    ({ height, width: 0, top: 0, left: 0, right: 0, bottom: height }) as DOMRect
}

type ItemProps = Partial<UndoableProps> & { name?: string }

function ListItem({ name = "report.pdf", ...props }: ItemProps) {
  return (
    <ul>
      <Undoable
        render={<li />}
        label={`Deleted ${name}`}
        onConfirm={vi.fn()}
        {...props}
      >
        {({ remove }) => (
          <>
            <span>{name}</span>
            <Button variant="ghost">Rename</Button>
            <Button onClick={remove}>Delete</Button>
          </>
        )}
      </Undoable>
    </ul>
  )
}

function TableItem(props: Partial<UndoableProps>) {
  return (
    <table>
      <tbody>
        <Undoable
          render={<tr />}
          label="Deleted report.pdf"
          onConfirm={vi.fn()}
          {...props}
        >
          {({ remove }) => (
            <>
              <td>report.pdf</td>
              <td colSpan={2}>12 KB</td>
              <td>
                <Button onClick={remove}>Delete</Button>
              </td>
            </>
          )}
        </Undoable>
      </tbody>
    </table>
  )
}

function host(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="undoable"]')!
}

function announcement() {
  return document.querySelector("[data-sureui-announcer]")?.textContent
}

describe("Undoable", () => {
  it("list: swaps the row for the label and an Undo button", async () => {
    const { container } = render(<ListItem />)
    const row = host(container)
    expect(row.tagName).toBe("LI")
    expect(row.getAttribute("data-state")).toBe("idle")
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(row.getAttribute("data-state")).toBe("undo")
    expect(row.textContent).toContain("Deleted report.pdf")
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull()
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy()
  })

  it("table: the strip is one cell spanning every column", async () => {
    const { container } = render(<TableItem />)
    const row = host(container)
    expect(row.tagName).toBe("TR")
    await click(screen.getByRole("button", { name: "Delete" }))
    const cells = row.querySelectorAll("td")
    expect(cells).toHaveLength(1)
    expect(cells[0].colSpan).toBe(4)
    expect(cells[0].textContent).toContain("Deleted report.pdf")
  })

  it("runs onConfirm when the window ends, with a 4000ms minimum", async () => {
    const onConfirm = vi.fn()
    const { container } = render(<ListItem onConfirm={onConfirm} undo={1000} />)
    await click(screen.getByRole("button", { name: "Delete" }))
    advance(3999)
    expect(onConfirm).not.toHaveBeenCalled()
    advance(1)
    expect(onConfirm).toHaveBeenCalledOnce()
    const row = host(container)
    expect(row.getAttribute("data-state")).toBe("removed")
    expect(row.textContent).toContain("Deleted report.pdf")
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull()
  })

  it("undo: restores the row and calls onCancel, never onConfirm", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { container } = render(
      <ListItem onConfirm={onConfirm} onCancel={onCancel} />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    await click(screen.getByRole("button", { name: "Undo" }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(host(container).getAttribute("data-state")).toBe("idle")
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy()
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("can be removed again after an undo", async () => {
    const onConfirm = vi.fn()
    render(<ListItem onConfirm={onConfirm} />)
    await click(screen.getByRole("button", { name: "Delete" }))
    await click(screen.getByRole("button", { name: "Undo" }))
    await click(screen.getByRole("button", { name: "Delete" }))
    advance(5000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("undo={false} runs onConfirm right away", async () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <ListItem onConfirm={onConfirm} undo={false} />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(host(container).getAttribute("data-state")).toBe("removed")
  })

  it("keeps the row's height while collapsed", async () => {
    const { container } = render(<ListItem />)
    const row = host(container)
    setHeight(row, 48)
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(row.style.minHeight).toBe("48px")
    await click(screen.getByRole("button", { name: "Undo" }))
    expect(row.style.minHeight).toBe("")
  })

  it("table: keeps the row's height with height, since rows ignore min-height", async () => {
    const { container } = render(<TableItem />)
    const row = host(container)
    setHeight(row, 53)
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(row.style.height).toBe("53px")
  })

  it("moves focus to Undo, then back to the trigger after undoing", async () => {
    render(<ListItem />)
    const remove = screen.getByRole("button", { name: "Delete" })
    act(() => remove.focus())
    await click(remove)
    const undo = screen.getByRole("button", { name: "Undo" })
    expect(document.activeElement).toBe(undo)
    await click(undo)
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete" })
    )
  })

  it("does not take focus when it was outside the row", async () => {
    render(<ListItem />)
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(document.activeElement).toBe(document.body)
  })

  it("Undo is described by the label", async () => {
    render(<ListItem />)
    await click(screen.getByRole("button", { name: "Delete" }))
    const undo = screen.getByRole("button", { name: "Undo" })
    const describedBy = undo.getAttribute("aria-describedby")!
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "Deleted report.pdf"
    )
  })

  it("focus moved to Undo does not pause the window", async () => {
    const onConfirm = vi.fn()
    render(<ListItem onConfirm={onConfirm} />)
    const remove = screen.getByRole("button", { name: "Delete" })
    act(() => remove.focus())
    await click(remove)
    advance(5000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("pauses while focus returns to the strip", async () => {
    const onConfirm = vi.fn()
    render(
      <>
        <ListItem onConfirm={onConfirm} />
        <button>Elsewhere</button>
      </>
    )
    const remove = screen.getByRole("button", { name: "Delete" })
    act(() => remove.focus())
    await click(remove)
    const undo = screen.getByRole("button", { name: "Undo" })
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus())
    advance(1000)
    act(() => undo.focus())
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus())
    advance(3999)
    expect(onConfirm).not.toHaveBeenCalled()
    advance(1)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("pauses while the pointer is over the strip", async () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <ul>
        <Undoable render={<li />} onConfirm={onConfirm}>
          {({ remove }) => (
            <button onKeyDown={(event) => event.key === "Delete" && remove()}>
              report.pdf
            </button>
          )}
        </Undoable>
      </ul>
    )
    fireEvent.keyDown(screen.getByRole("button"), { key: "Delete" })
    const row = host(container)
    fireEvent.pointerEnter(row)
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.pointerLeave(row)
    advance(5000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("the pointer that clicked pauses only after leaving and coming back", async () => {
    const onConfirm = vi.fn()
    const { container } = render(<ListItem onConfirm={onConfirm} />)
    const row = host(container)
    await click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.pointerEnter(row)
    advance(2000)
    fireEvent.pointerLeave(row)
    fireEvent.pointerEnter(row)
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.pointerLeave(row)
    advance(3000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("pauseUndoOnHover={false} and pauseUndoOnFocus={false} keep the window running", async () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <ListItem
        onConfirm={onConfirm}
        pauseUndoOnHover={false}
        pauseUndoOnFocus={false}
      />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.pointerEnter(host(container))
    act(() => screen.getByRole("button", { name: "Undo" }).focus())
    advance(5000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("pauses while the tab is hidden", async () => {
    const onConfirm = vi.fn()
    render(<ListItem onConfirm={onConfirm} />)
    await click(screen.getByRole("button", { name: "Delete" }))
    setVisibility("hidden")
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
    setVisibility("visible")
    advance(5000)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("announces the label and that Undo is available", async () => {
    render(<ListItem />)
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(announcement()).toBe("Deleted report.pdf. Undo is available.")
    await click(screen.getByRole("button", { name: "Undo" }))
    expect(announcement()).toBe("")
  })

  it("uses announcements.undo and custom labels", async () => {
    render(
      <ListItem
        label="Archived"
        undoLabel="Restore"
        announcements={{ undo: "Archivado" }}
      />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByText("Archived")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Restore" })).toBeTruthy()
    expect(announcement()).toBe("Archivado")
  })

  it("async onConfirm: pending until it settles, with Undo disabled", async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((done) => (resolve = done)))
    const { container } = render(<ListItem onConfirm={onConfirm} />)
    await click(screen.getByRole("button", { name: "Delete" }))
    advance(5000)
    const row = host(container)
    expect(row.getAttribute("data-state")).toBe("pending")
    const undo = screen.getByRole("button", { name: "Undo" })
    expect(undo.getAttribute("aria-disabled")).toBe("true")
    await click(undo)
    expect(row.getAttribute("data-state")).toBe("pending")
    await act(async () => resolve())
    expect(row.getAttribute("data-state")).toBe("removed")
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("a throwing onConfirm restores the row and rethrows", async () => {
    const error = new Error("nope")
    const { container } = render(
      <ListItem
        onConfirm={() => {
          throw error
        }}
      />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    expect(() => vi.advanceTimersByTime(5000)).toThrow(error)
    await act(async () => {})
    expect(host(container).getAttribute("data-state")).toBe("idle")
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy()
  })

  it("unmounting during the window calls neither handler", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { unmount } = render(
      <ListItem onConfirm={onConfirm} onCancel={onCancel} />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    unmount()
    advance(10000)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("runs consumer handlers and keeps consumer props", async () => {
    const onPointerEnter = vi.fn()
    const onFocus = vi.fn()
    const { container } = render(
      <ListItem
        className="row"
        aria-label="report.pdf"
        onPointerEnter={onPointerEnter}
        onFocus={onFocus}
      />
    )
    const row = host(container)
    expect(row.className).toContain("row")
    expect(row.getAttribute("aria-label")).toBe("report.pdf")
    fireEvent.pointerEnter(row)
    act(() => screen.getByRole("button", { name: "Delete" }).focus())
    expect(onPointerEnter).toHaveBeenCalledOnce()
    expect(onFocus).toHaveBeenCalledOnce()
  })

  it("renders a div by default and accepts plain children", () => {
    const { container } = render(
      <Undoable onConfirm={vi.fn()}>report.pdf</Undoable>
    )
    expect(host(container).tagName).toBe("DIV")
    expect(host(container).textContent).toBe("report.pdf")
  })
})
