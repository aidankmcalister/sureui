# SureUI

Confirmation components for [shadcn/ui](https://ui.shadcn.com). Every control shares one contract: `onConfirm`, `onCancel`, `undo`, an async pending state and full Button passthrough. Only one of them is a dialog.

| Style           | Use it for                                   |
| --------------- | -------------------------------------------- |
| Undo            | Bulk delete, archive, cancel an event        |
| Confirm button  | Archive, discard, delete an item, revoke     |
| Confirm dialog  | Leave a team, sign out everywhere (optional) |
| Type to confirm | Delete a project, repo, account or database  |

## Install

```bash
npx shadcn@latest add https://sureui.vercel.app/r/confirm-button.json
npx shadcn@latest add https://sureui.vercel.app/r/type-to-confirm.json
npx shadcn@latest add https://sureui.vercel.app/r/confirm-dialog.json
npx shadcn@latest add https://sureui.vercel.app/r/undo-toast.json
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

`onConfirm` may return a promise; the control disables itself and sets `data-state="pending"` until it settles.

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
