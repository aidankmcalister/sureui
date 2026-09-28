# SureUI

Confirmation components for [shadcn/ui](https://ui.shadcn.com), built on [Base UI](https://base-ui.com). Free and open source, MIT licensed.

When every action opens an "Are you sure?" dialog, people stop reading and confirm on reflex. SureUI has other ways to ask: undo, a second click, a press and hold, a typed name, or a dialog when you want one. The components install into your app with the shadcn CLI and look like stock shadcn, so they fit whatever your app already looks like.

| Component         | What it does                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `ConfirmButton`   | Confirms on a click, a second click or a press and hold, with optional undo |
| `ConfirmMenuItem` | The same gestures in dropdown and context menus                             |
| `TypeToConfirm`   | Unlocks only after the exact phrase is typed                                |
| `ConfirmDialog`   | An optional alert dialog, with an awaitable `useConfirm`                    |
| `ConfirmPopover`  | A one-line confirmation anchored to its trigger                             |
| `Consequences`    | Lists what a confirmation will remove, with counts and names                |
| `undoToast`       | A toast with Undo that resolves once nobody undoes                          |
| `Undoable`        | Collapses a removed row in place to a label and an Undo button              |

## Install

Add the registry to your `components.json`:

```json
{
  "registries": {
    "@sureui": "https://sureui.com/r/{name}.json"
  }
}
```

Then add the items you need. Each one installs on its own into `components/ui/sureui/`:

```bash
npx shadcn@latest add @sureui/confirm-button
```

`undoToast` uses the shadcn `<Toaster />`. Nothing else needs mounting.

Full docs are at [sureui.com/docs](https://sureui.com/docs). Coding agents can read [sureui.com/llms.txt](https://sureui.com/llms.txt), or every page at once in [llms-full.txt](https://sureui.com/llms-full.txt).

## Usage

Every component takes the same `onConfirm`. `ConfirmButton` also takes every Button prop:

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

Registry source lives in `components/ui/sureui`. The docs pages are MDX in `content/docs`, and everything in `app`, `components/site` and `lib/site` is the docs site.

## License

MIT
