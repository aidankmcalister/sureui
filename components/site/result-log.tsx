"use client"

import * as React from "react"

const ReportContext = React.createContext<(entry: string) => void>(() => {})

export function useReport() {
  return React.useContext(ReportContext)
}

export function ResultLog({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<string[]>([])

  const report = React.useCallback((entry: string) => {
    setEntries((prev) => [entry, ...prev].slice(0, 5))
  }, [])

  return (
    <ReportContext value={report}>
      {children}
      <div className="grid gap-1 rounded-xl border bg-muted/50 p-4 font-mono text-xs">
        <p className="text-muted-foreground">Await log</p>
        {entries.length ? (
          entries.map((entry, index) => <p key={index}>{entry}</p>)
        ) : (
          <p className="text-muted-foreground">Try a demo.</p>
        )}
      </div>
    </ReportContext>
  )
}
