"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

function SiteTabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root className={cn("grid", className)} {...props} />
}

function SiteTabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn("flex h-full items-stretch", className)}
      {...props}
    />
  )
}

function SiteTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "relative px-2.5 font-mono text-xs text-(--ink-label) outline-none after:absolute after:inset-x-2.5 after:-bottom-px after:h-px after:bg-(--mark) after:opacity-0 hover:text-(--ink) focus-visible:text-(--mark-text) data-active:text-(--ink) data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function SiteTabPanel(props: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel {...props} />
}

export { SiteTab, SiteTabPanel, SiteTabs, SiteTabsList }
