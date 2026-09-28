---
name: sureui
description: Picks and uses SureUI confirmation controls (undo, click again, hold, type to confirm, dialog, popover) from the @sureui shadcn registry. Use when adding or reviewing a delete, remove, revoke, archive, reset, leave or other destructive action in a React or shadcn/ui app, and before reaching for AlertDialog or window.confirm.
---

# SureUI confirmations

SureUI is a shadcn/ui registry of confirmation controls: undo, click again, hold, dialogs, type to confirm. Docs: https://sureui.com/docs/which-one

## Rules

- Don't put every destructive action behind an AlertDialog or `window.confirm`. People confirm dialogs on reflex, so the one that matters gets the same click as the rest.
- Match the confirmation to the action. Answer the questions below in order and use the first style whose answer is yes.
- "Taken back" means your app keeps the thing after the action runs: in a trash, an archive, or hidden. If the data is gone once `onConfirm` runs, the answer is no, even when it is quick to recreate. The undo window alone does not make an action reversible.
- Restorable and routine: Undo, never a dialog.
- Deleting one row or one small item for good: Click again.
- A switch whose toggle is the action, like turning off two-factor authentication: `ConfirmSwitch` (`npx shadcn@latest add @sureui/confirm-switch`). It asks only in the risky direction and toggles the other at once.
- Use a dialog only for actions that need a sentence of explanation or affect other people.
- When one line of context is enough and the action only touches the item in front of you, use `ConfirmPopover` (`npx shadcn@latest add @sureui/confirm-popover`) instead of a dialog. Keep `ConfirmDialog` for actions that affect other people or need more than a line.
- Use the SureUI components. Don't hand-roll timers, armed states or hold progress.

## Which style

1. **Is it permanent and large?** Use Type to confirm. Best for: deleting projects, databases and accounts.
   Use it when:
   - Deleting a project, a database or an account.
   - Nothing, including support, can bring the data back.
   - People must read the name to be sure it's the right one.
   Use something else when:
   - You keep a copy for a while: Undo.
   - It's one small item: Click again.
   - A sentence of warning is enough: Dialogs.
2. **Does it need explaining, or affect other people?** Use Dialogs. Best for: actions that affect other people.
   Use it when:
   - Leaving a team or removing someone else's access.
   - The consequence takes a sentence to explain.
   - One line is enough and the action only touches this item, like deleting a branch. Use ConfirmPopover.
   - It affects other people or takes more than a line: use ConfirmDialog.
   - You need to await the answer inside a handler: use useConfirm.
   Use something else when:
   - It's routine and reversible: Undo.
   - One extra click is warning enough, with nothing to explain: Click again.
   - It deletes something large for good: Type to confirm.
3. **Can it be taken back?** Use Undo. Best for: trash, archive, anything you can restore.
   Use it when:
   - Moving files to trash, archiving mail, hiding a post.
   - People do it many times a day and expect it to be instant.
   - People usually spot the mistake right away.
   Use something else when:
   - Nothing can bring it back: Type to confirm.
   - It affects other people and needs explaining: Dialogs.
   - The action can't wait a few seconds: Click again.
4. **Is it one small item people act on often?** Use Click again. Best for: single rows in a list.
   Use it when:
   - Archiving one message or removing one row.
   - Space is tight and a dialog would be too much.
   - Turning off a protective setting, like two-factor authentication or branch protection, with ConfirmSwitch.
   Use something else when:
   - It's easy to reverse: Undo.
   - A stray tap on a phone would be costly: Hold.
   - People need one line of context first (ConfirmPopover): Dialogs.
   - It can't be undone: Type to confirm.
5. **Could a stray tap trigger it?** Use Hold. Best for: touch screens and small resets.
   Use it when:
   - Revoking an API key or resetting preferences.
   - Touch screens, where a second tap happens by accident.
   Use something else when:
   - People need to read what happens first: Dialogs.
   - It's permanent and large: Type to confirm.

## Install

Add the registry to `components.json` once:

```json
{
  "registries": {
    "@sureui": "https://sureui.com/r/{name}.json"
  }
}
```

Then add the item for the style you picked:

- Type to confirm: `npx shadcn@latest add @sureui/type-to-confirm @sureui/consequences`
- Dialogs: `npx shadcn@latest add @sureui/confirm-dialog`
- Undo: `npx shadcn@latest add @sureui/confirm-button @sureui/undo-toast @sureui/undoable`
- Click again: `npx shadcn@latest add @sureui/confirm-button`
- Hold: `npx shadcn@latest add @sureui/confirm-button`

