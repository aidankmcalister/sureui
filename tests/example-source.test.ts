import { describe, expect, it } from "vitest"

import {
  defaultValues,
  parseExample,
  renderExample,
} from "@/lib/site/example-source"

const file = `"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function Hold() {
  const { revokeKey } = useActions()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="hold"
      duration={control("duration", 1200)}
      disabled={control("disabled", false)}
      onConfirm={revokeKey}
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
      { name: "disabled", value: false },
    ])
    expect(example.log).toBe(true)
  })

  it("renders the defaults without the docs hooks", () => {
    const text = renderExample(example)
    expect(text).toMatch(/^"use client"\n\nimport /)
    expect(text).not.toMatch(/useActions|useControl|control\(/)
    expect(text).toContain("duration={1200}")
    expect(text).not.toContain("disabled")
    expect(text).toContain("onConfirm={revokeKey}")
    expect(text).toMatch(/^export default function Hold\(\) \{\n {2}return \(/m)
  })

  it("renders chosen values, and a true toggle as a bare prop", () => {
    const text = renderExample(example, {
      ...defaultValues(example.controls),
      duration: 2500,
      disabled: true,
    })
    expect(text).toContain("duration={2500}")
    expect(text).toMatch(/^ {6}disabled$/m)
  })

  it("puts a value toggle in place when it isn't a JSX prop", () => {
    const toast = parseExample(
      `const x = undoToast("Hi", {\n  pauseUndoOnHover: control("pauseUndoOnHover", false),\n})`
    )
    expect(renderExample(toast)).toContain("pauseUndoOnHover: false")
    expect(renderExample(toast, { pauseUndoOnHover: true })).toContain(
      "pauseUndoOnHover: true"
    )
  })

  it("reads a dropdown's options and renders its value as a plain prop", () => {
    const select = parseExample(`"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function Pending() {
  const control = useControl({ pendingIndicator: ["ring", "spinner", "pulse"] })
  const { deploy } = useActions()

  return (
    <ConfirmButton
      pendingIndicator={control("pendingIndicator", "ring")}
      pendingDelay={control("pendingDelay", 0)}
      onConfirm={deploy}
    >
      Deploy
    </ConfirmButton>
  )
}`)
    expect(select.controls).toEqual([
      {
        name: "pendingIndicator",
        value: "ring",
        options: ["ring", "spinner", "pulse"],
      },
      { name: "pendingDelay", value: 0 },
    ])
    const text = renderExample(select, {
      ...defaultValues(select.controls),
      pendingIndicator: "spinner",
    })
    expect(text).not.toMatch(/useControl|control\(/)
    expect(text).toMatch(/^ {6}pendingIndicator="spinner"$/m)
    expect(text).toContain("pendingDelay={0}")
  })
})
