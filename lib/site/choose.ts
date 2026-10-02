import { siteUrl } from "@/lib/site/config"

export type Answers = {
  undo: "yes" | "later" | "no"
  count: "one" | "many"
  place: "button" | "menu" | "row" | "field" | "leave" | "agent"
}

export type Choice = {
  item: string
  name: string
  href: string
  example: string
  why: string
}

export const questions = [
  {
    key: "undo",
    label: "Can it be undone?",
    options: [
      {
        value: "yes",
        label: "can be undone right away",
        when: "can be undone right away",
      },
      {
        value: "later",
        label: "can be restored later",
        when: "can only be restored later",
      },
      { value: "no", label: "can't be undone", when: "can't be undone" },
    ],
  },
  {
    key: "count",
    label: "How many things?",
    options: [
      { value: "one", label: "one thing", when: "one thing" },
      {
        value: "many",
        label: "many things at once",
        when: "many things at once",
      },
    ],
  },
  {
    key: "place",
    label: "Where does it happen?",
    options: [
      { value: "button", label: "a button", when: "on a button" },
      { value: "menu", label: "a menu item", when: "in a menu" },
      { value: "row", label: "a row in a list", when: "on a row in a list" },
      {
        value: "field",
        label: "a select or radio change",
        when: "in a select or radio group",
      },
      {
        value: "leave",
        label: "leaving unsaved edits",
        when: "leaving unsaved edits",
      },
      { value: "agent", label: "an AI tool call", when: "in an AI tool call" },
    ],
  },
] as const

export function asks(place: Answers["place"]): (keyof Answers)[] {
  if (place === "field" || place === "leave") return []
  if (place === "agent") return ["undo"]
  return ["undo", "count"]
}

export function choose({ undo, count, place }: Answers): Choice {
  if (place === "leave") {
    return {
      item: "unsaved-changes",
      name: "`useUnsavedChanges`",
      href: "/docs/unsaved-changes",
      example: "unsaved-changes/demo",
      why: "It asks before edits are lost, on navigation, on close and on reload.",
    }
  }
  if (place === "agent") {
    const risk = { yes: "low", later: "medium", no: "critical" }[undo]
    return {
      item: "tool-approval",
      name: "`ToolApproval`",
      href: `/docs/tool-approval#${risk}-risk`,
      example: `tool-approval/${risk}`,
      why: `The "${risk}" risk level matches how hard the action is to take back.`,
    }
  }
  if (place === "field") {
    return {
      item: "confirm-dialog",
      name: "`useConfirm`",
      href: "/docs/confirm-dialog#confirm-a-select-change",
      example: "confirm-dialog/select-change",
      why: "The field keeps its old value until the dialog is confirmed, so cancelling changes nothing.",
    }
  }
  if (count === "many") {
    return {
      item: "type-to-confirm",
      name: "`ConfirmButton` or `TypeToConfirm`",
      href: "/docs/choosing-a-confirmation#many-at-once",
      example: "choosing-a-confirmation/count",
      why: "Let the friction grow with the count: undo for a few, a second click for dozens, and the count typed for hundreds.",
    }
  }
  if (undo === "yes") {
    if (place === "row") {
      return {
        item: "undoable",
        name: "`Undoable`",
        href: "/docs/undoable",
        example: "undoable/demo",
        why: "The row collapses to Undo in place, so nothing needs asking first.",
      }
    }
    if (place === "menu") {
      return {
        item: "confirm-menu-item",
        name: "`ConfirmMenuItem`",
        href: "/docs/confirm-menu-item#undo",
        example: "confirm-menu-item/undo",
        why: "It runs at once and offers Undo, which beats a question for frequent actions.",
      }
    }
    return {
      item: "confirm-button",
      name: "`ConfirmButton`",
      href: "/docs/confirm-button#undo",
      example: "confirm-button/undo",
      why: "It runs at once and offers Undo, which beats a question for frequent actions.",
    }
  }
  if (undo === "later") {
    if (place === "menu") {
      return {
        item: "confirm-menu-item",
        name: "`ConfirmMenuItem`",
        href: "/docs/confirm-menu-item",
        example: "confirm-menu-item/demo",
        why: "A second click in place is enough when it can be restored.",
      }
    }
    return {
      item: "confirm-button",
      name: "`ConfirmButton`",
      href: "/docs/confirm-button#click-again",
      example: "confirm-button/click-again",
      why: "A second click in place is enough when it can be restored.",
    }
  }
  return {
    item: "confirm-dialog",
    name: "`ConfirmDialog`",
    href: "/docs/type-to-confirm#in-a-dialog",
    example: "type-to-confirm/dialog",
    why: "It can't be taken back, so show what goes and ask for the name.",
  }
}

export function everyAnswer(): Answers[] {
  return questions[0].options.flatMap((undo) =>
    questions[1].options.flatMap((count) =>
      questions[2].options.map((place) => ({
        undo: undo.value,
        count: count.value,
        place: place.value,
      }))
    )
  )
}

export function everyExample() {
  return [...new Set(everyAnswer().map((answers) => choose(answers).example))]
}

function list(parts: string[]) {
  return parts.length < 2
    ? parts.join("")
    : `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`
}

function when(answers: Answers[]) {
  return questions
    .map((question) => {
      const values = new Set(answers.map((answer) => answer[question.key]))
      if (values.size === question.options.length) return null
      return list(
        question.options
          .filter((option) => values.has(option.value))
          .map((option) => option.when)
      )
    })
    .filter(Boolean)
    .join("; ")
}

function rules() {
  const groups = new Map<string, { choice: Choice; answers: Answers[] }>()
  for (const answers of everyAnswer()) {
    const choice = choose(answers)
    const group = groups.get(choice.example) ?? { choice, answers: [] }
    group.answers.push(answers)
    groups.set(choice.example, group)
  }
  return [...groups.values()]
}

export function rulesMarkdown(code: (example: string) => string) {
  return rules()
    .flatMap(({ choice, answers }) => [
      `- ${choice.name} (${when(answers)}): ${choice.why} Install: \`npx shadcn@latest add @sureui/${choice.item}\`. Docs: ${siteUrl}${choice.href}`,
      "",
      "  ```tsx",
      ...code(choice.example)
        .split("\n")
        .map((line) => (line ? `  ${line}` : "")),
      "  ```",
      "",
    ])
    .join("\n")
}
