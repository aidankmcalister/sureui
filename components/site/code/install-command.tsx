"use client"

import * as React from "react"

import { SiteTab, SiteTabs, SiteTabsList } from "@/components/site/ui/tabs"
import { CopyButton } from "@/components/site/code/copy-button"
import { Label } from "@/components/site/layout/frame"

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

function useRunner() {
  return React.useSyncExternalStore<Runner>(subscribe, read, () => "npm")
}

export function InstallInline({ args }: { args: string }) {
  const command = `${runners[useRunner()]} shadcn@latest ${args}`

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="truncate font-mono text-xs text-(--ink-muted) max-sm:hidden">
        {command}
      </span>
      <Label className="sm:hidden">Install</Label>
      <CopyButton value={command} />
    </div>
  )
}

export function InstallCommand({ args }: { args: string }) {
  const runner = useRunner()
  const command = `${runners[runner]} shadcn@latest ${args}`

  return (
    <div className="border border-(--rule) bg-(--well) text-(--ink)">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-(--rule) pr-1.5 pl-2">
        <SiteTabs
          value={runner}
          onValueChange={(value) => write(value as Runner)}
          className="h-full"
        >
          <SiteTabsList>
            {Object.keys(runners).map((name) => (
              <SiteTab key={name} value={name}>
                {name}
              </SiteTab>
            ))}
          </SiteTabsList>
        </SiteTabs>
        <CopyButton value={command} />
      </div>
      <p className="px-4 py-3 font-mono text-[13px] leading-6 break-all">
        {command}
      </p>
    </div>
  )
}
