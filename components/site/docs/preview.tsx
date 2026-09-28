"use client"

import * as React from "react"

import {
  SiteTab,
  SiteTabPanel,
  SiteTabs,
  SiteTabsList,
} from "@/components/site/ui/tabs"
import { Label } from "@/components/site/layout/frame"
import { ResetButton } from "@/components/site/ui/reset"

type Log = (message: string) => void

type Line = { id: number; message: string }

const LogContext = React.createContext<Log>(() => {})

export function useLog() {
  return React.useContext(LogContext)
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
  const [line, setLine] = React.useState<Line | null>(null)
  const [version, setVersion] = React.useState(0)
  const nextId = React.useRef(0)

  const push = React.useCallback<Log>((message) => {
    setLine({ id: nextId.current++, message })
  }, [])

  return (
    <div className="border border-(--rule) bg-(--well) text-foreground">
      <SiteTabs defaultValue="preview">
        <div className="flex h-10 items-center justify-between gap-4 border-b border-(--rule) pr-1.5 pl-2">
          <SiteTabsList>
            <SiteTab value="preview">Preview</SiteTab>
            <SiteTab value="code">Code</SiteTab>
          </SiteTabsList>
          <div className="flex items-center gap-2">
            <Label>Fig. {figure}</Label>
            <ResetButton
              onReset={() => {
                setVersion((value) => value + 1)
                setLine(null)
              }}
            />
          </div>
        </div>
        <SiteTabPanel value="preview" className="min-w-0">
          <LogContext value={push}>
            <div
              key={version}
              className="flex min-h-48 items-center justify-center p-6"
            >
              {children}
            </div>
          </LogContext>
          {log && (
            <p
              role="log"
              aria-label="Console"
              className="flex h-10 items-center gap-2 truncate border-t border-(--rule) px-4 font-mono text-xs"
            >
              {line ? (
                <>
                  <span aria-hidden className="text-(--mark-text)">
                    ›
                  </span>
                  <span key={line.id} className="truncate text-(--ink)">
                    {line.message}
                  </span>
                </>
              ) : (
                <span className="text-(--ink-label)">
                  {"// console.log output shows up here"}
                </span>
              )}
            </p>
          )}
        </SiteTabPanel>
        <SiteTabPanel value="code" className="min-w-0">
          {code}
        </SiteTabPanel>
      </SiteTabs>
    </div>
  )
}
