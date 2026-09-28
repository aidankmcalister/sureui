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
- `skills/sureui/SKILL.md` and `rules/sureui.mdc` are agent rules generated from `lib/site/` by `pnpm rules`, which `pnpm registry:build` runs. Don't edit them by hand. The `rules` registry item installs them, and `npx skills add aidankmcalister/sureui` installs the skill.
- `components/ui/*.tsx` outside `sureui/` are stock shadcn components from the CLI. Never edit them.
- `app/`, `components/site/` and `lib/site/` are the docs site:
  - `components/site/layout/` header, footer and page frame; `docs/` docs page pieces and demos; `code/` code blocks and install commands; `home/` the home page and its examples; `og/` the Open Graph card.
  - `lib/site/` holds the content, not components: `config.ts` (URLs, registry items), `styles.ts` (one entry per confirmation style, with its props and behavior), `pages.ts` (docs pages and their copy), `llms.ts` (builds `llms.txt` and the markdown pages from that data).
  - Docs copy lives in `lib/site/`, so the HTML pages and `llms.txt` never disagree. Edit it there, not in the page files.
  - The site has its own look, separate from the product. SureUI's controls are built on stock shadcn, so site chrome must never use stock `components/ui/*`: use `components/site/ui/` (site button, tabs, drawer, built on Base UI) and the frame pieces in `components/site/layout/frame.tsx`. Only the demos in `components/site/docs/demos.tsx` and the home examples render stock shadcn, because they show the product.
- `tests/` holds Vitest tests. `tests/registry.test.ts` guards `registry.json`.

## Rules for registry code

- Every control is built on the confirmation core (`components/ui/sureui/confirmation.ts`) and shares its contract: `onConfirm` (may return a promise), `onCancel`, `undo`, Button props, `data-state`.
- Options over opinions: behavior is a prop with a sensible default (e.g. `pauseUndoOnHover`, `announcements`). A fixed rule needs a documented reason.
- Gesture rules live in the core. A control spreads `getTriggerProps(props)` on its trigger, which keeps consumer props and runs consumer handlers before the core's (through `composeHandlers`).
- Undo timing lives in `undo-window.ts` (duration limits, pausing, remaining time, hidden tab). The core and `undo-toast.tsx` both use it; don't time an undo window anywhere else.
- Timers decide timing. Animations are visual only and animate the CSS `scale` property, never `transform`.
- State logic never touches an animation. The core reports which fill runs (`from`, `to`, `duration`, `startedAt`) and whether it is paused; `fill.ts` plays it. With `prefers-reduced-motion`, every fill jumps to its end state when its time is up instead of moving.
- Dialogs are optional. Only `confirm-dialog.tsx` may import `alert-dialog`. Only `undo-toast.tsx` may import `sonner`.
- Registry files start with `"use client"`, import only from `@/components/ui/*`, `@/lib/utils` and npm packages, and have no comments.
- Every component file in `registry.json` has `"target": "@ui/sureui/<file name>"`, and every item declares every SureUI file, stock component and package it imports. The `rules` item is the exception: its files target `~/` paths in the project root.
- Base UI, not Radix: use `render={...}`, not `asChild`.
- Match stock shadcn style: `import * as React from "react"`, `function` declarations, `type` not `interface`, one export block at the bottom.
- Test through the public interface with Vitest fake timers. Never patch `Element.prototype.animate` or `window.matchMedia`.

## Writing

- SureUI is free and open source. Site copy states plain facts, not marketing lines.
- Commits are plain conventional commits, e.g. `fix: keep undo from committing twice`.
