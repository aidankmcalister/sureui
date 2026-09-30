# Setup

## Requirements

- A shadcn/ui project on Base UI, the shadcn default. `npx shadcn@latest info --json` shows it. Radix projects aren't supported, because the components use Base UI's `render` prop.
- Nothing to configure: `@sureui` is in the shadcn registry index.

## Installing

SureUI isn't an npm package. Its components install as source.

**Avoid**

```bash
npm install sureui
```

**Use**

```bash
npx shadcn@latest add @sureui/confirm-dialog @sureui/consequences
```

Install only what's used. Each item brings the shared core, `confirmation.ts`, and the CLI adds any stock shadcn components it needs. Files land in `components/ui/sureui/`:

```tsx
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
```

## Client components

The components take functions like `onConfirm`, so in the Next.js App Router they render from a file that starts with `"use client"`. A Server Component can't pass them functions.

## The Toaster

`undoToast` shows a shadcn toast. Mount `<Toaster />` from `@/components/ui/sonner` in the root layout. Nothing else needs setup.

Reference: https://sureui.com/docs/installation
