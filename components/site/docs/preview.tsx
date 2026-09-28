"use client"

import * as React from "react"

import {
  SiteTab,
  SiteTabPanel,
  SiteTabs,
  SiteTabsList,
} from "@/components/site/ui/tabs"
import { Label } from "@/components/site/layout/frame"

type Report = (call: string, note?: string) => void

type Line = { id: number; call: string; note?: string }

const ReportContext = React.createContext<Report>(() => {})

export function useReport() {
  return React.useContext(ReportContext)
}

export function Preview({
  figure,
  code,
  log = true,
  children,
}: {
  figure: string
  code: React.ReactNode
  log?: boolean
  children: React.ReactNode
}) {
  const [lines, setLines] = React.useState<Line[]>([])
  const nextId = React.useRef(0)

  const report = React.useCallback<Report>((call, note) => {
    const id = nextId.current++
    setLines((current) => [...current, { id, call, note }].slice(-3))
  }, [])

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
          <ReportContext value={report}>
            <div className="flex min-h-64 items-center justify-center p-6">
              {children}
            </div>
          </ReportContext>
          {log && (
            <ol
              role="log"
              aria-label="Callbacks"
              className="flex h-20 flex-col justify-end border-t border-(--rule) px-4 py-2.5 font-mono text-xs leading-5"
            >
              {lines.length === 0 ? (
                <li className="text-(--ink-label)">
                  {"// try it, and each callback shows up here"}
                </li>
              ) : (
                lines.map((line, index) => (
                  <li
                    key={line.id}
                    className="flex min-w-0 gap-2"
                    style={{
                      opacity: 0.45 + ((index + 1) / lines.length) * 0.55,
                    }}
                  >
                    <span aria-hidden className="text-(--mark-text)">
                      ›
                    </span>
                    <span className="shrink-0 text-(--ink)">{line.call}</span>
                    {line.note && (
                      <span className="truncate text-(--ink-label)">
                        {`// ${line.note}`}
                      </span>
                    )}
                  </li>
                ))
              )}
            </ol>
          )}
        </SiteTabPanel>
        <SiteTabPanel value="code">{code}</SiteTabPanel>
      </SiteTabs>
    </div>
  )
}
