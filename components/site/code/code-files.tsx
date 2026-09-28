"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

export function CodeFiles({
  files,
}: {
  files: { name: string; code: React.ReactNode }[]
}) {
  if (files.length === 1) return files[0].code

  return (
    <TabsPrimitive.Root
      defaultValue={files[0].name}
      orientation="vertical"
      className="grid md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
    >
      <TabsPrimitive.List
        aria-label="Files"
        className="flex overflow-x-auto border-b border-(--rule) md:flex-col md:overflow-visible md:border-r md:border-b-0 md:py-2"
      >
        {files.map((file) => (
          <TabsPrimitive.Tab
            key={file.name}
            value={file.name}
            className="shrink-0 border-(--mark) px-4 py-2.5 text-left font-mono text-xs whitespace-nowrap text-(--ink-label) outline-none hover:text-(--ink) focus-visible:text-(--mark-text) md:truncate md:py-2 data-active:border-b data-active:text-(--ink) md:data-active:border-b-0 md:data-active:border-l-2 md:data-active:pl-3.5"
          >
            {file.name}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {files.map((file) => (
        <TabsPrimitive.Panel
          key={file.name}
          value={file.name}
          className="min-w-0"
        >
          {file.code}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  )
}
