"use client"

import { CodeView, type Token } from "@/components/site/code/code-view"
import { useControlValues } from "@/components/site/docs/controls"
import {
  controlIn,
  defaultValues,
  lineShown,
  renderExample,
  type ExampleSource,
} from "@/lib/site/example-source"

export function ExampleCode({
  name,
  lines,
  example,
}: {
  name: string
  lines: Token[][]
  example: ExampleSource
}) {
  const values = { ...defaultValues(example.controls), ...useControlValues() }

  return (
    <CodeView
      framed={false}
      name={name}
      copy={renderExample(example, values)}
      lines={lines
        .filter((_, index) => lineShown(example, index, values))
        .map((line) =>
          line.map((token) => {
            const name = controlIn(token.text)
            return name ? { ...token, text: String(values[name]) } : token
          })
        )}
    />
  )
}
