<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SureUI

A shadcn/ui registry of confirmation controls. Work is tracked in Linear (team SureUI, `SUI-*`).

The pitch, everywhere it's written (README, home page, docs, llms.txt, the skill, package.json): "Open source confirmation components for shadcn/ui: undo, hold to confirm, type to confirm and more. Built on Base UI." It's the line on the official shadcn directory. SureUI stays a confirmation library: a new item needs a real request, or a gap that line promises and SureUI doesn't deliver.

## Vocabulary

These terms are the shared vocabulary for code, docs and plans.

**Confirmation**: one attempt to get intent for an action. It starts idle and ends by committing (`onConfirm`) or cancelling (`onCancel`). If `onConfirm` throws or rejects, the control returns to idle and the error reaches your app unchanged. With `onConfirmError`, the error goes to that handler instead, and the control shows `errorLabel` and sets `data-error` until the next attempt.

**Gesture**: how a person proves intent. `click` (one click), `click-again` (arm, then click again within a timeout), `hold` (press and hold for a duration), `type` (type a phrase, handled by TypeToConfirm).

**Style**: a named way to confirm: undo, click again, hold, type to confirm, a dialog or a popover. Components combine them, and each component's docs page shows its styles as examples.

**Surface**: where a confirmation appears. Inline is the default. A dialog is an optional surface that wraps an inline control, never the default.

**Undo window**: an optional delay after confirming, before `onConfirm` runs. `undo="manual"` has no timer: it commits when a press or focus lands outside the control. The control shows "Undo" while it drains. Undoing cancels. Leaving the control and coming back to it, by pointer or focus, pauses the window until you leave again, and a hidden tab pauses it until the tab is visible. Unmounting during the window, including closing the tab, discards the confirmation without calling either handler. ConfirmMenuItem is the exception: closing its menu during the window commits, since a menu closes as soon as people move on.

**Pending**: the state while an async `onConfirm` is running. The control is disabled until it settles.

**Confirmation core**: the module every control is built on (`components/ui/sureui/confirmation.ts`). It owns the state machine, the gesture rules (which pointer, key and focus events arm, hold, confirm, cancel or undo), timing and handler composition. `useConfirmation` returns the state, a fill ref and `getTriggerProps`, which a control spreads on its trigger. Controls are thin adapters over it: labels, announcements and styling. `useConfirmation` and its options are public and documented on the Confirmation Core page, so changes to them are breaking; the other exports (`useConfirmationLabels`, `useFill`, `startUndoWindow` and the rest) are internal.

**Undo toast**: `undoToast()`, an optional Sonner-based undo for actions whose control disappears. It is separate from the core on purpose: its lifecycle belongs to Sonner. It shares the undo window's timing with the core (`startUndoWindow` in `confirmation.ts`), but pauses as soon as the toast is hovered or focused, since a toast appears away from the control that was clicked.

## Commands

- `pnpm check` runs lint, typecheck and tests. Run it before every commit.
- `pnpm format` formats our files; `pnpm format:check` verifies them. Stock shadcn files are ignored.
- `pnpm build` builds the registry into `public/r` and the static site into `out`.
- `CI=1 pnpm exec shadcn registry validate` checks `registry.json`.

## Layout

- `components/ui/sureui/` holds everything SureUI ships. Nothing else is published.
- `components/ui/*.tsx` outside `sureui/` are stock shadcn components from the CLI. Never edit them.
- `app/`, `components/site/`, `lib/site/` and `content/docs/` are the docs site:
  - `components/site/layout/` header, footer and page frame; `docs/` docs page pieces, the MDX element styles (`mdx.tsx`) and the live examples; `code/` code blocks and install commands; `home/` the home page and its examples; `og/` the Open Graph card.
  - `content/docs/<section>/<slug>.mdx` holds every docs page, one per registry item plus Introduction and Installation. Each section folder has a `meta.json` with its `title` and `pages` in nav order (`"..."` stands for every other page in the folder, alphabetically), and `content/docs/meta.json` lists the section folders in order. Frontmatter has `title` and `description`. Pages use Markdown plus three tags: `<Example name="<slug>/<name>" />`, `<Install args="add @sureui/<item>" />` and `<Chooser />` (the "Which control?" picker on the guide page). `lib/site/choose.ts` is the one decision table behind it: each answer names a docs example, which the picker runs live (the `demos` map in `components/site/docs/chooser-picker.tsx`) and shows highlighted, and which `llms.txt` prints as the rule's code. `tests/choose.test.ts` fails when an answer points to a missing example or demo.
  - `components/site/docs/examples/<slug>/<name>.tsx` are the live examples. Each one shows only the component its page is about, with the least code that makes the point. The Code tab shows the file itself (keeping `"use client"` so it pastes into an App Router page) without the docs helper lines, so keep them short, realistic and uncommented. Handlers are named actions: `const { deleteProject } = useActions()` and `onConfirm={deleteProject}`. The strip under the preview shows each call with its arguments, and `useActions({ deploy: { wait: 2000, fail: "Network error" } })` makes one async (failing every other call with `fail`). For a value worth changing (a timing or a toggle that is the point of the example), write `control("name", default)` with `const control = useControl()`. The Preview header shows a number field (milliseconds, or a plain number for `count`) or a true/false toggle, and the Code tab shows the chosen value.
  - `lib/site/docs.ts` reads every docs page once and exposes `sections`, `pages`, `pageAt(href)`, `staticParams()` and `searchEntries()` (the header search index); routes, nav, header and footer read those instead of rebuilding them. `lib/site/examples.ts` reads the example files, and `lib/site/example-source.ts` turns one into its controls and the code that the Code tab, the copy button and `llms.txt` show. `lib/site/llms.ts` builds `llms.txt` and the markdown pages from the same MDX, so the HTML pages and `llms.txt` never disagree. `lib/site/config.ts` has the site and GitHub URLs. `lib/site/registry.ts` reads `registry.json` for the component and block lists and the names code blocks highlight; `tests/registry.test.ts` fails when the README table, the introduction or the docs nav miss an item.
  - Each component page follows the same order: main example, Installation, Usage, Examples (one `###` per option), API reference (a `| Prop | Type | Default |` table per component, headed by its exact name), Accessibility. `tests/docs.test.tsx` checks every props table against the component's types.
  - The site has its own look, separate from the product. SureUI's controls are built on stock shadcn, so site chrome must never use stock `components/ui/*`: use `components/site/ui/` (site button, tabs, drawer, built on Base UI) and the frame pieces in `components/site/layout/frame.tsx`. Only the docs examples and the home examples render stock shadcn, because they show the product.
