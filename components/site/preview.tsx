"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/site/frame"

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
    <div className="rounded-[10px] border bg-(--well) text-foreground">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between gap-4 p-2 pr-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <Label>Fig. {figure}</Label>
        </div>
        <TabsContent value="preview">
          <ReportContext value={setEntry}>
            <div className="flex min-h-64 items-center justify-center p-6">
              {children}
            </div>
          </ReportContext>
          <p
            aria-live="polite"
            className="border-t px-4 py-2.5 font-mono text-xs text-muted-foreground"
          >
            <span className="tracking-widest uppercase">Await log</span>{" "}
            <span className="text-foreground">{entry}</span>
          </p>
        </TabsContent>
        <TabsContent value="code">
          <div className="px-2 pb-2">{code}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
