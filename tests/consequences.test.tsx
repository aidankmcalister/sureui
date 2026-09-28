import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import {
  Consequences,
  ConsequencesItem,
} from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

const projects = ["acme-web", "acme-api", "docs"]
const many = Array.from({ length: 43 }, (_, index) => `site-${index + 1}`)

function itemText(name: RegExp) {
  return screen
    .getAllByRole("listitem")
    .find((item) => name.test(item.textContent ?? ""))
}

describe("Consequences", () => {
  it("is a list named by its title, one item per consequence", () => {
    render(
      <Consequences
        title="This deletes"
        items={[
          { label: "projects", count: 3, names: projects },
          { label: "deployments", count: 12 },
          { label: "domains", count: 4 },
        ]}
      />
    )
    const list = screen.getByRole("list", { name: "This deletes" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
  })

  it("reads each item as its label, count and names", () => {
    render(
      <Consequences
        items={[{ label: "Projects", count: 3, names: projects }]}
      />
    )
    expect(screen.getByRole("listitem").textContent).toBe(
      "Projects, 3: acme-web, acme-api, docs"
    )
  })

  it("reads a count without names as just the label and count", () => {
    render(<Consequences items={[{ label: "Deployments", count: 128 }]} />)
    expect(screen.getByRole("listitem").textContent).toBe("Deployments, 128")
  })

  it("counts the names when no count is given", () => {
    render(<Consequences items={[{ label: "Projects", names: projects }]} />)
    expect(screen.getByRole("listitem").textContent).toBe(
      "Projects, 3: acme-web, acme-api, docs"
    )
  })

  it("shows names up to limit, then and N more", () => {
    render(
      <Consequences
        limit={2}
        expandable={false}
        items={[{ label: "projects", count: 3, names: projects }]}
      />
    )
    expect(screen.getByText("acme-web, acme-api and 1 more")).toBeTruthy()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("counts names it wasn't given in and N more", () => {
    render(
      <Consequences
        expandable={false}
        items={[{ label: "sites", count: 50, names: many.slice(0, 5) }]}
      />
    )
    expect(screen.getByText("site-1, site-2, site-3 and 47 more")).toBeTruthy()
  })

  it("expands the rest of the names and collapses them again", () => {
    render(
      <Consequences items={[{ label: "sites", count: 45, names: many }]} />
    )
    const more = screen.getByRole("button", { name: "and 42 more" })
    expect(more.getAttribute("aria-expanded")).toBe("false")
    fireEvent.click(more)
    expect(more.getAttribute("aria-expanded")).toBe("true")
    expect(more.textContent).toBe("Show less")
    expect(itemText(/sites/)?.textContent).toContain("site-43 and 2 more")
    fireEvent.click(more)
    expect(more.textContent).toBe("and 42 more")
    expect(itemText(/sites/)?.textContent).not.toContain("site-4,")
  })

  it("takes its labels as options", () => {
    render(
      <Consequences
        moreLabel={(hidden) => `+${hidden}`}
        lessLabel="Fewer"
        items={[{ label: "sites", names: many.slice(0, 5) }]}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "+2" }))
    expect(screen.getByRole("button", { name: "Fewer" })).toBeTruthy()
  })

  it("composes ConsequencesItem children, which inherit limit and can override it", () => {
    render(
      <Consequences title="This deletes" limit={1} expandable={false}>
        <ConsequencesItem label="projects" names={projects} />
        <ConsequencesItem label="domains" names={projects} limit={3} />
        <ConsequencesItem
          label="API keys"
          count={4}
          description="Requests that use them start failing."
        />
      </Consequences>
    )
    expect(itemText(/projects/)?.textContent).toContain("acme-web and 2 more")
    expect(itemText(/domains/)?.textContent).toContain(
      "acme-web, acme-api, docs"
    )
    expect(
      screen.getByText("Requests that use them start failing.")
    ).toBeTruthy()
  })

  it("marks its tone with data-variant", () => {
    const { container } = render(
      <Consequences variant="destructive" items={[]} />
    )
    expect(
      container
        .querySelector("[data-slot=consequences]")
        ?.getAttribute("data-variant")
    ).toBe("destructive")
  })

  it("keeps icons out of the accessible text", () => {
    render(
      <Consequences
        items={[{ label: "projects", count: 3, icon: <svg role="img" /> }]}
      />
    )
    expect(screen.queryByRole("img")).toBeNull()
  })
})

describe("Consequences in TypeToConfirm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] })
  })

  it("renders above the phrase input and expanding doesn't submit", () => {
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        phrase="acme"
        onConfirm={onConfirm}
        consequences={
          <Consequences
            title="This deletes"
            items={[{ label: "sites", count: 43, names: many }]}
          />
        }
      />
    )
    const list = screen.getByRole("list", { name: "This deletes" })
    expect(
      list.compareDocumentPosition(screen.getByRole("textbox")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "acme" },
    })
    fireEvent.click(screen.getByRole("button", { name: "and 40 more" }))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})

describe("Consequences in ConfirmDialog", () => {
  const consequences = (
    <Consequences
      title="This deletes"
      items={[{ label: "projects", count: 3, names: projects }]}
    />
  )

  it("shows in the dialog without a phrase", async () => {
    render(
      <ConfirmDialog
        title="Delete team?"
        consequences={consequences}
        onConfirm={vi.fn()}
      >
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByRole("list", { name: "This deletes" }))
  })

  it("shows above the phrase input with a phrase", async () => {
    render(
      <ConfirmDialog
        title="Delete team?"
        phrase="acme"
        consequences={consequences}
        onConfirm={vi.fn()}
      >
        <Button>Delete</Button>
      </ConfirmDialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog")
    const list = within(dialog).getByRole("list", { name: "This deletes" })
    expect(within(dialog).getAllByRole("list")).toHaveLength(1)
    expect(
      list.compareDocumentPosition(within(dialog).getByRole("textbox")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
