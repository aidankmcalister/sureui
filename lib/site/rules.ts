import { addArgs, siteUrl } from "@/lib/site/config"
import { contract, contractNote } from "@/lib/site/pages"
import { styles, type Style } from "@/lib/site/styles"

const order = ["type-to-confirm", "dialogs", "undo", "click-again", "hold"]

const description =
  "Picks and uses SureUI confirmation controls (undo, click again, hold, type to confirm, dialog, popover) from the @sureui shadcn registry. Use when adding or reviewing a delete, remove, revoke, archive, reset, leave or other destructive action in a React or shadcn/ui app, and before reaching for AlertDialog or window.confirm."

const imports = `import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { ConfirmDialog, useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { Undoable } from "@/components/ui/sureui/undoable"`

function styleBySlug(slug: string) {
  return styles.find((style) => style.slug === slug)!
}

function ordered() {
  return [
    ...order.map(styleBySlug),
    ...styles.filter((style) => !order.includes(style.slug)),
  ]
}

function list(items: string[], indent = "") {
  return items.map((item) => `${indent}- ${item}`).join("\n")
}

function code(lang: string, source: string) {
  return "```" + lang + "\n" + source + "\n```"
}

function install(style: Style) {
  return code("bash", `npx shadcn@latest ${addArgs(style.items)}`)
}

function dataStates() {
  const row = styles
    .flatMap((style) => style.api)
    .flatMap((api) => api.rows)
    .find(([name]) => name === "data-state")
  return row ? row[1] : ""
}

function decision(style: Style, index: number) {
  return [
    `${index + 1}. **${style.question}** Use ${style.name}. Best for: ${style.bestFor.toLowerCase()}.`,
    "   Use it when:",
    list(style.useWhen, "   "),
    "   Use something else when:",
    list(
      style.instead.map(
        (item) => `${item.when}: ${styleBySlug(item.slug).name}.`
      ),
      "   "
    ),
  ].join("\n")
}

function styleSection(style: Style) {
  return [
    `### ${style.name}`,
    style.lead,
    install(style),
    code("tsx", style.usage),
    list(style.behavior ?? []),
  ].join("\n\n")
}

function rulesBody() {
  const steps = ordered()
  return [
    "# SureUI confirmations",
    `SureUI is a shadcn/ui registry of confirmation controls: ${styles
      .map((style) => style.name.toLowerCase())
      .join(", ")}. Docs: ${siteUrl}/docs/which-one`,
    "## Rules",
    list([
      "Don't put every destructive action behind an AlertDialog or `window.confirm`. People confirm dialogs on reflex, so the one that matters gets the same click as the rest.",
      "Match the confirmation to the action. Answer the questions below in order and use the first style whose answer is yes.",
      '"Taken back" means your app keeps the thing after the action runs: in a trash, an archive, or hidden. If the data is gone once `onConfirm` runs, the answer is no, even when it is quick to recreate. The undo window alone does not make an action reversible.',
      "Restorable and routine: Undo, never a dialog.",
      "Deleting one row or one small item for good: Click again.",
      "A switch whose toggle is the action, like turning off two-factor authentication: `ConfirmSwitch` (`npx shadcn@latest add @sureui/confirm-switch`). It asks only in the risky direction and toggles the other at once.",
      "Use a dialog only for actions that need a sentence of explanation or affect other people.",
      "When one line of context is enough and the action only touches the item in front of you, use `ConfirmPopover` (`npx shadcn@latest add @sureui/confirm-popover`) instead of a dialog. Keep `ConfirmDialog` for actions that affect other people or need more than a line.",
      "Use the SureUI components. Don't hand-roll timers, armed states or hold progress.",
    ]),
    "## Which style",
    steps.map(decision).join("\n"),
    "## Install",
    "Add the registry to `components.json` once:",
    code(
      "json",
      `{
  "registries": {
    "@sureui": "${siteUrl}/r/{name}.json"
  }
}`
    ),
    "Then add the item for the style you picked:",
    list(
      steps.map(
        (style) =>
          `${style.name}: \`npx shadcn@latest ${addArgs(style.items)}\``
      )
    ),
    "`undoToast` needs the shadcn `<Toaster />` in the root layout. Nothing else needs setup.",
    "## One contract",
    contractNote,
    list([
      "`onConfirm` runs the action. If it throws or rejects, the control returns to idle and the error reaches your code, so handle failures inside it.",
      "`onCancel` runs when a confirmation is cancelled or undone.",
      "`undo` is `true` for a 5 second window, or a number of milliseconds. `onConfirm` runs only after the window ends; Undo calls `onCancel` instead.",
      "`ConfirmButton` takes every Button prop, such as `variant`, `size` and `disabled`.",
      "`useConfirm()` returns `{ confirm, dialog }`. Render `{dialog}` once, then `await confirm(options)` resolves `true` or `false`.",
      `Every control sets \`data-state\` (${dataStates()}) so you can style around it.`,
    ]),
    code("tsx", imports),
    code("tsx", contract),
    "## Styles",
    steps.map(styleSection).join("\n\n"),
  ].join("\n\n")
}

function withFrontmatter(fields: [string, string][], body: string) {
  return [
    "---",
    ...fields.map(([key, value]) => `${key}: ${value}`),
    "---",
    "",
    body,
    "",
  ].join("\n")
}

const ruleFiles = [
  {
    path: "skills/sureui/SKILL.md",
    target: "~/.claude/skills/sureui/SKILL.md",
    content: withFrontmatter(
      [
        ["name", "sureui"],
        ["description", description],
      ],
      rulesBody()
    ),
  },
  {
    path: "rules/sureui.mdc",
    target: "~/.cursor/rules/sureui.mdc",
    content: withFrontmatter(
      [
        ["description", description],
        ["alwaysApply", "false"],
      ],
      rulesBody()
    ),
  },
]

export { order, ruleFiles, rulesBody }
