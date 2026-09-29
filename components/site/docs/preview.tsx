"use client"

import * as React from "react"

import {
  SiteTab,
  SiteTabPanel,
  SiteTabs,
  SiteTabsList,
} from "@/components/site/ui/tabs"
import { ControlScope, ExampleControls } from "@/components/site/docs/controls"
import {
  ResetContent,
  ResetScope,
  ResetTrigger,
} from "@/components/site/ui/reset"
import { defaultValues, type Control } from "@/lib/site/example-source"

export { useControl } from "@/components/site/docs/controls"

type Log = (message: string) => void

type Line = { id: number; message: string }

const LogContext = React.createContext<Log>(() => {})

export function useLog() {
  return React.useContext(LogContext)
}

function Stage({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const stage = ref.current
    if (stage) stage.style.minHeight = `${stage.offsetHeight}px`
  }, [])

  return (
    <div ref={ref} className="grid w-full content-start justify-items-center">
      {children}
    </div>
  )
}

export function Preview({
  code,
  controls = [],
  log,
  children,
}: {
  code: React.ReactNode
  controls?: Control[]
  log: boolean
  children: React.ReactNode
}) {
  const [values, setValues] = React.useState(() => defaultValues(controls))
  const [line, setLine] = React.useState<Line | null>(null)
  const nextId = React.useRef(0)

  const push = React.useCallback<Log>((message) => {
    setLine({ id: nextId.current++, message })
  }, [])

  return (
    <div className="border border-(--rule) bg-(--well) text-foreground">
      <ResetScope onReset={() => setLine(null)}>
        <ControlScope values={values}>
          <SiteTabs defaultValue="preview">
            <div className="flex min-h-10 flex-wrap items-center gap-x-4 border-b border-(--rule) pr-1.5 pl-2">
              <SiteTabsList className="h-10">
                <SiteTab value="preview">Preview</SiteTab>
                <SiteTab value="code">Code</SiteTab>
              </SiteTabsList>
              {controls.length > 0 && (
                <div className="order-last -mr-1.5 -ml-2 w-[calc(100%+0.875rem)] border-t border-(--rule) px-2 py-2.5 sm:order-none sm:m-0 sm:w-auto sm:border-0 sm:p-0">
                  <ExampleControls
                    controls={controls}
                    values={values}
                    onChange={(next) => {
                      setValues(next)
                      setLine(null)
                    }}
                  />
                </div>
              )}
              <div className="ml-auto flex items-center">
                <ResetTrigger />
              </div>
            </div>
            <SiteTabPanel value="preview" className="min-w-0">
              <LogContext value={push}>
                <ResetContent>
                  <div
                    key={JSON.stringify(values)}
                    className="flex min-h-48 items-center justify-center p-6"
                  >
                    <Stage>{children}</Stage>
                  </div>
                </ResetContent>
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
        </ControlScope>
      </ResetScope>
    </div>
  )
}
