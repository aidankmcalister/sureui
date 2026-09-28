"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function Outcome({
  done,
  icon,
  title,
  description,
  onReset,
  children,
}: {
  done: boolean
  icon: React.ReactNode
  title: string
  description?: string
  onReset: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative grid w-full">
      <div
        inert={done}
        className={cn("grid w-full place-items-center", done && "opacity-0")}
      >
        {children}
      </div>
      {done && (
        <div role="status" className="absolute inset-0 flex">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">{icon}</EmptyMedia>
              <EmptyTitle>{title}</EmptyTitle>
              {description && (
                <EmptyDescription>{description}</EmptyDescription>
              )}
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" autoFocus onClick={onReset}>
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
    reset: () => setItems([]),
  }
}
