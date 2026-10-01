import { highlight } from "@/components/site/code/highlight"
import { ChooserPicker } from "@/components/site/docs/chooser-picker"
import { everyExample } from "@/lib/site/choose"
import { renderExample } from "@/lib/site/example-source"
import { loadExample } from "@/lib/site/examples"

export function Chooser() {
  const code = Object.fromEntries(
    everyExample().map((name) => {
      const text = renderExample(loadExample(name))
      return [name, { text, lines: highlight(text) }]
    })
  )

  return <ChooserPicker code={code} />
}
