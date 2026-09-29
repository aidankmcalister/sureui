import { describe, expect, it } from "vitest"

import { searchEntries } from "@/lib/site/docs"
import { search } from "@/lib/site/search"

const entries = searchEntries()
const titles = (query: string) =>
  search(entries, query).map((entry) => entry.title)

describe("docs search", () => {
  it("lists every page before anything is typed", () => {
    expect(search(entries, "").every((entry) => !entry.page)).toBe(true)
  })

  it("puts the page with a matching title first", () => {
    expect(titles("bulk")[0]).toBe("Bulk Confirm")
    expect(titles("tool approval")[0]).toBe("Tool Approval")
  })

  it("lists a page's sections only when the query names them", () => {
    expect(titles("bulk")).not.toContain("Installation")
    expect(titles("bulk install")).toContain("Installation")
  })

  it("finds sections inside pages", () => {
    const hold = search(entries, "hold").find((entry) => entry.title === "Hold")
    expect(hold?.href).toBe("/docs/confirm-button#hold")
  })

  it("matches the start of words", () => {
    expect(titles("hold")).not.toContain("Thresholds")
    expect(titles("confirm")).toContain("Bulk Confirm")
  })

  it("needs every word to match", () => {
    expect(titles("slide dialog")).not.toContain("Confirm Button")
    expect(search(entries, "zzzz")).toEqual([])
  })
})
