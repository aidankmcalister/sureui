"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { type ConfirmationOptions } from "@/components/ui/sureui/confirmation"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type ConfirmDialogOptions = Omit<ConfirmationOptions, "undo"> & {
  title: string
  description?: React.ReactNode
  cancelLabel?: string
  confirmLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  gesture?: "click" | "click-again" | "hold"
  phrase?: string
  acknowledgements?: string[]
}

type ConfirmDialogProps = ConfirmDialogOptions & {
  children: React.ReactElement
}

type ConfirmOptions = Omit<ConfirmDialogOptions, "onConfirm" | "onCancel"> &
  Partial<Pick<ConfirmDialogOptions, "onConfirm">>

function ConfirmDialog({
  children,
  onConfirm,
  onCancel,
  ...options
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  async function handleConfirm() {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return
        setOpen(next)
        if (!next) onCancel?.()
      }}
    >
      <AlertDialogTrigger render={children} />
      <ConfirmContent
        {...options}
        pending={pending}
        onConfirm={handleConfirm}
      />
    </AlertDialog>
  )
}

function useConfirm() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)
  const resolver = React.useRef<((value: boolean) => void) | null>(null)

  const settle = React.useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOpen(false)
  }, [])

  const confirm = React.useCallback((next: ConfirmOptions) => {
    resolver.current?.(false)
    setOptions(next)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  React.useEffect(() => () => resolver.current?.(false), [])

  const dialog = (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) settle(false)
      }}
    >
      {options && (
        <ConfirmContent
          {...options}
          pending={pending}
          onConfirm={async () => {
            if (!options.onConfirm) return settle(true)
            setPending(true)
            try {
              await options.onConfirm()
              settle(true)
            } finally {
              setPending(false)
            }
          }}
        />
      )}
    </AlertDialog>
  )

  return { confirm, dialog }
}

function ConfirmContent({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  variant = "default",
  gesture = "click",
  phrase,
  acknowledgements,
  pending,
  onConfirm,
}: Omit<ConfirmDialogOptions, "onCancel"> & {
  pending?: boolean
  onConfirm: () => void | Promise<unknown>
}) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        )}
      </AlertDialogHeader>
      {phrase && (
        <TypeToConfirm
          phrase={phrase}
          acknowledgements={acknowledgements}
          confirmLabel={confirmLabel}
          variant={variant}
          onConfirm={onConfirm}
        />
      )}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
        {!phrase && (
          <ConfirmButton
            gesture={gesture}
            variant={variant}
            onConfirm={onConfirm}
          >
            {confirmLabel}
          </ConfirmButton>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

export {
  ConfirmDialog,
  useConfirm,
  type ConfirmDialogProps,
  type ConfirmDialogOptions,
  type ConfirmOptions,
}
