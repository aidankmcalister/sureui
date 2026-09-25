# SureUI

Confirmation components for [shadcn/ui](https://ui.shadcn.com). Five ways to ask "are you sure?" behind one awaitable API.

| Style           | Friction      | Use it for                                  |
| --------------- | ------------- | ------------------------------------------- |
| Undo            | None up front | Bulk delete, archive, cancel an event       |
| Click again     | Low           | Archive, discard, remove from a list        |
| Hold            | Low           | Delete an item, reset settings, revoke      |
| Dialogs         | Medium        | Leave a team, sign out everywhere, rename   |
| Type to confirm | High          | Delete a project, repo, account or database |

## Install

```bash
npx shadcn@latest add https://sureui.vercel.app/r/sure.json
npx shadcn@latest add https://sureui.vercel.app/r/click-again-button.json
npx shadcn@latest add https://sureui.vercel.app/r/hold-button.json
```

Mount `<Sure />` and `<Toaster />` once in your root layout.

```tsx
import { Toaster } from "@/components/ui/sonner"
import { Sure } from "@/components/ui/sure"

<Sure />
<Toaster />
```

## Usage

```tsx
import { sure } from "@/components/ui/sure"

if (await sure.confirm({ title: "Leave the Design team?" })) leaveTeam()
if (await sure.type({ title: "Delete acme-prod?", phrase: "acme-prod" })) remove()
if (await sure.undo("Deleted 3 files")) deleteFiles(ids)

<ClickAgainButton onConfirm={archive}>Archive</ClickAgainButton>
<HoldButton variant="destructive" onConfirm={remove}>Hold to delete</HoldButton>
```

Every promise settles. Cancel, Escape, abort and unmount resolve `false` (or `null` for `sure.prompt`).

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

Registry source lives in `components/ui`. Everything in `app` and `components/site` is the docs site.

## License

MIT
