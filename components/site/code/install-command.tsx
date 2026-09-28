"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/site/code/copy-button"

const runners = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
} as const

type Runner = keyof typeof runners

const storageKey = "sureui-package-manager"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function read(): Runner {
  try {
    const value = localStorage.getItem(storageKey)
    return value && value in runners ? (value as Runner) : "npm"
  } catch {
    return "npm"
  }
}

function write(value: Runner) {
  try {
    localStorage.setItem(storageKey, value)
  } catch {}
  listeners.forEach((listener) => listener())
}

export function InstallCommand({ args }: { args: string }) {
  const runner = React.useSyncExternalStore<Runner>(
    subscribe,
    read,
    () => "npm"
  )
  const command = `${runners[runner]} shadcn@latest ${args}`

  return (
    <div className="rounded-md border bg-(--well) text-foreground">
      <div className="flex items-center justify-between gap-2 border-b py-1 pr-1 pl-2">
        <Tabs value={runner} onValueChange={(value) => write(value as Runner)}>
          <TabsList variant="line">
            {Object.keys(runners).map((name) => (
              <TabsTrigger
                key={name}
                value={name}
                className="font-mono text-xs"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CopyButton value={command} />
      </div>
      <p className="px-3 py-2.5 font-mono text-xs leading-5 break-all">
        {command}
      </p>
    </div>
  )
}
