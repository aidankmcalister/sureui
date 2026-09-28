"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SiteTab,
  SiteTabPanel,
  SiteTabs,
  SiteTabsList,
} from "@/components/site/ui/tabs"
import { SiteButton } from "@/components/site/ui/button"
import { Label } from "@/components/site/layout/frame"

const ReportContext = React.createContext<(entry: string) => void>(() => {})

export function useReport() {
  return React.useContext(ReportContext)
}

export function Preview({
  figure,
  label,
  code,
  log = true,
  resettable = false,
  stageClassName,
  children,
}: {
  figure?: string
  label?: string
  code: React.ReactNode
  log?: boolean
  resettable?: boolean
  stageClassName?: string
  children: React.ReactNode
}) {
  const [entry, setEntry] = React.useState("waiting for you to try it")
  const [run, setRun] = React.useState(0)
  const [tab, setTab] = React.useState("preview")

  return (
    <div className="border border-(--rule) bg-(--well) text-foreground">
      <SiteTabs value={tab} onValueChange={setTab} className="grid-cols-1">
        <div className="flex h-10 items-center justify-between gap-4 border-b border-(--rule) pr-4 pl-2">
          <SiteTabsList>
            <SiteTab value="preview">Preview</SiteTab>
            <SiteTab value="code">Code</SiteTab>
          </SiteTabsList>
          <div className="flex min-w-0 items-center gap-3">
            <Label className="truncate">
              {label ?? (figure ? `Fig. ${figure}` : null)}
            </Label>
            {resettable && tab === "preview" && (
              <SiteButton
                variant="ghost"
                size="icon"
                aria-label="Reset preview"
                title="Reset preview"
                className="-mr-2.5"
                onClick={() => setRun((count) => count + 1)}
              >
                <RotateCcwIcon />
              </SiteButton>
            )}
          </div>
        </div>
        <SiteTabPanel value="preview">
          <ReportContext value={setEntry}>
            <div
              key={run}
              className={cn(
                "flex min-h-64 items-center justify-center p-6",
                stageClassName
              )}
            >
              {children}
            </div>
          </ReportContext>
          {log && (
            <p
              aria-live="polite"
              className="flex items-baseline gap-3 border-t border-(--rule) px-4 py-2.5 font-mono text-xs"
            >
              <Label>Await log</Label>
              <span className="text-(--ink)">{entry}</span>
            </p>
          )}
        </SiteTabPanel>
        <SiteTabPanel value="code">{code}</SiteTabPanel>
      </SiteTabs>
    </div>
  )
}
