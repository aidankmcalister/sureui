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
      "onConfirm runs when the window ends: after 5 seconds, or the milliseconds you pass. Anything under 4 seconds is raised to 4, so people have time to notice a mistake.",
      "Undo calls onCancel instead of onConfirm.",
      "If the pointer or focus leaves the button and comes back, the window pauses until it leaves again, unless pauseUndoOnHover or pauseUndoOnFocus is false. A hidden tab also pauses it.",
      "Undo stays pressable if the button is disabled during the window.",
      "Unmounting during the window, including closing the tab, drops the action without calling either handler.",
      "undoToast pauses while the toast is hovered or focused, unless you pass pauseOnHover: false or pauseOnFocus: false. It also pauses while the tab is hidden.",
      "When the button leaves with its row, wrap the row in Undoable (render={<li />} or render={<TableRow />}). Calling remove collapses the row in place to its label and an Undo button at the same height, so rows below don't move. In a table the label spans every column.",
      "Undoable moves focus to Undo if focus was in the row, and back to the button that removed it after Undo. Its window pauses when the pointer or focus comes back to the row.",
      'Undoable sets data-state="removed" once onConfirm has run. Drop the item from your data then.',
      "Keep a trash or history view for restoring things after the window ends.",
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
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="click-again" onConfirm={archive}>
  Archive
</ConfirmButton>

<DropdownMenuContent>
  <ConfirmMenuItem variant="destructive" onConfirm={remove}>
    Delete
  </ConfirmMenuItem>
</DropdownMenuContent>

<Label htmlFor="two-factor">Two-factor authentication</Label>
<ConfirmSwitch
  id="two-factor"
  checked={enabled}
  onCheckedChange={setEnabled}
  onConfirm={saveTwoFactor}
