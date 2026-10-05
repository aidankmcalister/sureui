"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function SiteSelect({
  value,
  options,
  onValueChange,
  className,
  ...props
}: Omit<SelectPrimitive.Trigger.Props, "value"> & {
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  return (
    <SelectPrimitive.Root
      items={options.map((option) => ({ value: option, label: option }))}
      value={value}
      onValueChange={(next) => next !== null && onValueChange(next)}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-6 items-center gap-1 border border-(--rule) bg-(--paper) pr-1 pl-1.5 font-mono text-[11px] text-(--ink) outline-none hover:border-(--ink-label) focus-visible:border-(--mark) data-popup-open:border-(--ink-label)",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon className="flex text-(--ink-label)">
          <ChevronDownIcon className="size-3" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={4}
          alignItemWithTrigger={false}
          align="start"
          className="z-50"
        >
          <SelectPrimitive.Popup className="min-w-(--anchor-width) border border-(--rule) bg-(--well) p-1 font-mono text-[11px] text-(--ink) shadow-lg outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition-opacity motion-safe:duration-100">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option}
                value={option}
                className="flex cursor-default items-center gap-3 py-1 pr-1.5 pl-2 outline-none select-none data-highlighted:bg-(--rule)"
              >
                <SelectPrimitive.ItemText className="flex-1">
                  {option}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="flex text-(--mark-text)">
                  <CheckIcon className="size-3" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { SiteSelect }
