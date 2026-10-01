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
  code: string
  why: string
}

export const questions = [
  {
    key: "undo",
    label: "Can it be undone?",
    options: [
      {
        value: "yes",
        label: "Yes, right away",
        when: "can be undone right away",
      },
      {
        value: "later",
        label: "Only by restoring it",
        when: "can only be restored later",
      },
      { value: "no", label: "No", when: "can't be undone" },
    ],
  },
  {
    key: "count",
    label: "How many things?",
    options: [
      { value: "one", label: "One", when: "one thing" },
      {
        value: "many",
        label: "Many at once",
        when: "many things at once",
      },
    ],
  },
  {
    key: "place",
    label: "Where does it happen?",
    options: [
      { value: "button", label: "A button", when: "on a button" },
      { value: "menu", label: "A menu item", when: "in a menu" },
      { value: "row", label: "A row in a list", when: "on a row in a list" },
      {
        value: "field",
        label: "A select or radio",
        when: "in a select or radio group",
      },
      {
        value: "leave",
        label: "Leaving unsaved edits",
        when: "leaving unsaved edits",
      },
      { value: "agent", label: "An AI tool call", when: "in an AI tool call" },
    ],
  },
] as const

export function choose({ undo, count, place }: Answers): Choice {
  if (place === "leave") {
    return {
      item: "unsaved-changes",
      name: "useUnsavedChanges",
      href: "/docs/unsaved-changes",
      code: "const { confirmLeave, dialog } = useUnsavedChanges({ when: dirty })",
      why: "It asks before edits are lost, on navigation, on close and on reload.",
    }
  }
  if (place === "agent") {
    const risk = { yes: "low", later: "medium", no: "critical" }[undo]
    return {
      item: "tool-approval",
      name: "ToolApproval",
      href: "/docs/tool-approval",
      code: `<ToolApproval part={part} risk="${risk}" onRespond={addToolApprovalResponse} />`,
      why: `The "${risk}" risk level matches how hard the action is to take back.`,
    }
  }
  if (place === "field") {
    return {
      item: "confirm-dialog",
      name: "useConfirm",
      href: "/docs/confirm-dialog#confirm-a-select-change",
      code: "if (await confirm({ title: `Make Ava a ${next}?` })) setRole(next)",
      why: "The field keeps its old value until the dialog is confirmed, so cancelling changes nothing.",
    }
  }
  if (count === "many") {
    return {
      item: "type-to-confirm",
      name: "ConfirmButton or TypeToConfirm, by count",
      href: "/docs/choosing-a-confirmation#many-at-once",
      code: 'count > 100 ? <TypeToConfirm phrase={String(count)} … /> : <ConfirmButton gesture={count > 10 ? "click-again" : "click"} undo={count <= 10} … />',
      why: "Let the friction grow with the count: undo for a few, a second click for dozens, the count typed for hundreds.",
    }
  }
  if (undo === "yes") {
    if (place === "row") {
      return {
        item: "undoable",
        name: "Undoable",
        href: "/docs/undoable",
        code: "<Undoable label={`Removed ${name}`} onConfirm={remove}>...</Undoable>",
        why: "The row collapses to Undo in place, so nothing needs asking first.",
      }
    }
    if (place === "menu") {
      return {
        item: "confirm-menu-item",
        name: "ConfirmMenuItem",
        href: "/docs/confirm-menu-item#undo",
        code: '<ConfirmMenuItem gesture="click" undo onConfirm={archive}>Archive</ConfirmMenuItem>',
        why: "It runs at once and offers Undo, which beats a question for frequent actions.",
      }
    }
    return {
      item: "confirm-button",
      name: "ConfirmButton",
      href: "/docs/confirm-button#undo",
      code: "<ConfirmButton undo onConfirm={archive}>Archive</ConfirmButton>",
      why: "It runs at once and offers Undo, which beats a question for frequent actions.",
    }
  }
  if (undo === "later") {
    if (place === "menu") {
      return {
        item: "confirm-menu-item",
        name: "ConfirmMenuItem",
        href: "/docs/confirm-menu-item",
        code: "<ConfirmMenuItem onConfirm={removeMember}>Remove member</ConfirmMenuItem>",
        why: "A second click in place is enough when it can be restored.",
      }
    }
    return {
      item: "confirm-button",
      name: "ConfirmButton",
      href: "/docs/confirm-button#click-again",
      code: '<ConfirmButton gesture="click-again" onConfirm={revoke}>Revoke key</ConfirmButton>',
      why: "A second click in place is enough when it can be restored.",
    }
  }
  return {
    item: "confirm-dialog",
    name: "ConfirmDialog",
    href: "/docs/confirm-dialog#typed-phrase",
    code: '<ConfirmDialog title="Delete acme-prod?" phrase="acme-prod" consequences={...} onConfirm={remove}>...</ConfirmDialog>',
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
    const group = groups.get(choice.code) ?? { choice, answers: [] }
    group.answers.push(answers)
    groups.set(choice.code, group)
  }
  return [...groups.values()]
}

export function rulesMarkdown() {
  return rules()
    .flatMap(({ choice, answers }) => [
      `- **${choice.name}** (${when(answers)}): ${choice.why}`,
      `  \`\` ${choice.code} \`\``,
      `  Install: \`npx shadcn@latest add @sureui/${choice.item}\`. Docs: ${siteUrl}${choice.href}`,
    ])
    .join("\n")
}
