import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import CountRecipe from "@/components/site/docs/examples/choosing-a-confirmation/count"
import { Preview } from "@/components/site/docs/preview"

function show(count: number) {
  render(
    <Preview
      name="choosing-a-confirmation/count"
      code={null}
      log
      controls={[{ name: "count", value: count }]}
    >
      <CountRecipe />
    </Preview>
  )
}

describe("friction that grows with the count", () => {
  it("offers undo for a few", () => {
    show(3)
    const button = screen.getByRole("button", { name: "Delete 3 issues" })
    fireEvent.click(button)
    expect(button.getAttribute("data-state")).toBe("undo")
  })

  it("asks for a second click for dozens", () => {
    show(40)
    const button = screen.getByRole("button", { name: "Delete 40 issues" })
    fireEvent.click(button)
    expect(button.getAttribute("data-state")).toBe("armed")
  })

  it("asks for the count to be typed for hundreds", () => {
    show(248)
    expect(screen.getByRole("textbox", { name: /248/ })).toBeTruthy()
    expect(
      (
        screen.getByRole("button", {
          name: "Delete 248 issues",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true)
  })
})
