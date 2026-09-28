import * as React from "react"
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

describe("Undoable focus after removal", () => {
  function Files({
    names,
    ...props
  }: Partial<UndoableProps> & { names: string[] }) {
    const [items, setItems] = React.useState(names)
    return (
      <ul aria-label="Files">
        {items.map((name) => (
          <Undoable
            key={name}
            render={<li />}
            label={`Deleted ${name}`}
            {...props}
            onConfirm={() =>
              setItems((current) => current.filter((item) => item !== name))
            }
          >
            {({ remove }) => (
              <>
                <span>{name}</span>
                <Button variant="ghost">Rename {name}</Button>
                <Button onClick={remove}>Delete {name}</Button>
              </>
            )}
          </Undoable>
        ))}
      </ul>
    )
  }

  async function removeWithUndo(name: string) {
    const button = screen.getByRole("button", { name: `Delete ${name}` })
    act(() => button.focus())
    await click(button)
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Undo" })
    )
    advance(5000)
  }

  it("moves focus to the same button in the next row", async () => {
    render(<Files names={["a.pdf", "b.pdf", "c.pdf"]} />)
    await removeWithUndo("b.pdf")
    expect(screen.queryByText("b.pdf")).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete c.pdf" })
    )
  })

  it("moves focus to the previous row when the last row goes", async () => {
    render(<Files names={["a.pdf", "b.pdf"]} />)
    await removeWithUndo("b.pdf")
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete a.pdf" })
    )
  })

  it("skips rows that are collapsed", async () => {
    render(<Files names={["a.pdf", "b.pdf", "c.pdf"]} />)
    const button = screen.getByRole("button", { name: "Delete a.pdf" })
    act(() => button.focus())
    await click(button)
    advance(1000)
    await click(screen.getByRole("button", { name: "Delete b.pdf" }))
    advance(4000)
    expect(screen.queryByText("a.pdf")).toBeNull()
    expect(screen.getByText("Deleted b.pdf")).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete c.pdf" })
    )
  })

  it("moves focus to the list when the only row goes", async () => {
    render(<Files names={["a.pdf"]} />)
    await removeWithUndo("a.pdf")
    const list = screen.getByRole("list", { name: "Files" })
    expect(document.activeElement).toBe(list)
    expect(list.getAttribute("tabindex")).toBe("-1")
  })

  it("moves focus without an undo window", async () => {
    render(<Files names={["a.pdf", "b.pdf"]} undo={false} />)
    const button = screen.getByRole("button", { name: "Delete a.pdf" })
    act(() => button.focus())
    await click(button)
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete b.pdf" })
    )
  })

  it("waits for a pending onConfirm before moving focus", async () => {
    let resolve!: () => void
    render(
      <ul>
        <Undoable
          render={<li />}
          onConfirm={() => new Promise<void>((res) => (resolve = res))}
        >
          {({ remove }) => <Button onClick={remove}>Delete</Button>}
        </Undoable>
        <li>
          <Button>Next</Button>
        </li>
      </ul>
    )
    const button = screen.getByRole("button", { name: "Delete" })
    act(() => button.focus())
    await click(button)
    advance(5000)
    const undo = screen.getByRole("button", { name: "Undo" })
    expect(document.activeElement).toBe(undo)
    await act(async () => resolve())
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Next" })
    )
  })

  it("focusAfterRemove picks the target", async () => {
    const focusAfterRemove = vi.fn(() =>
      screen.getByRole("button", { name: "Add file" })
    )
    render(
      <>
        <Button>Add file</Button>
        <Files names={["a.pdf", "b.pdf"]} focusAfterRemove={focusAfterRemove} />
      </>
    )
    await removeWithUndo("a.pdf")
    expect(focusAfterRemove).toHaveBeenCalledOnce()
    expect(focusAfterRemove.mock.calls[0]).toHaveLength(1)
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add file" })
    )
  })

  it("leaves focus alone when it wasn't in the row", async () => {
    render(
      <>
        <Button>Elsewhere</Button>
        <Files names={["a.pdf", "b.pdf"]} />
      </>
    )
    await click(screen.getByRole("button", { name: "Delete a.pdf" }))
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" })
    act(() => elsewhere.focus())
    advance(5000)
    expect(document.activeElement).toBe(elsewhere)
  })
})

describe("Undoable failures", () => {
  it("onConfirmError gets a thrown error and the row comes back", async () => {
    const error = new Error("nope")
    const onConfirmError = vi.fn()
    const { container } = render(
      <ListItem
        onConfirmError={onConfirmError}
        onConfirm={() => {
          throw error
        }}
      />
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    advance(5000)
    await act(async () => {})
    expect(onConfirmError).toHaveBeenCalledWith(error)
    expect(host(container).getAttribute("data-state")).toBe("idle")
  })

  it("onConfirmError gets a rejection without an unhandled rejection", async () => {
    let reject!: (error: Error) => void
    const onConfirmError = vi.fn()
    const onRejection = vi.fn()
    process.on("unhandledRejection", onRejection)
    try {
      const { container } = render(
        <ListItem
          onConfirmError={onConfirmError}
          onConfirm={() =>
            new Promise<void>((_, rej) => {
              reject = rej
            })
          }
        />
      )
      await click(screen.getByRole("button", { name: "Delete" }))
      advance(5000)
      await act(async () => reject(new Error("offline")))
      vi.useRealTimers()
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(onConfirmError.mock.calls[0][0]).toHaveProperty(
        "message",
        "offline"
      )
      expect(onRejection).not.toHaveBeenCalled()
      expect(host(container).getAttribute("data-state")).toBe("idle")
    } finally {
      process.off("unhandledRejection", onRejection)
    }
  })
})

describe("Undoable manual undo", () => {
  it("keeps Undo until a press outside the row", async () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <>
        <ListItem undo="manual" onConfirm={onConfirm} />
        <Button>Elsewhere</Button>
      </>
    )
    await click(screen.getByRole("button", { name: "Delete" }))
    advance(600000)
    expect(host(container).getAttribute("data-state")).toBe("undo")
    fireEvent.pointerDown(screen.getByRole("button", { name: "Undo" }))
    expect(onConfirm).not.toHaveBeenCalled()
    act(() => {
      fireEvent.pointerDown(screen.getByRole("button", { name: "Elsewhere" }))
    })
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(host(container).getAttribute("data-state")).toBe("removed")
  })

  it("commits when focus leaves the row and Undo still cancels", async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <>
        <ListItem undo="manual" onConfirm={onConfirm} onCancel={onCancel} />
        <Button>Elsewhere</Button>
      </>
    )
    const remove = screen.getByRole("button", { name: "Delete" })
    act(() => remove.focus())
    await click(remove)
    await click(screen.getByRole("button", { name: "Undo" }))
    expect(onCancel).toHaveBeenCalledOnce()
    const again = screen.getByRole("button", { name: "Delete" })
    act(() => again.focus())
    await click(again)
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus())
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
