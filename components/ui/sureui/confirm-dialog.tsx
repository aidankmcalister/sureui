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
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import {
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type ConfirmDialogOptions = Pick<
  ConfirmationOptions,
  "onConfirm" | "onCancel"
> &
  Omit<GestureOptions, "disabled"> & {
    title: string
    description?: React.ReactNode
    consequences?: React.ReactNode
    cancelLabel?: string
    confirmLabel?: string
    variant?: ConfirmButtonProps["variant"]
    phrase?: string
    caseSensitive?: boolean
    trim?: boolean
    acknowledgements?: string[]
    announcements?: {
      hold?: string
      ready?: string
      armed?: string
      fallback?: string
      match?: string
    }
  }

type ConfirmDialogProps = ConfirmDialogOptions & {
  children: React.ReactElement
}

type ConfirmOptions = Omit<ConfirmDialogOptions, "onConfirm" | "onCancel"> &
  Partial<Pick<ConfirmDialogOptions, "onConfirm">>

function useConfirmDialog() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [request, setRequest] = React.useState<ConfirmOptions | null>(null)
  const resolver = React.useRef<((value: boolean) => void) | null>(null)

  const settle = React.useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOpen(false)
  }, [])

  const confirm = React.useCallback((next: ConfirmOptions) => {
    resolver.current?.(false)
    setRequest(next)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  React.useEffect(() => () => resolver.current?.(false), [])

  async function run(onConfirm: ConfirmOptions["onConfirm"]) {
    if (!onConfirm) return settle(true)
    setPending(true)
    try {
      await onConfirm()
      settle(true)
    } finally {
      setPending(false)
    }
  }

  function render(
    current: ConfirmOptions | null,
    {
      trigger,
      onCancel,
    }: { trigger?: React.ReactElement; onCancel?: () => void } = {}
  ) {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (next && current) confirm(current)
          if (next || pending) return
          onCancel?.()
          settle(false)
        }}
      >
        {trigger && <AlertDialogTrigger render={trigger} />}
        {current && (
          <ConfirmContent
            {...current}
            pending={pending}
            onConfirm={() => run(current.onConfirm)}
          />
        )}
      </AlertDialog>
    )
  }

  return { confirm, request, render }
}

function ConfirmDialog({ children, onCancel, ...options }: ConfirmDialogProps) {
  const { render } = useConfirmDialog()
  return render(options, { trigger: children, onCancel })
}

function useConfirm() {
  const { confirm, request, render } = useConfirmDialog()
  return { confirm, dialog: render(request) }
}

function ConfirmContent({
  title,
  description,
  consequences,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  variant = "default",
  phrase,
  caseSensitive,
  trim,
  acknowledgements,
  announcements,
  pending,
  onConfirm,
  ...gestureOptions
}: ConfirmOptions & {
  pending: boolean
  onConfirm: () => Promise<unknown>
}) {
  const cancel = (
    <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
  )

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        )}
      </AlertDialogHeader>
      {!phrase && consequences}
      {phrase ? (
        <TypeToConfirm
          phrase={phrase}
          consequences={consequences}
          caseSensitive={caseSensitive}
          trim={trim}
          acknowledgements={acknowledgements}
          announcements={{ match: announcements?.match }}
          confirmLabel={confirmLabel}
          variant={variant}
          onConfirm={onConfirm}
          renderActions={(confirmButton) => (
            <AlertDialogFooter>
              {cancel}
              {confirmButton}
            </AlertDialogFooter>
          )}
        />
      ) : (
        <AlertDialogFooter>
          {cancel}
          <ConfirmButton
            {...gestureOptions}
            announcements={announcements}
            variant={variant}
            onConfirm={onConfirm}
          >
            {confirmLabel}
          </ConfirmButton>
        </AlertDialogFooter>
      )}
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
