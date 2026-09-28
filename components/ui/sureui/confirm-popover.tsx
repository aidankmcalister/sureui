"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import {
  isPromise,
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"

type PopoverContentProps = React.ComponentProps<typeof PopoverContent>

type ConfirmPopoverProps = Pick<
  ConfirmationOptions,
  "onConfirm" | "onCancel" | "onConfirmError"
> &
  Omit<GestureOptions, "disabled"> & {
    children: React.ReactElement
    description: React.ReactNode
    title?: string
    confirmLabel?: string
    errorLabel?: string
    cancelLabel?: string
    showCancel?: boolean
    initialFocus?: "confirm" | "cancel" | "none"
    variant?: ConfirmButtonProps["variant"]
    side?: PopoverContentProps["side"]
    align?: PopoverContentProps["align"]
    open?: boolean
    onOpenChange?: (open: boolean) => void
    announcements?: {
      hold?: string
      ready?: string
      armed?: string
      fallback?: string
      error?: string
    }
  }

function ConfirmPopover({
  children,
  description,
  title,
  confirmLabel = "Confirm",
  errorLabel,
  cancelLabel = "Cancel",
  showCancel = true,
  initialFocus = "confirm",
  variant = "default",
  side = "bottom",
  align = "center",
  open: openProp,
  onOpenChange,
  onConfirm,
  onCancel,
  onConfirmError,
  announcements,
  ...gestureOptions
}: ConfirmPopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const popupRef = React.useRef<HTMLDivElement>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const confirmRef = React.useRef<HTMLButtonElement>(null)
  const open = openProp ?? uncontrolledOpen

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  function handleOpenChange(next: boolean) {
    if (next) return setOpen(true)
    if (pending || !open) return
    onCancel?.()
    setOpen(false)
  }

  function run() {
    if (!open) return
    const result = onConfirm()
    if (!isPromise(result)) {
      setOpen(false)
      return result
    }
    setPending(true)
    result.then(
      () => {
        setPending(false)
        setOpen(false)
      },
      () => setPending(false)
    )
    return result
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={children} />
      <PopoverContent
        ref={popupRef}
        side={side}
        align={align}
        initialFocus={
          initialFocus === "none"
            ? popupRef
            : initialFocus === "cancel" && showCancel
              ? cancelRef
              : confirmRef
        }
      >
        <PopoverHeader>
          {title ? (
            <>
              <PopoverTitle>{title}</PopoverTitle>
              <PopoverDescription>{description}</PopoverDescription>
            </>
          ) : (
            <PopoverTitle render={<p />} className="font-normal">
              {description}
            </PopoverTitle>
          )}
        </PopoverHeader>
        <div className="flex justify-end gap-2">
          {showCancel && (
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          )}
          <ConfirmButton
            {...gestureOptions}
            ref={confirmRef}
            type="button"
            size="sm"
            variant={variant}
            announcements={announcements}
            errorLabel={errorLabel}
            onConfirm={run}
            onConfirmError={onConfirmError}
          >
            {confirmLabel}
          </ConfirmButton>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ConfirmPopover, type ConfirmPopoverProps }
