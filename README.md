<div align="center">
  <h1>SureUI</h1>
  <img src="https://sureui.com/opengraph-image" width="640" alt="Confirmation components for shadcn/ui, built on Base UI" />
  <p>
    <a href="LICENSE"><img src="https://www.shieldcn.dev/github/license/aidankmcalister/sureui.svg?variant=default&amp;size=sm&amp;font=geist-mono" alt="License" /></a>
    <a href="https://github.com/aidankmcalister/sureui/stargazers"><img src="https://www.shieldcn.dev/github/stars/aidankmcalister/sureui.svg?variant=default&amp;size=sm&amp;font=geist-mono" alt="GitHub Stars" /></a>
  </p>
  <p>
    <a href="https://sureui.com/docs">Docs</a> ·
    <a href="https://sureui.com/blocks">Blocks</a> ·
    <a href="https://sureui.com/llms.txt">llms.txt</a>
  </p>
</div>

When every action opens an "Are you sure?" dialog, people stop reading and confirm on reflex. SureUI has other ways to ask: undo, a second click, a press and hold, a typed name, or a dialog. The components install into your app with the shadcn CLI and look like stock shadcn, so they fit whatever your app already looks like. Free and open source.

| Component           | What it does                                                                |
| ------------------- | --------------------------------------------------------------------------- |
| `ConfirmButton`     | Confirms on a click, a second click or a press and hold, with optional undo |
| `ConfirmMenuItem`   | The same gestures in dropdown and context menus                             |
| `ConfirmSwitch`     | A switch that moves right away and can be flipped back to undo              |
| `TypeToConfirm`     | Unlocks only after the exact phrase is typed                                |
| `ConfirmDialog`     | An alert dialog around any confirmation, with an awaitable `useConfirm`     |
| `ConfirmPopover`    | A one-line confirmation anchored to its trigger                             |
| `Consequences`      | Lists what a confirmation will remove, with counts and names                |
| `undoToast`         | A toast with Undo that resolves once nobody undoes                          |
| `Undoable`          | Collapses a removed row in place to a label and an Undo button              |
| `useUnsavedChanges` | Asks before unsaved changes are lost, on a page or in a dialog              |
| `ToolApproval`      | Approves or denies an AI SDK tool call with a gesture that matches its risk |

The [blocks](https://sureui.com/blocks) are full screens built from these components, installed as app code you edit.

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

Components also install straight from GitHub, with no registry entry. Blocks need the entry, because they depend on other `@sureui` items:

```bash
npx shadcn@latest add aidankmcalister/sureui/confirm-button
```

> [!NOTE]
> `undoToast` uses the shadcn `<Toaster />`. Nothing else needs mounting.

> [!TIP]
> Coding agents can read [llms.txt](https://sureui.com/llms.txt), or every docs page at once in [llms-full.txt](https://sureui.com/llms-full.txt).

## Usage

Every component except `ToolApproval` takes the same `onConfirm`; `ToolApproval` answers the AI SDK through `onRespond`. `ConfirmButton` also takes every Button prop:

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

If `onConfirm` throws or rejects, the control returns to idle and the error reaches your app unchanged. Pass `onConfirmError` to handle it there instead, with an `errorLabel` that invites a retry.

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

Registry source lives in `components/ui/sureui`. The docs pages are MDX in `content/docs`, and everything in `app`, `components/site` and `lib/site` is the docs site.
