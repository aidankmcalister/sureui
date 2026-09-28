"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { siteButton } from "@/components/site/ui/button"

function SiteDrawer(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />
}

function SiteDrawerTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} />
}

function SiteDrawerContent({
  title,
  actions,
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props & { title: string; actions?: React.ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-(--rule) bg-(--paper) text-(--ink) transition-[translate,opacity] duration-200 ease-out outline-none data-ending-style:-translate-x-6 data-ending-style:opacity-0 data-starting-style:-translate-x-6 data-starting-style:opacity-0",
          className
        )}
        {...props}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-(--rule) pr-3 pl-5.75">
          <DialogPrimitive.Title className="font-mono text-[11px] leading-4 font-normal tracking-widest text-(--ink-label) uppercase">
            {title}
          </DialogPrimitive.Title>
          <div className="flex items-center">
            {actions}
            <DialogPrimitive.Close
              aria-label="Close"
              className={siteButton({ variant: "ghost", size: "icon" })}
            >
              <XIcon />
            </DialogPrimitive.Close>
          </div>
        </div>
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export { SiteDrawer, SiteDrawerContent, SiteDrawerTrigger }
