---
name: sureui
description: >
  Pick, install and wire SureUI confirmation components (undo, click again,
  hold to confirm, type to confirm, dialogs, AI tool approval) from the
  @sureui shadcn registry. Use when adding a delete, remove, revoke, cancel or
  other destructive or risky action, a bulk action, a leave-page guard, or an
  approval step for an AI tool call, or when code imports from
  components/ui/sureui. Also use to find destructive actions that run on a
  single click.
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---

# SureUI

SureUI is a free shadcn/ui registry of confirmation components built on Base UI. Its components install as source with the shadcn CLI, into `components/ui/sureui/`.

## The project

```json
!`npx shadcn@latest info --json`
```

SureUI needs a shadcn project on Base UI, the shadcn default. If the project above uses Radix, say so and stop: SureUI's components use Base UI's `render` prop. Setup details are in [setup.md](./rules/setup.md).

## How bad is it?

Every choice starts here. Ask whether the action can be taken back, how many things it touches, and where it happens. The harder it is to take back, the more the confirmation asks. A question on every routine action teaches people to answer without reading.

| If the action is | Reach for | Details |
|---|---|---|
| Reversible and frequent: archive, remove from a list, mark done | Undo, no question: `ConfirmButton undo`, `undoToast`, `Undoable` | [undo.md](./rules/undo.md) |
| Recoverable with some effort: remove a member, delete a branch | A second click in place: `gesture="click-again"`, `ConfirmMenuItem`, `ConfirmPopover` | [gestures.md](./rules/gestures.md) |
| A dangerous one-off: revoke a production key, deploy | A press and hold: `gesture="hold"` | [gestures.md](./rules/gestures.md) |
| Permanent, with wide impact: delete a project, a database, an account | The name typed, with what goes listed: `ConfirmDialog phrase consequences`, or `TypeToConfirm` inline | [dialogs.md](./rules/dialogs.md) |
| Many things at once | Friction that grows with the count | [risk.md](./rules/risk.md) |
| A call from an AI agent | `ToolApproval` with a `risk` level | [agents.md](./rules/agents.md) |

Unsaved edits and value changes (a select, a radio) have their own answers in [risk.md](./rules/risk.md).

## Items

Install any of them with `npx shadcn@latest add @sureui/<item>`. Every page at `https://sureui.com/docs/<item>` has props and examples, and `https://sureui.com/llms/<item>.md` is the same page as markdown.

- `confirm-button`: `ConfirmButton`, a button that confirms by click, click again, hold or slide, with an optional undo window.
- `confirm-menu-item`: `ConfirmMenuItem`, a destructive dropdown or context menu item. The menu stays open until it commits.
- `confirm-switch`: `ConfirmSwitch`, a switch that flips at once and can be flipped back during an undo window.
- `type-to-confirm`: `TypeToConfirm`, an inline form that unlocks once the exact phrase is typed.
- `confirm-dialog`: `ConfirmDialog`, an alert dialog around a trigger, and `useConfirm`, an awaitable `confirm()`.
- `confirm-popover`: `ConfirmPopover`, a short confirmation anchored to its trigger.
- `consequences`: `Consequences`, the list of what a confirmation removes or changes.
- `undo-toast`: `undoToast()`, undo in a toast for when the clicked control goes away.
- `undoable`: `Undoable`, a list or table row that collapses to Undo in place.
- `unsaved-changes`: `useUnsavedChanges`, a question before unsaved edits are lost.
- `tool-approval`: `ToolApproval` and `ToolApprovalBatch`, approval for AI SDK tool calls.

For a trigger none of these fit (a card, a keyboard shortcut, a canvas tool), the core hook `useConfirmation` is documented at https://sureui.com/docs/confirmation-core.

## Adding a confirmation

1. Place the action on the table above, and read its rule file.
2. Check whether the item is in `components/ui/sureui/`. If not, install it.
3. Put the action in `onConfirm`. It may return a promise, and the control stays pending until it settles.
4. Label it with a verb and the thing ("Delete 3 files"), and keep cancelling to one click or Escape.
5. Don't stack confirmations: one control per action.

```tsx
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

<ConfirmButton gesture="click-again" variant="destructive" onConfirm={deleteBranch}>
  Delete branch
</ConfirmButton>
```

## Finding unguarded actions

When asked to review code, or while working near it, look for handlers that delete, remove, revoke, drop, destroy, cancel or archive and run straight from an `onClick`, a menu item's `onSelect`, or a form submit, with no confirmation or undo. Report each with its file and line, what it appears to do, and the row of the table above it falls in. Change only what the user asks you to change.

## Rule files

- [risk.md](./rules/risk.md): choosing by risk, counts, unsaved edits and value changes.
- [gestures.md](./rules/gestures.md): `ConfirmButton` gestures, labels, errors and `data-state`.
- [dialogs.md](./rules/dialogs.md): `ConfirmDialog`, `useConfirm` and `Consequences`.
- [undo.md](./rules/undo.md): the undo window, `undoToast` and `Undoable`.
- [agents.md](./rules/agents.md): `ToolApproval` with the AI SDK.
- [setup.md](./rules/setup.md): requirements, installing and client components.
