const onConfirm = ["onConfirm", "() => void | Promise<unknown>", "required"]
const onCancel = ["onCancel", "() => void", "—"]
const undo = ["undo", "boolean | number", "—"]
const gesture = ["gesture", '"click" | "click-again" | "hold"', '"click"']
const buttonProps = ["...props", "Button props", "—"]
const menuItemProps = ["...props", "DropdownMenuItem props, like variant", "—"]
const menu = ["menu", '"dropdown" | "context"', '"dropdown"']
const closeOnConfirm = ["closeOnConfirm", "boolean", "true"]
const dataState = [
  "data-state",
  '"idle" | "armed" | "holding" | "ready" | "undo" | "pending"',
  '"idle"',
]

export type Style = {
  slug: string
  name: string
  lead: string
  summary: string
  question: string
  interrupts: string
  reads: string
  bestFor: string
  items: string[]
  usage: string
  api: { name: string; rows: string[][] }[]
  behavior?: string[]
  useWhen: string[]
  instead: { when: string; slug: string }[]
}

export const styles: Style[] = [
  {
    slug: "undo",
    name: "Undo",
    lead: "Act right away and give people a few seconds to take it back.",
    summary: "Runs on click, then offers a few seconds to take it back.",
    question: "Can it be taken back?",
    interrupts: "No",
    reads: "No",
    bestFor: "Trash, archive, anything you can restore",
    items: ["confirm-button", "undo-toast", "undoable"],
    usage: `<ConfirmButton undo onConfirm={moveToTrash}>
  Move to trash
</ConfirmButton>

if (await undoToast("Moved 3 files to trash")) {
  await deleteFiles(ids)
}

<Undoable
  render={<TableRow />}
  label={\`Deleted \${file.name}\`}
  onConfirm={() => deleteFile(file.id)}
>
  {({ remove }) => (
    <>
      <TableCell>{file.name}</TableCell>
      <TableCell>
        <Button onClick={remove}>Delete</Button>
      </TableCell>
    </>
  )}
</Undoable>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          ["undo", "boolean | number", "5000 when true, min 4000"],
          ["undoLabel", "ReactNode", '"Undo"'],
          ["announcements.undo", "string", '"Done. Undo is available."'],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          onConfirm,
          onCancel,
          dataState,
        ],
      },
      {
        name: "undoToast(message, options)",
        rows: [
          ["message", "ReactNode", "required"],
          ["description", "ReactNode", "—"],
          ["duration", "number", "5000, min 4000"],
          ["undoLabel", "string", '"Undo"'],
          ["pauseOnHover", "boolean", "true"],
          ["pauseOnFocus", "boolean", "true"],
        ],
      },
      {
        name: "Undoable",
        rows: [
          onConfirm,
          ["children", "ReactNode | ({ remove, state }) => ReactNode", "—"],
          ["render", "ReactElement, like <li /> or <TableRow />", "<div />"],
          ["label", "ReactNode", '"Deleted"'],
          ["undoLabel", "ReactNode", '"Undo"'],
          ["announcements.undo", "string", '"{label}. Undo is available."'],
          ["undo", "boolean | number", "true (5000), min 4000"],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          onCancel,
          ["...props", "props for the rendered element", "—"],
          ["data-state", '"idle" | "undo" | "pending" | "removed"', '"idle"'],
        ],
      },
    ],
    behavior: [
      "Nothing runs until the window ends: 5 seconds by default, or the number you pass. Anything under 4 seconds is raised to 4, because a shorter window ends before most people notice the mistake.",
      "Undo calls onCancel, and onConfirm never runs.",
      "If someone leaves the button and comes back to it, by pointer or keyboard, the window pauses until they leave again. Turn this off with pauseUndoOnHover={false} or pauseUndoOnFocus={false}. The window also pauses while the tab is hidden.",
      "Disabling the button during the window keeps Undo pressable, so an action is never stuck without a way back.",
      "Unmounting the control during the window drops the action without calling either handler. Closing the tab does the same.",
      "undoToast pauses while the toast is hovered or has keyboard focus, and while the tab is hidden. Turn this off with pauseOnHover: false or pauseOnFocus: false.",
      "For a row whose button goes away with it, wrap the row in Undoable, with render={<li />} or render={<TableRow />}. Calling remove collapses the row in place to its label and an Undo button at the same height, so the rows below don't move. In a table the label spans every column.",
      'Undoable moves focus to Undo if focus was in the row, and back to the button that removed it after Undo. Its window pauses when the pointer or focus comes back to the row. Once onConfirm has run, data-state is "removed", so drop the item from your data then.',
      "Keep a trash or history view too, so people can still restore things after the window closes.",
    ],
    useWhen: [
      "Moving files to trash, archiving mail, hiding a post.",
      "People do it many times a day and expect it to be instant.",
      "People usually spot the mistake right away.",
    ],
    instead: [
      { when: "Nothing can bring it back", slug: "type-to-confirm" },
      { when: "It affects other people and needs explaining", slug: "dialogs" },
      { when: "The action can't wait a few seconds", slug: "click-again" },
    ],
  },
  {
    slug: "click-again",
    name: "Click again",
    lead: "The first click arms the button and the second one confirms.",
    summary: "The first click arms it, the second confirms.",
    question: "Is it one small item people act on often?",
    interrupts: "No",
    reads: "No",
    bestFor: "Single rows in a list",
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="click-again" onConfirm={archive}>
  Archive
</ConfirmButton>

<DropdownMenuContent>
  <ConfirmMenuItem variant="destructive" onConfirm={remove}>
    Delete
  </ConfirmMenuItem>
</DropdownMenuContent>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          onConfirm,
          gesture,
          ["confirmLabel", "ReactNode", '"Click again to confirm"'],
          ["announcements.armed", "string", "confirmLabel when it's a string"],
          ["timeout", "number", "3000"],
          ["cancelOnBlur", "boolean", "true"],
          onCancel,
          undo,
          buttonProps,
          [
            "data-state (on the button)",
            '"idle" | "undo" | "pending"',
            '"idle"',
          ],
        ],
      },
      {
        name: "ConfirmMenuItem",
        rows: [
          onConfirm,
          ["gesture", '"click" | "click-again" | "hold"', '"click-again"'],
          ["confirmLabel", "ReactNode", '"Click again to confirm"'],
          ["announcements.armed", "string", "confirmLabel when it's a string"],
          ["timeout", "number", "3000"],
          ["cancelOnBlur", "boolean", "true"],
          closeOnConfirm,
          menu,
          onCancel,
          undo,
          ["undoLabel", "ReactNode", '"Undo"'],
          ["announcements.undo", "string", '"Done. Undo is available."'],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          ["closeOnUndo", "boolean", "true"],
          ["commitUndoOnClose", "boolean", "true"],
          menuItemProps,
          dataState,
        ],
      },
    ],
    behavior: [
      "The button disarms after timeout, 3 seconds by default, or when focus leaves it. Keep it armed on blur with cancelOnBlur={false}.",
      "Key-repeat clicks are ignored, so holding Enter can't arm and confirm in one go.",
      "While a promise from onConfirm is pending, the button is disabled but keeps focus.",
      'In a DropdownMenu or ContextMenu, use ConfirmMenuItem, added with @sureui/confirm-menu-item (menu="context" for a context menu). The menu stays open while the item is armed, pending or showing Undo, and closes once the action commits or Undo is pressed. Keep it open with closeOnConfirm={false} or closeOnUndo={false}.',
      "Menus move focus with the highlight, so pointing at or arrowing to another item disarms a ConfirmMenuItem, like any blur.",
      "Closing the menu during the undo window, with Escape or a click outside, commits the action, because Undo closes with it. Set commitUndoOnClose={false} to drop it instead.",
    ],
    useWhen: [
      "Archiving one message or removing one row.",
      "Space is tight and a dialog would be too much.",
    ],
    instead: [
      { when: "It's easy to reverse", slug: "undo" },
      { when: "A stray tap on a phone would be costly", slug: "hold" },
      {
        when: "People need one line of context first, which ConfirmPopover gives",
        slug: "dialogs",
      },
      { when: "It can't be undone", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "hold",
    name: "Hold",
    lead: "People press and hold until the fill completes, then let go to confirm. Letting go early cancels.",
    summary: "Press and hold until it fills, then let go.",
    question: "Could a stray tap trigger it?",
    interrupts: "No",
    reads: "No",
    bestFor: "Touch screens and small resets",
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmButton>

<ConfirmMenuItem gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmMenuItem>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          onConfirm,
          gesture,
          ["duration", "number", "1200, min 800"],
          ["confirmOnRelease", "boolean", "true"],
          ["cancelHoldOnLeave", "boolean", "true"],
          ["holdFallback", '"click-again" | "none"', '"click-again"'],
          ["releaseLabel", "ReactNode", "—"],
          [
            "announcements.hold",
            "string",
            '"Press and hold, or activate twice, to confirm"',
          ],
          ["announcements.fallback", "string", '"Activate again to confirm"'],
          ["announcements.ready", "string", '"Release to confirm"'],
          onCancel,
          undo,
          buttonProps,
          dataState,
        ],
      },
      {
        name: "ConfirmMenuItem",
        rows: [
          onConfirm,
          ["gesture", '"click" | "click-again" | "hold"', '"click-again"'],
          ["duration", "number", "1200, min 800"],
          ["confirmOnRelease", "boolean", "true"],
          ["cancelHoldOnLeave", "boolean", "true"],
          ["holdFallback", '"click-again" | "none"', '"click-again"'],
          ["releaseLabel", "ReactNode", "—"],
          [
            "announcements.hold",
            "string",
            '"Press and hold, or activate twice, to confirm"',
          ],
          ["announcements.fallback", "string", '"Activate again to confirm"'],
          ["announcements.ready", "string", '"Release to confirm"'],
          closeOnConfirm,
          menu,
          onCancel,
          undo,
          menuItemProps,
          dataState,
        ],
      },
    ],
    behavior: [
      "The fill takes 1.2 seconds by default. Anything under 0.8 seconds is raised to 0.8, because a shorter hold is easy to trigger with a slow tap.",
      'Once the fill completes, the button is ready (data-state="ready") and confirms when the pointer or key is released on it. Show a different label while ready with releaseLabel.',
      'Holding is a shortcut, not the only way. A screen reader activation, or a Space or Enter press let go before the fill completes, arms the button instead (data-state="armed", announced as "Activate again to confirm"), and the next activation confirms. This armed state never times out; blur or Escape clears it. A mouse or finger let go early still cancels. Turn this off with holdFallback="none".',
      "Letting go outside the button, moving off it, or losing focus cancels, even after the fill. Set cancelHoldOnLeave={false} to let the pointer leave and come back before letting go, like a native button.",
      "Set confirmOnRelease={false} to confirm the moment the fill completes. Pair it with undo, since there is no last chance to back out.",
      "With undo, the Undo button runs on click, so pressing it and sliding off does nothing.",
      "The context menu is blocked on the button so a long press on a phone doesn't open it.",
      "With prefers-reduced-motion, fills don't animate: the hold fill appears when it completes and the undo fill clears when the window ends.",
      'ConfirmMenuItem with gesture="hold" keeps its menu open while held and closes it once the action commits. From the keyboard, hold Enter or Space, or press twice.',
    ],
    useWhen: [
      "Revoking an API key or resetting preferences.",
      "Touch screens, where a second tap happens by accident.",
    ],
    instead: [
      { when: "People need to read what happens first", slug: "dialogs" },
      { when: "It's permanent and large", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "dialogs",
    name: "Dialogs",
    lead: "An optional alert dialog for actions that need a sentence of explanation, or a popover anchored to the button when one line is enough.",
    summary: "Opens a dialog or a popover when there's something to explain.",
    question: "Does it need explaining, or affect other people?",
    interrupts: "Yes, less with a popover",
    reads: "Yes",
    bestFor: "Actions that affect other people",
    items: ["confirm-dialog"],
    usage: `<ConfirmDialog
  title="Leave the Design team?"
  description="An admin can add you back later."
  confirmLabel="Leave team"
  variant="destructive"
  onConfirm={leaveTeam}
>
  <Button variant="outline">Leave team</Button>
</ConfirmDialog>

<ConfirmPopover
  description="Open pull requests from this branch will close."
  confirmLabel="Delete branch"
  variant="destructive"
  onConfirm={deleteBranch}
>
  <Button variant="outline">Delete branch</Button>
</ConfirmPopover>

const { confirm, dialog } = useConfirm()

async function discard() {
  if (await confirm({ title: "Discard this draft?" })) deleteDraft()
}`,
    api: [
      {
        name: "ConfirmDialog",
        rows: [
          ["title", "string", "required"],
          onConfirm,
          ["children", "ReactElement (trigger)", "required"],
          onCancel,
          ["description", "ReactNode", "—"],
          ["consequences", "ReactNode", "—"],
          ["cancelLabel", "string", '"Cancel"'],
          ["confirmLabel", "string", '"Confirm"'],
          ["variant", "Button variant", '"default"'],
          gesture,
          ["phrase", "string", "—"],
          ["acknowledgements", "string[]", "—"],
          ["timeout", "number", "3000"],
          ["cancelOnBlur", "boolean", "true"],
          ["duration", "number", "1200, min 800"],
          ["confirmOnRelease", "boolean", "true"],
          ["cancelHoldOnLeave", "boolean", "true"],
          ["holdFallback", '"click-again" | "none"', '"click-again"'],
          ["caseSensitive", "boolean", "true"],
          ["trim", "boolean", "false"],
          ["announcements", "{ hold, ready, armed, fallback, match }", "—"],
        ],
      },
      {
        name: "ConfirmPopover",
        rows: [
          ["description", "ReactNode", "required"],
          onConfirm,
          ["children", "ReactElement (trigger)", "required"],
          onCancel,
          ["title", "string", "—"],
          ["confirmLabel", "string", '"Confirm"'],
          ["cancelLabel", "string", '"Cancel"'],
          ["showCancel", "boolean", "true"],
          ["variant", "Button variant", '"default"'],
          gesture,
          ["timeout", "number", "3000"],
          ["cancelOnBlur", "boolean", "true"],
          ["duration", "number", "1200, min 800"],
          ["confirmOnRelease", "boolean", "true"],
          ["cancelHoldOnLeave", "boolean", "true"],
          ["holdFallback", '"click-again" | "none"', '"click-again"'],
          ["announcements", "{ hold, ready, armed, fallback }", "—"],
          [
            "side",
            '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
            '"bottom"',
          ],
          ["align", '"start" | "center" | "end"', '"center"'],
          ["open", "boolean", "—"],
          ["onOpenChange", "(open: boolean) => void", "—"],
        ],
      },
      {
        name: "useConfirm()",
        rows: [
          ["returns", "{ confirm, dialog }", "—"],
          [
            "confirm(options)",
            "ConfirmDialog props, minus children and onCancel",
            "—",
          ],
          ["options.onConfirm", "() => void | Promise<unknown>", "—"],
          ["confirm() resolves", "Promise<boolean>", "—"],
        ],
      },
    ],
    behavior: [
      "Gesture options (timeout, cancelOnBlur, duration, confirmOnRelease, cancelHoldOnLeave) apply when phrase is not set. caseSensitive, trim and announcements.match apply when it is.",
      "The dialog stays open, and Cancel and Escape do nothing, while a promise from onConfirm is pending.",
      "ConfirmPopover, added with @sureui/confirm-popover, is the lighter surface: a popover anchored to its trigger with one line and a confirm button. The rest of the page stays visible and usable.",
      "The popover moves focus to its confirm button when it opens and back to the trigger when it closes. Cancel, Escape, a click outside and tabbing out of it all close it and call onCancel.",
      "The popover stays open while a promise from onConfirm is pending, and Cancel, Escape and clicks outside do nothing. If the promise rejects, it stays open so people can try again.",
      "ConfirmPopover has no undo prop. It closes once the action commits, so an Undo button inside it would close too. For a way back, use undoToast.",
    ],
    useWhen: [
      "Leaving a team or removing someone else's access.",
      "The consequence takes a sentence to explain.",
      "One line is enough and the action only touches this item, like deleting a branch: use ConfirmPopover, so the page stays in view.",
      "It affects other people or takes more than a line: use ConfirmDialog.",
      "You need to await the answer inside a handler, with useConfirm.",
    ],
    instead: [
      { when: "It's routine and reversible", slug: "undo" },
      {
        when: "One extra click is warning enough, with nothing to explain",
        slug: "click-again",
      },
      { when: "It deletes something large for good", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "type-to-confirm",
    name: "Type to confirm",
    lead: "An inline form that unlocks only after the exact phrase is typed.",
    summary: "Unlocks only after the exact name is typed.",
    question: "Is it permanent and large?",
    interrupts: "No, unless in a dialog",
    reads: "Yes",
    bestFor: "Deleting projects, databases and accounts",
    items: ["type-to-confirm", "consequences"],
    usage: `<TypeToConfirm
  phrase="acme-prod"
  consequences={
    <Consequences
      title="This deletes"
      items={[
        { label: "deployments", count: 128 },
        {
          label: "domains",
          count: 4,
          names: ["acme.com", "www.acme.com", "api.acme.com", "status.acme.com"],
        },
        { label: "environment variables", count: 23 },
      ]}
    />
  }
  acknowledgements={["I understand active deployments will go offline."]}
  confirmLabel="Delete project"
  onConfirm={deleteProject}
/>`,
    api: [
      {
        name: "TypeToConfirm",
        rows: [
          ["phrase", "string", "required"],
          ["caseSensitive", "boolean", "true"],
          ["trim", "boolean", "false"],
          ["label", "ReactNode", '"Type {phrase} to confirm"'],
          ["consequences", "ReactNode", "—"],
          ["announcements.match", "string", '"Phrase matches"'],
          ["announcements.undo", "string", '"Done. Undo is available."'],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          onConfirm,
          onCancel,
          undo,
          ["confirmLabel", "string", '"Confirm"'],
          ["undoLabel", "string", '"Undo"'],
          ["variant", "Button variant", '"destructive"'],
          ["acknowledgements", "string[]", "[]"],
          ["renderActions", "(confirmButton) => ReactNode", "—"],
          ["className", "string", "—"],
          dataState,
        ],
      },
      {
        name: "Consequences",
        rows: [
          ["items", "{ label, count?, names?, icon?, description? }[]", "—"],
          ["title", "ReactNode", "—"],
          ["variant", '"default" | "destructive"', '"default"'],
          ["limit", "number", "3"],
          ["expandable", "boolean", "true"],
          ["moreLabel", "(hidden: number) => string", '"and {hidden} more"'],
          ["lessLabel", "string", '"Show less"'],
          ["children", "ConsequencesItem elements", "—"],
          ["...props", "div props", "—"],
        ],
      },
      {
        name: "ConsequencesItem",
        rows: [
          ["label", "ReactNode", "required"],
          ["count", "number", "—"],
          ["names", "string[]", "[]"],
          ["icon", "ReactNode", "—"],
          ["description", "ReactNode", "—"],
          ["limit", "number", "from Consequences"],
          ["expandable", "boolean", "from Consequences"],
          ["moreLabel", "(hidden: number) => string", "from Consequences"],
          ["lessLabel", "string", "from Consequences"],
          ["...props", "li props", "—"],
        ],
      },
    ],
    behavior: [
      "Pass a Consequences list to consequences to show what the confirm removes, above the phrase input. ConfirmDialog takes the same prop, with or without a phrase.",
      'Consequences is a list. Each item reads as its count, label and names, like "4 domains: acme.com, www.acme.com, api.acme.com and 1 more".',
      'Names past limit, 3 by default, collapse into "and N more", a button that shows the rest and then "Show less". Set expandable={false} to keep it as text. When count is larger than the names you pass, N includes the ones you left out.',
      "The phrase must match exactly by default, including case and spaces. Relax it with caseSensitive={false} or trim.",
      "Acknowledgements are optional. Leave them out and typing the phrase is enough.",
      "The button is a ConfirmButton, so key-repeat clicks are ignored and its width doesn't change between Confirm and Undo.",
      "The input and checkboxes clear after confirming, so after an undo the form isn't one click from running again.",
      "While a promise from onConfirm is pending, the input is read-only and the button is disabled but keeps focus.",
    ],
    useWhen: [
      "Deleting a project, a database or an account.",
      "Nothing, including support, can bring the data back.",
      "People must read the name to be sure it's the right one.",
    ],
    instead: [
      { when: "You keep a copy for a while", slug: "undo" },
      { when: "It's one small item", slug: "click-again" },
      { when: "A sentence of warning is enough", slug: "dialogs" },
    ],
  },
]

export const styleSections = [
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "behavior", label: "How it behaves" },
  { id: "props", label: "Props" },
  { id: "when", label: "When to use it" },
] as const

export type StyleSectionId = (typeof styleSections)[number]["id"]

export const whenLabels = {
  use: "Use it when",
  instead: "Reach for something else when",
}

export function sectionsFor(style: Style) {
  return styleSections.filter(
    (section) => section.id !== "behavior" || style.behavior
  )
}

export function getStyle(slug: string) {
  return styles.find((style) => style.slug === slug)
}
