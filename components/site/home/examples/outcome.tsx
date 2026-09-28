"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useReset } from "@/components/site/ui/reset"

export function Outcome({
  done,
  icon,
  title,
  children,
}: {
  done: boolean
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  const reset = useReset()
  const frameRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const frame = frameRef.current
    if (frame) frame.style.minHeight = `${frame.offsetHeight}px`
  }, [])

  return (
    <div ref={frameRef} className="relative grid min-h-30 w-full">
      <div
        inert={done}
        className={cn(
          "grid w-full content-start justify-items-center",
          done && "opacity-0"
        )}
      >
        {children}
      </div>
      {done && (
        <div role="status" className="absolute inset-0 flex">
          <Empty className="gap-3 p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">{icon}</EmptyMedia>
              <EmptyTitle>{title}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" autoFocus onClick={reset}>
                Reset demo
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  )
}

export function Details({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-1.5 text-sm">
      {rows.map(([name, value]) => (
        <div key={name} className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function useToggle() {
  const [items, setItems] = React.useState<string[]>([])
  return {
    has: (item: string) => items.includes(item),
    toggle: (item: string) =>
      setItems((prev) =>
        prev.includes(item)
          ? prev.filter((other) => other !== item)
          : [...prev, item]
      ),
    count: items.length,
  }
}