`undoToast` needs the shadcn `<Toaster />` in the root layout. Nothing else needs setup.

## One contract

Every component takes the same `onConfirm`. Return a promise and the control stays pending until it settles.

- `onConfirm` runs the action. If it throws or rejects, the control returns to idle and the error reaches your code, so handle failures inside it.
- `onCancel` runs when a confirmation is cancelled or undone.
- `undo` is `true` for a 5 second window, or a number of milliseconds. `onConfirm` runs only after the window ends; Undo calls `onCancel` instead.
- `ConfirmButton` takes every Button prop, such as `variant`, `size` and `disabled`.
- `useConfirm()` returns `{ confirm, dialog }`. Render `{dialog}` once, then `await confirm(options)` resolves `true` or `false`.
- Every control sets `data-state` ("idle" | "armed" | "holding" | "ready" | "undo" | "pending") so you can style around it.

```tsx
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { ConfirmDialog, useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { Undoable } from "@/components/ui/sureui/undoable"
```

```tsx
async function deleteProject() {
  await api.projects.delete(id)
}

<ConfirmButton undo onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="click-again" onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="hold" onConfirm={deleteProject}>Delete</ConfirmButton>
<TypeToConfirm phrase="acme-prod" onConfirm={deleteProject} />
<ConfirmDialog title="Delete acme-prod?" onConfirm={deleteProject}>
  <Button>Delete</Button>
</ConfirmDialog>
```

## Styles

### Type to confirm

An inline form that unlocks only after the exact phrase is typed.

```bash
npx shadcn@latest add @sureui/type-to-confirm @sureui/consequences
```

```tsx
<TypeToConfirm
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
/>
```

- Pass a Consequences list to consequences to show what the confirm removes above the phrase input. ConfirmDialog takes the same prop, with or without a phrase.
- Consequences renders a list. Each item reads as its count, label and names, like "4 domains: acme.com, www.acme.com, api.acme.com and 1 more".
- Names past limit, 3 by default, collapse into an "and N more" button that shows the rest and then reads "Show less". Set expandable={false} to keep it as text. When count is larger than the names you pass, N includes the ones you left out.
- The phrase must match exactly by default, including case and spaces. Relax it with caseSensitive={false} or trim.
- Acknowledgements are optional. Without them, typing the phrase is enough.
- The button is a ConfirmButton, so key-repeat clicks are ignored and its width doesn't change between Confirm and Undo.
- The input and checkboxes clear after confirming, so after an undo the form isn't one click from running again.
- While onConfirm's promise is pending, the input is read-only and the button is disabled but keeps focus.

### Dialogs

An optional alert dialog for actions that need a sentence of explanation, or a popover anchored to the button when one line is enough.

```bash
npx shadcn@latest add @sureui/confirm-dialog
```

```tsx
<ConfirmDialog
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
}
```

- Gesture options (timeout, cancelOnBlur, duration, confirmOnRelease, cancelHoldOnLeave) apply when phrase is not set. caseSensitive, trim and announcements.match apply when it is.
- While onConfirm's promise is pending, the dialog stays open and Cancel and Escape do nothing.
- ConfirmPopover, from @sureui/confirm-popover, is a popover anchored to its trigger with one line and a confirm button. The rest of the page stays visible and usable.
- The popover moves focus to its confirm button when it opens and back to the trigger when it closes. Cancel, Escape, a click outside and tabbing out close it and call onCancel.
- While onConfirm's promise is pending, the popover stays open and Cancel, Escape and clicks outside do nothing. If it rejects, the popover stays open for another try.
- ConfirmPopover has no undo prop, because it closes when the action commits and an Undo inside it would close too. Use undoToast for a way back.
- ConfirmSwitch with gesture="popover" or gesture="dialog" asks in a ConfirmPopover or an alert dialog before the risky direction, and toggles the safe one at once. Its props are on the Click again page.

### Undo

Act right away and give people a few seconds to take it back.

```bash
npx shadcn@latest add @sureui/confirm-button @sureui/undo-toast @sureui/undoable
```

```tsx
<ConfirmButton undo onConfirm={moveToTrash}>
  Move to trash
</ConfirmButton>

if (await undoToast("Moved 3 files to trash")) {
  await deleteFiles(ids)
}

<Undoable
  render={<TableRow />}
  label={`Deleted ${file.name}`}
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
</Undoable>
```

