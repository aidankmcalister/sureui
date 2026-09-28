#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
shadcn="$root/node_modules/.bin/shadcn"
items=(confirm-button confirm-menu-item type-to-confirm confirm-dialog undo-toast rules)
blocks=(danger-zone-01 api-keys-01 delete-account-01)
block_files=(danger-zone.tsx api-keys.tsx create-key-dialog.tsx delete-account.tsx)
port=$((20000 + RANDOM % 20000))

cd "$root"
pnpm registry:build

workdir="$(mktemp -d)"
node -e '
  const http = require("node:http")
  const fs = require("node:fs")
  const path = require("node:path")
  const [dir, port] = process.argv.slice(1)
  http
    .createServer((req, res) => {
      const file = path.join(dir, decodeURIComponent(req.url.split("?")[0]))
      fs.readFile(file, (error, data) => {
        if (error) return res.writeHead(404).end()
        res.writeHead(200, { "Content-Type": "application/json" }).end(data)
      })
    })
    .listen(Number(port), "127.0.0.1")
' "$root/public" "$port" &
server=$!
trap 'kill "$server" 2>/dev/null || true; rm -rf "$workdir"' EXIT
cd "$workdir"

"$shadcn" init --defaults --no-monorepo --name app --silent
cd app

node -e '
  const fs = require("node:fs")
  const config = JSON.parse(fs.readFileSync("components.json", "utf8"))
  config.registries = { ...config.registries, "@sureui": process.argv[1] }
  fs.writeFileSync("components.json", JSON.stringify(config, null, 2))
' "http://127.0.0.1:$port/r/{name}.json"

for _ in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$port/r/registry.json" >/dev/null && break
  sleep 0.1
done

for item in "${items[@]}"; do
  echo "Installing $item"
  "$shadcn" add "$root/public/r/$item.json" --yes --overwrite --silent
done

for block in "${blocks[@]}"; do
  echo "Installing @sureui/$block"
  "$shadcn" add "@sureui/$block" --yes --overwrite --silent
done

for file in fill.ts undo-window.ts confirmation.ts confirm-button.tsx confirm-menu-item.tsx type-to-confirm.tsx confirm-dialog.tsx undo-toast.tsx; do
  test -f "components/ui/sureui/$file" || { echo "Missing components/ui/sureui/$file"; exit 1; }
done

for file in "${block_files[@]}"; do
  test -f "components/$file" || { echo "Missing components/$file"; exit 1; }
done

cmp .claude/skills/sureui/SKILL.md "$root/skills/sureui/SKILL.md"
cmp .cursor/rules/sureui.mdc "$root/rules/sureui.mdc"

pnpm exec tsc --noEmit
echo "All ${#items[@]} items and ${#blocks[@]} blocks installed and type-checked"
