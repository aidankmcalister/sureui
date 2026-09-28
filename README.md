# SureUI

Confirmation components for [shadcn/ui](https://ui.shadcn.com). `ConfirmButton`, `TypeToConfirm` and `ConfirmDialog` share one contract: `onConfirm` (which may return a promise and shows a pending state), `onCancel`, and, for the inline controls, `undo`. `ConfirmButton` also takes every Button prop. Dialogs are optional.

| Style           | Use it for                                |
| --------------- | ----------------------------------------- |
| Undo            | Trash, archive, anything you can restore  |
| Click again     | Single rows in a list                     |
| Hold            | Touch screens and small resets            |
| Dialogs         | Actions that affect other people          |
| Type to confirm | Deleting projects, databases and accounts |

## Install

SureUI is built for [Base UI](https://base-ui.com), the shadcn/ui default.

```bash
npx shadcn add @sureui/confirm-button
npx shadcn add @sureui/type-to-confirm
npx shadcn add @sureui/confirm-dialog
npx shadcn add @sureui/undo-toast
```

Each one installs on its own, into `components/ui/sureui/`. Nothing to mount. `undoToast` uses the shadcn `<Toaster />`.

## Usage

`ConfirmButton` is one Button with three gestures. Add `undo` to any of them for an inline undo window instead of committing right away:

```tsx
<ConfirmButton onConfirm={archive}>Archive</ConfirmButton>
<ConfirmButton gesture="click-again" onConfirm={archive}>Archive</ConfirmButton>
<ConfirmButton gesture="hold" variant="destructive" onConfirm={remove}>
  Hold to delete
</ConfirmButton>
<ConfirmButton undo onConfirm={moveToTrash}>Move to trash</ConfirmButton>

<TypeToConfirm phrase="acme-prod" onConfirm={deleteProject} />

if (await undoToast("Deleted 3 files")) deleteFiles(ids)
```

`onConfirm` may return a promise; the control disables itself, keeps focus, and sets `data-state="pending"` until it settles. Every control sets `data-state` to `idle`, `armed`, `holding`, `ready`, `undo` or `pending`, so you can style around it.

If `onConfirm` throws or rejects, the control returns to idle and the error reaches your app unchanged.

## Dialogs are optional

`ConfirmDialog` wraps a `ConfirmButton` or a `TypeToConfirm` (with `phrase`) around any trigger, and closes only after `onConfirm` settles:

```tsx
<ConfirmDialog
  title="Revoke this key?"
  gesture="hold"
  variant="destructive"
  onConfirm={revoke}
>
  <Button variant="outline">Revoke key</Button>
</ConfirmDialog>
```

To await it inside a handler, use `useConfirm` and render its `dialog`:

```tsx
const { confirm, dialog } = useConfirm()

async function onSubmit() {
  if (await confirm({ title: "Discard changes?" })) discard()
}
```

Pass `onConfirm` to keep the dialog open and pending until the work finishes. `confirm` then resolves `true` only if it succeeds:

```tsx
await confirm({ title: "Leave the team?", onConfirm: leaveTeam })
```

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

Registry source lives in `components/ui/sureui`. Everything in `app` and `components/site` is the docs site.

## License

MIT
