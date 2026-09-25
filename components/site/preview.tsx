"use client"

import * as React from "react"

const ReportContext = React.createContext<(entry: string) => void>(() => {})

export function useReport() {
  return React.useContext(ReportContext)
}

export function Preview({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = React.useState("idle, try the demo")

  return (
    <ReportContext value={setEntry}>
      <div className="overflow-hidden rounded-xl border">
        <div className="flex min-h-64 items-center justify-center p-6">
          {children}
        </div>
        <p className="border-t bg-muted/50 px-4 py-2 font-mono text-xs">
          <span className="text-muted-foreground">Await log</span> {entry}
        </p>
      </div>
    </ReportContext>
  )
}
