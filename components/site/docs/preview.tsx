"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      <Tabs defaultValue="preview" className="gap-0">
        <div className="flex h-10 items-center justify-between gap-4 border-b border-(--rule) pr-4 pl-2">
          <TabsList variant="line">
            <TabsTrigger value="preview" className="font-mono text-xs">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="font-mono text-xs">
              Code
            </TabsTrigger>
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
            className="flex items-baseline gap-3 border-t border-(--rule) px-4 py-2.5 font-mono text-xs"
          >
            <Label>Await log</Label>
            <span className="text-(--ink)">{entry}</span>
          </p>
        </TabsContent>
        <TabsContent value="code">{code}</TabsContent>
      </Tabs>
    </div>
  )
}
