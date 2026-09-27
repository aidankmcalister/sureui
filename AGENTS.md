<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SureUI

A shadcn/ui registry of confirmation controls. Read `CONTEXT.md` for the vocabulary (confirmation, gesture, style, surface, undo window, pending, confirmation core). Work is tracked in Linear (team SureUI, `SUI-*`).

## Commands

- `pnpm check` runs lint, typecheck and tests. Run it before every commit.
- `pnpm format` formats our files; `pnpm format:check` verifies them. Stock shadcn files are ignored.
- `pnpm build` builds the registry into `public/r` and the static site into `out`.
- `CI=1 pnpm exec shadcn registry validate` checks `registry.json`.

## Layout

- `components/ui/sureui/` holds everything SureUI ships. Nothing else is published.
- `components/ui/*.tsx` outside `sureui/` are stock shadcn components from the CLI. Never edit them.
- `app/` and `components/site/` are the docs site.
- `tests/` holds Vitest tests. `tests/registry.test.ts` guards `registry.json`.

## Rules for registry code

- Every control is built on the confirmation core (`components/ui/sureui/confirmation.ts`) and shares its contract: `onConfirm` (may return a promise), `onCancel`, `undo`, Button props, `data-state`.
- Options over opinions: behavior is a prop with a sensible default (e.g. `pauseUndoOnHover`, `announcements`). A fixed rule needs a documented reason.
- Spread consumer props first, then attach handlers through `composeHandlers`, so consumer handlers always run.
- Timers decide timing. Animations are visual only and animate the CSS `scale` property, never `transform`.
- Dialogs are optional. Only `confirm-dialog.tsx` may import `alert-dialog`. Only `undo-toast.tsx` may import `sonner`.
- Registry files start with `"use client"`, import only from `@/components/ui/*`, `@/lib/utils` and npm packages, and have no comments.
- Every file in `registry.json` has `"target": "@ui/sureui/<file name>"`, and every item declares every SureUI file, stock component and package it imports.
- Base UI, not Radix: use `render={...}`, not `asChild`.
- Match stock shadcn style: `import * as React from "react"`, `function` declarations, `type` not `interface`, one export block at the bottom.
- Test through the public interface with Vitest fake timers. Never patch `Element.prototype.animate` or `window.matchMedia`.

## Writing

- SureUI is free and open source. Site copy states plain facts, not marketing lines.
- Commits are plain conventional commits, e.g. `fix: keep undo from committing twice`.
