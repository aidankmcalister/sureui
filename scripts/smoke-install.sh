#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
shadcn="$root/node_modules/.bin/shadcn"
items=(confirm-button type-to-confirm confirm-dialog undo-toast rules)

cd "$root"
pnpm registry:build

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
cd "$workdir"

"$shadcn" init --defaults --no-monorepo --name app --silent
cd app

for item in "${items[@]}"; do
  echo "Installing $item"
  "$shadcn" add "$root/public/r/$item.json" --yes --overwrite --silent
done

for file in fill.ts undo-window.ts confirmation.ts confirm-button.tsx type-to-confirm.tsx confirm-dialog.tsx undo-toast.tsx; do
  test -f "components/ui/sureui/$file" || { echo "Missing components/ui/sureui/$file"; exit 1; }
done

cmp .claude/skills/sureui/SKILL.md "$root/skills/sureui/SKILL.md"
cmp .cursor/rules/sureui.mdc "$root/rules/sureui.mdc"

pnpm exec tsc --noEmit
echo "All ${#items[@]} items installed and type-checked"
