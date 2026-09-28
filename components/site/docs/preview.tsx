"use client"

import * as React from "react"

import {
  SiteTab,
  SiteTabPanel,
  SiteTabs,
  SiteTabsList,
} from "@/components/site/ui/tabs"
import { Label } from "@/components/site/layout/frame"

const ReportContext = React.createContext<(entry: string) => void>(() => {})

export function useReport() {
  return React.useContext(ReportContext)
}

export function Preview({
  figure,
  code,
  children,
}: {
  figure: string
  code: React.ReactNode
  children: React.ReactNode
}) {
  const [entry, setEntry] = React.useState("waiting for you to try it")

  return (
    <div className="border border-(--rule) bg-(--well) text-foreground">
      <SiteTabs defaultValue="preview">
        <div className="flex h-10 items-center justify-between gap-4 border-b border-(--rule) pr-4 pl-2">
          <SiteTabsList>
            <SiteTab value="preview">Preview</SiteTab>
            <SiteTab value="code">Code</SiteTab>
          </SiteTabsList>
          <Label>Fig. {figure}</Label>
        </div>
        <SiteTabPanel value="preview">
          <ReportContext value={setEntry}>
            <div className="flex min-h-64 items-center justify-center p-6">
              {children}
            </div>
          </ReportContext>
          <p
            aria-live="polite"
            className="flex items-baseline gap-3 border-t border-(--rule) px-4 py-2.5 font-mono text-xs"
          >
            <Label>Await log</Label>
            <span className="text-(--ink)">{entry}</span>
          </p>
        </SiteTabPanel>
        <SiteTabPanel value="code">{code}</SiteTabPanel>
      </SiteTabs>
    </div>
  )
}
