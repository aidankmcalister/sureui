#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
shadcn="$root/node_modules/.bin/shadcn"
list() {
  node -e '
    const registry = require(process.argv[1])
    const blocks = process.argv[2] === "blocks"
    for (const item of registry.items) {
      if ((item.type === "registry:block") === blocks) console.log(item.name)
    }
  ' "$root/registry.json" "$1"
}
read -r -a items <<<"$(list items | tr "\n" " ")"
read -r -a blocks <<<"$(list blocks | tr "\n" " ")"
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
disown "$server"
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

for block in ${blocks[@]+"${blocks[@]}"}; do
  echo "Installing @sureui/$block"
  "$shadcn" add "@sureui/$block" --yes --overwrite --silent
done

node -e '
  const fs = require("node:fs")
  const [registryPath] = process.argv.slice(1)
  const registry = require(registryPath)
  const places = [
    ["@ui/", "components/ui/"],
    ["@components/", "components/"],
  ]
  let missing = 0
  for (const item of registry.items) {
    for (const file of item.files) {
      const [alias, dir] = places.find(([prefix]) => file.target.startsWith(prefix))
      const installed = dir + file.target.slice(alias.length)
      if (!fs.existsSync(installed)) {
        console.log(`Missing ${installed} from ${item.name}`)
        missing++
      }
    }
  }
  process.exit(missing ? 1 : 0)
' "$root/registry.json"

pnpm exec tsc --noEmit
echo "All ${#items[@]} items and ${#blocks[@]} blocks installed and type-checked"