- onConfirm runs when the window ends: after 5 seconds, or the milliseconds you pass. Anything under 4 seconds is raised to 4, so people have time to notice a mistake.
- Undo calls onCancel instead of onConfirm.
- If the pointer or focus leaves the button and comes back, the window pauses until it leaves again, unless pauseUndoOnHover or pauseUndoOnFocus is false. A hidden tab also pauses it.
- Undo stays pressable if the button is disabled during the window.
- Unmounting during the window, including closing the tab, drops the action without calling either handler.
- undoToast pauses while the toast is hovered or focused, unless you pass pauseOnHover: false or pauseOnFocus: false. It also pauses while the tab is hidden.
- When the button leaves with its row, wrap the row in Undoable (render={<li />} or render={<TableRow />}). Calling remove collapses the row in place to its label and an Undo button at the same height, so rows below don't move. In a table the label spans every column.
- Undoable moves focus to Undo if focus was in the row, and back to the button that removed it after Undo. Its window pauses when the pointer or focus comes back to the row.
- Undoable sets data-state="removed" once onConfirm has run. Drop the item from your data then.
- Keep a trash or history view for restoring things after the window ends.

### Click again

The first click arms the button and the second one confirms.

```bash
npx shadcn@latest add @sureui/confirm-button
```

```tsx
<ConfirmButton gesture="click-again" onConfirm={archive}>
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
/>
```

- The button disarms after timeout, 3 seconds by default, or when it loses focus. Set cancelOnBlur={false} to keep it armed on blur.
- Key-repeat clicks are ignored, so holding Enter can't arm and confirm at once.
- While onConfirm's promise is pending, the button is disabled but keeps focus.
- In a DropdownMenu or ContextMenu, use ConfirmMenuItem from @sureui/confirm-menu-item, with menu="context" in a context menu.
- The menu stays open while the item is armed, pending or showing Undo. It closes when the action commits or Undo is pressed, unless closeOnConfirm or closeOnUndo is false.
- Menus move focus with the highlight, so pointing or arrowing to another item disarms a ConfirmMenuItem.
- Closing the menu during the undo window, with Escape or a click outside, commits the action, since Undo closes with it. Set commitUndoOnClose={false} to drop the action instead.
- When flipping a switch is the action, like turning off two-factor authentication, use ConfirmSwitch from @sureui/confirm-switch.
- ConfirmSwitch asks only in the risky direction: turning off by default, turning on with confirmWhen="on", or both with confirmWhen="both". The safe direction toggles at once and still calls onConfirm.
- The first click arms the switch without moving it. aria-checked keeps the saved value, it announces "Click again to turn off", and data-state="armed" lets you show a hint next to the label.
- Space, or a click on the switch's Label, counts as a click on the switch.
- ConfirmSwitch also takes gesture="hold", gesture="popover" (a ConfirmPopover with your description) and gesture="dialog" (an alert dialog with your title). Each gesture accepts only the props it uses.
- While onConfirm's promise is pending, the switch shows the new value, keeps focus and ignores clicks. onCheckedChange runs when it resolves. If it rejects, the switch goes back to the old value.

### Hold

People press and hold until the fill completes, then let go to confirm. Letting go early cancels.

```bash
npx shadcn@latest add @sureui/confirm-button
```

```tsx
<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
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
/>
```

- The fill takes 1.2 seconds by default. Anything under 0.8 seconds is raised to 0.8, since a slow tap can complete a shorter hold.
- When the fill completes, the button is ready (data-state="ready") and confirms when the pointer or key is released on it. releaseLabel sets the label while ready.
- A screen reader activation, or Space or Enter released before the fill completes, arms the button instead (data-state="armed", announced as "Activate again to confirm"), and the next activation confirms. Set holdFallback="none" to turn this off.
- The armed state doesn't time out. Blur or Escape clears it.
- A mouse or finger released before the fill completes cancels.
- Releasing outside the button, moving off it or losing focus cancels, even after the fill. Set cancelHoldOnLeave={false} to let the pointer leave and come back before release, like a native button.
- Set confirmOnRelease={false} to confirm as soon as the fill completes. Pair it with undo, since people can't back out once the fill completes.
- With undo, the Undo button runs on click, so pressing it and sliding off does nothing.
- The button blocks the context menu, so a long press on a phone doesn't open it.
- With prefers-reduced-motion, fills don't animate. The hold fill appears when it completes and the undo fill clears when the window ends.
- ConfirmMenuItem with gesture="hold" keeps the menu open while held and closes it when the action commits. From the keyboard, hold Enter or Space, or press twice.
- ConfirmSwitch with gesture="hold" fills its track toward the new value while held, in the risky direction only. Its props are on the Click again page.
