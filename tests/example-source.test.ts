import { describe, expect, it } from "vitest"

import {
  defaultValues,
  parseExample,
  renderExample,
} from "@/lib/site/example-source"

const file = `"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function Hold() {
  const log = useLog()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="hold"
      duration={control("duration", 1200)}
      confirmOnRelease={control("confirmOnRelease", false)}
      onConfirm={() => log("Revoked")}
    >
      Hold to revoke
    </ConfirmButton>
  )
}`

describe("example source", () => {
  const example = parseExample(file)

  it("finds the controls and whether the example logs", () => {
    expect(example.controls).toEqual([
      { name: "duration", value: 1200 },
      { name: "confirmOnRelease", value: false },
    ])
    expect(example.log).toBe(true)
  })

  it("renders the defaults without the docs hooks", () => {
    const text = renderExample(example)
    expect(text).toMatch(/^"use client"\n\nimport /)
    expect(text).not.toMatch(/useLog|useControl|control\(/)
    expect(text).toContain("duration={1200}")
    expect(text).not.toContain("confirmOnRelease")
    expect(text).toContain('console.log("Revoked")')
    expect(text).toMatch(/^export default function Hold\(\) \{\n {2}return \(/m)
  })

  it("renders chosen values, and a true toggle as a bare prop", () => {
    const text = renderExample(example, {
      ...defaultValues(example.controls),
      duration: 2500,
      confirmOnRelease: true,
    })
    expect(text).toContain("duration={2500}")
    expect(text).toMatch(/^ {6}confirmOnRelease$/m)
  })

  it("puts a value toggle in place when it isn't a JSX prop", () => {
    const toast = parseExample(
      `const x = undoToast("Hi", {\n  pauseOnHover: control("pauseOnHover", false),\n})`
    )
    expect(renderExample(toast)).toContain("pauseOnHover: false")
    expect(renderExample(toast, { pauseOnHover: true })).toContain(
      "pauseOnHover: true"
    )
  })
})
