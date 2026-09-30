import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import { choose, everyAnswer } from "@/lib/site/choose"
import { headings, pageAt } from "@/lib/site/docs"

const items = registry.items.filter((item) => item.type !== "registry:block")

describe("choosing a control", () => {
  it.each(everyAnswer())(
    "%o ends in a real item and docs section",
    (answers) => {
      const choice = choose(answers)
      expect(items.map((item) => item.name)).toContain(choice.item)
      const [path, anchor] = choice.href.split("#")
      const page = pageAt(path)
      expect(page).toBeDefined()
      if (anchor) {
        expect(headings(page!.slug).map((heading) => heading.id)).toContain(
          anchor
        )
      }
    }
  )
})