- `skills/sureui/` is the agent skill, installed with `npx skills add aidankmcalister/sureui`: `SKILL.md` plus `rules/*.md`. It's written by hand, so update it when an item, prop or default it mentions changes. `tests/choose.test.ts` fails when it misses an item or links to a page that doesn't exist.
- `tests/` holds Vitest tests. `tests/registry.test.ts` guards `registry.json`.

## Rules for registry code

- Every control is built on the confirmation core (`components/ui/sureui/confirmation.ts`) and shares its contract: `onConfirm` (may return a promise), `onCancel`, `undo`, Button props, `data-state`. `ToolApproval` is the exception: it composes ConfirmButton and TypeToConfirm, and its callback is `onRespond` so it takes `addToolApprovalResponse` directly.
- Options over opinions: behavior is a prop with a sensible default (e.g. `pauseUndoOnHover`, `announcements`), but only options something needs: remove an option nobody uses rather than keep it. A fixed rule needs a documented reason.
- Gesture rules live in the core. A control spreads `getTriggerProps(props)` on its trigger, which keeps consumer props and runs consumer handlers before the core's (through `composeHandlers`).
- Undo timing lives in `startUndoWindow` in `confirmation.ts` (duration limits, pausing, remaining time, hidden tab). The core, `undoable.tsx` and `undo-toast.tsx` all use it; don't time an undo window anywhere else.
- Timers decide timing. Animations are visual only and animate the CSS `scale` property (or `stroke-dashoffset` when the fill is an SVG shape, as in ConfirmSwitch), never `transform`.
- State logic never touches an animation. The core reports which fill runs (`from`, `to`, `duration`, `startedAt`) and whether it is paused; `playFill` and `useFill` in `confirmation.ts` play it. With `prefers-reduced-motion`, every fill jumps to its end state when its time is up instead of moving.
- Dialogs are optional. Only `confirm-dialog.tsx` may import `alert-dialog`. Only `undo-toast.tsx` may import `sonner`.
- Registry files start with `"use client"`, import only from `@/components/ui/*`, `@/lib/utils` and npm packages, and have no comments.
- Every component file in `registry.json` has `"target": "@ui/sureui/<file name>"`, and every item declares every SureUI file, stock component and package it imports.
- Blocks (`"type": "registry:block"`, named `<thing>-01`) live in `components/blocks/<name>/` and install to `@components/<file>`. They are app code: they use SureUI controls through `registryDependencies` (`"@sureui/confirm-button"`), never inline copies, and keep sample data inline because the CLI doesn't rewrite imports between block files outside `components/`. `tests/registry.test.ts` checks that every block import is shipped or declared.
- Base UI, not Radix: use `render={...}`, not `asChild`.
- Match stock shadcn style: `import * as React from "react"`, `function` declarations, `type` for unions and helpers, one export block at the bottom. Public props and options are an `interface` (extending the stock component's props or the shared options), and components take `props` and unpack it in the body, so an editor hover shows a short name instead of the whole type.
- Test through the public interface with Vitest fake timers. Never patch `Element.prototype.animate` or `window.matchMedia`.

## Writing

- SureUI is free and open source. Site copy states plain facts, not marketing lines.
- Commits are plain conventional commits, e.g. `fix: keep undo from committing twice`.