/>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          onConfirm,
          gesture,
          ["confirmLabel", "ReactNode", '"Click again to confirm"'],
          ["announcements.armed", "string", "confirmLabel, if a string"],
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
          ["announcements.armed", "string", "confirmLabel, if a string"],
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
      {
        name: "ConfirmSwitch",
        rows: [
          [
            "onConfirm",
            "(checked: boolean) => void | Promise<unknown>",
            "required",
          ],
          ["checked", "boolean", "—"],
          ["defaultChecked", "boolean", "false"],
          ["onCheckedChange", "(checked: boolean) => void", "—"],
          ["confirmWhen", '"off" | "on" | "both"', '"off"'],
          [
            "gesture",
            '"click-again" | "hold" | "popover" | "dialog"',
            '"click-again"',
          ],
          onCancel,
          ["timeout", "number", "3000, click-again only"],
          ["cancelOnBlur", "boolean", "true, click-again only"],
          ["duration", "number", "1200, min 800, hold only"],
          ["confirmOnRelease", "boolean", "true, hold only"],
          ["cancelHoldOnLeave", "boolean", "true, hold only"],
          [
            "holdFallback",
            '"click-again" | "none"',
            '"click-again", hold only',
          ],
          ["title", "string", "required for dialog, optional for popover"],
          [
            "description",
            "ReactNode",
            "required for popover, optional for dialog",
          ],
          ["confirmLabel", "string", '"Turn off" or "Turn on"'],
          ["cancelLabel", "string", '"Cancel"'],
          ["variant", "Button variant", '"default"'],
          ["announcements.armed", "string", '"Click again to turn off"'],
          [
            "announcements.hold",
            "string",
            '"Press and hold, or activate twice, to turn off"',
          ],
          ["announcements.fallback", "string", '"Activate again to turn off"'],
          ["announcements.ready", "string", '"Release to turn off"'],
          ["announcements.pending", "string", '"Turning off"'],
          ["...props", "Switch props, like id, name, size and disabled", "—"],
          [
            "data-state",
            '"idle" | "armed" | "holding" | "ready" | "pending"',
            '"idle"',
          ],
        ],
      },
    ],
    behavior: [
      "The button disarms after timeout, 3 seconds by default, or when it loses focus. Set cancelOnBlur={false} to keep it armed on blur.",
      "Key-repeat clicks are ignored, so holding Enter can't arm and confirm at once.",
      "While onConfirm's promise is pending, the button is disabled but keeps focus.",
      'In a DropdownMenu or ContextMenu, use ConfirmMenuItem from @sureui/confirm-menu-item, with menu="context" in a context menu.',
      "The menu stays open while the item is armed, pending or showing Undo. It closes when the action commits or Undo is pressed, unless closeOnConfirm or closeOnUndo is false.",
      "Menus move focus with the highlight, so pointing or arrowing to another item disarms a ConfirmMenuItem.",
      "Closing the menu during the undo window, with Escape or a click outside, commits the action, since Undo closes with it. Set commitUndoOnClose={false} to drop the action instead.",
      "When flipping a switch is the action, like turning off two-factor authentication, use ConfirmSwitch from @sureui/confirm-switch.",
      'ConfirmSwitch asks only in the risky direction: turning off by default, turning on with confirmWhen="on", or both with confirmWhen="both". The safe direction toggles at once and still calls onConfirm.',
      'The first click arms the switch without moving it. aria-checked keeps the saved value, it announces "Click again to turn off", and data-state="armed" lets you show a hint next to the label.',
      "Space, or a click on the switch's Label, counts as a click on the switch.",
      'ConfirmSwitch also takes gesture="hold", gesture="popover" (a ConfirmPopover with your description) and gesture="dialog" (an alert dialog with your title). Each gesture accepts only the props it uses.',
      "While onConfirm's promise is pending, the switch shows the new value, keeps focus and ignores clicks. onCheckedChange runs when it resolves. If it rejects, the switch goes back to the old value.",
    ],
    useWhen: [
      "Archiving one message or removing one row.",
      "Space is tight and a dialog would be too much.",
      "Turning off a protective setting, like two-factor authentication or branch protection, with ConfirmSwitch.",
    ],
    instead: [
      { when: "It's easy to reverse", slug: "undo" },
      { when: "A stray tap on a phone would be costly", slug: "hold" },
      {
        when: "People need one line of context first (ConfirmPopover)",
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
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmButton>

<ConfirmMenuItem gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmMenuItem>

<ConfirmSwitch
  gesture="hold"
  defaultChecked
  aria-label="Require pull request reviews"
  onConfirm={saveBranchProtection}
/>`,
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
      "The fill takes 1.2 seconds by default. Anything under 0.8 seconds is raised to 0.8, since a slow tap can complete a shorter hold.",
      'When the fill completes, the button is ready (data-state="ready") and confirms when the pointer or key is released on it. releaseLabel sets the label while ready.',
      'A screen reader activation, or Space or Enter released before the fill completes, arms the button instead (data-state="armed", announced as "Activate again to confirm"), and the next activation confirms. Set holdFallback="none" to turn this off.',
      "The armed state doesn't time out. Blur or Escape clears it.",
      "A mouse or finger released before the fill completes cancels.",
      "Releasing outside the button, moving off it or losing focus cancels, even after the fill. Set cancelHoldOnLeave={false} to let the pointer leave and come back before release, like a native button.",
      "Set confirmOnRelease={false} to confirm as soon as the fill completes. Pair it with undo, since people can't back out once the fill completes.",
      "With undo, the Undo button runs on click, so pressing it and sliding off does nothing.",
      "The button blocks the context menu, so a long press on a phone doesn't open it.",
      "With prefers-reduced-motion, fills don't animate. The hold fill appears when it completes and the undo fill clears when the window ends.",
      'ConfirmMenuItem with gesture="hold" keeps the menu open while held and closes it when the action commits. From the keyboard, hold Enter or Space, or press twice.',
      'ConfirmSwitch with gesture="hold" fills its track toward the new value while held, in the risky direction only. Its props are on the Click again page.',
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
      "While onConfirm's promise is pending, the dialog stays open and Cancel and Escape do nothing.",
      "ConfirmPopover, from @sureui/confirm-popover, is a popover anchored to its trigger with one line and a confirm button. The rest of the page stays visible and usable.",
      "The popover moves focus to its confirm button when it opens and back to the trigger when it closes. Cancel, Escape, a click outside and tabbing out close it and call onCancel.",
      "While onConfirm's promise is pending, the popover stays open and Cancel, Escape and clicks outside do nothing. If it rejects, the popover stays open for another try.",
      "ConfirmPopover has no undo prop, because it closes when the action commits and an Undo inside it would close too. Use undoToast for a way back.",
      'ConfirmSwitch with gesture="popover" or gesture="dialog" asks in a ConfirmPopover or an alert dialog before the risky direction, and toggles the safe one at once. Its props are on the Click again page.',
    ],
    useWhen: [
      "Leaving a team or removing someone else's access.",
      "The consequence takes a sentence to explain.",
      "One line is enough and the action only touches this item, like deleting a branch. Use ConfirmPopover.",
      "It affects other people or takes more than a line: use ConfirmDialog.",
      "You need to await the answer inside a handler: use useConfirm.",
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
      "Pass a Consequences list to consequences to show what the confirm removes above the phrase input. ConfirmDialog takes the same prop, with or without a phrase.",
      'Consequences renders a list. Each item reads as its count, label and names, like "4 domains: acme.com, www.acme.com, api.acme.com and 1 more".',
      'Names past limit, 3 by default, collapse into an "and N more" button that shows the rest and then reads "Show less". Set expandable={false} to keep it as text. When count is larger than the names you pass, N includes the ones you left out.',
      "The phrase must match exactly by default, including case and spaces. Relax it with caseSensitive={false} or trim.",
      "Acknowledgements are optional. Without them, typing the phrase is enough.",
      "The button is a ConfirmButton, so key-repeat clicks are ignored and its width doesn't change between Confirm and Undo.",
      "The input and checkboxes clear after confirming, so after an undo the form isn't one click from running again.",
      "While onConfirm's promise is pending, the input is read-only and the button is disabled but keeps focus.",
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
