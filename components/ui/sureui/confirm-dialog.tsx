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
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import {
  type ConfirmationOptions,
  type GestureOptions,
} from "@/components/ui/sureui/confirmation"
import {
  ConfirmChoiceList,
  defaultChoices,
  TypeToConfirm,
  type ConfirmChoice,
  type ConfirmChoices,
} from "@/components/ui/sureui/type-to-confirm"

interface ConfirmDialogAlternative {
  label: React.ReactNode
  onSelect: () => void | Promise<unknown>
}

interface ConfirmDialogOptions
  extends
    Pick<ConfirmationOptions, "onCancel" | "onConfirmError">,
    Omit<GestureOptions, "disabled"> {
  onConfirm: (choices: ConfirmChoices) => void | Promise<unknown>
  title: React.ReactNode
  description?: React.ReactNode
  consequences?: React.ReactNode
  cancelLabel?: React.ReactNode
  confirmLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  waitLabel?: ConfirmButtonProps["waitLabel"]
  variant?: ConfirmButtonProps["variant"]
  initialFocus?: "cancel" | "confirm" | "none"
  alternative?: ConfirmDialogAlternative
  phrase?: string | string[]
  caseSensitive?: boolean
  trim?: boolean
  acknowledgements?: string[]
  choices?: ConfirmChoice[]
  announcements?: {
    hold?: string
    armed?: string
    fallback?: string
    slide?: string
    wait?: string
    match?: string
    error?: string
  }
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  children: React.ReactElement
}

interface ConfirmOptions extends Omit<
  ConfirmDialogOptions,
  "onConfirm" | "onCancel"
> {
  onConfirm?: ConfirmDialogOptions["onConfirm"]
}

type Pending = "confirm" | "alternative" | null

function useConfirmDialog() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState<Pending>(null)
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

  async function run(
    action: Exclude<Pending, null>,
    work: (() => unknown) | undefined,
    value: boolean
  ) {
    if (!work) return settle(value)
    setPending(action)
    try {
      await work()
      settle(value)
    } finally {
      setPending(null)
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
            onConfirm={(choices) =>
              run(
                "confirm",
                current.onConfirm && (() => current.onConfirm?.(choices)),
                true
              )
            }
            onAlternative={() =>
              run("alternative", current.alternative?.onSelect, false)
            }
          />
        )}
      </AlertDialog>
    )
  }

  return { confirm, request, render }
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const { children, onCancel, ...options } = props
  const { render } = useConfirmDialog()
  return render(options, { trigger: children, onCancel })
}

function useConfirm() {
  const { confirm, request, render } = useConfirmDialog()
  return { confirm, dialog: render(request) }
}

type ConfirmContentProps = Omit<ConfirmOptions, "onConfirm"> & {
  pending: Pending
  onConfirm: (choices: ConfirmChoices) => Promise<unknown>
  onAlternative: () => Promise<unknown>
}

function ConfirmContent({ initialFocus, ...props }: ConfirmContentProps) {
  const popupRef = React.useRef<HTMLDivElement>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const confirmRef = React.useRef<HTMLButtonElement>(null)
  const focus = initialFocus ?? (props.phrase ? "confirm" : "cancel")

  return (
    <AlertDialogContent
      ref={popupRef}
      initialFocus={
        focus === "none"
          ? popupRef
          : focus === "cancel"
            ? cancelRef
            : props.phrase
              ? true
              : confirmRef
      }
    >
      <ConfirmBody {...props} cancelRef={cancelRef} confirmRef={confirmRef} />
    </AlertDialogContent>
  )
}

function ConfirmBody({
  title,
  description,
  consequences,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  errorLabel,
  variant = "default",
  alternative,
  phrase,
  caseSensitive,
  trim,
  acknowledgements = [],
  choices = [],
  announcements,
  pending,
  onConfirm,
  onConfirmError,
  onAlternative,
  cancelRef,
  confirmRef,
  ...gestureOptions
}: Omit<ConfirmContentProps, "initialFocus"> & {
  cancelRef: React.Ref<HTMLButtonElement>
  confirmRef: React.Ref<HTMLButtonElement>
}) {
  const [picked, setPicked] = React.useState(() => defaultChoices(choices))
  const [acknowledged, setAcknowledged] = React.useState<ConfirmChoices>({})
  const acknowledgementChoices = acknowledgements.map((label, index) => ({
    name: `acknowledgement-${index}`,
    label,
  }))

  const cancel = (
    <AlertDialogCancel ref={cancelRef} disabled={!!pending}>
      {cancelLabel}
    </AlertDialogCancel>
  )
  const other = alternative && (
    <Button
      type="button"
      variant="secondary"
      data-state={pending === "alternative" ? "pending" : "idle"}
      disabled={!!pending}
      focusableWhenDisabled={pending === "alternative"}
      onClick={onAlternative}
    >
      {alternative.label}
    </Button>
  )
  const blocked = pending === "alternative"

  return (
    <>
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
          choices={choices}
          announcements={{
            match: announcements?.match,
            error: announcements?.error,
          }}
          confirmLabel={confirmLabel}
          errorLabel={errorLabel}
          onConfirmError={onConfirmError}
          variant={variant}
          onConfirm={onConfirm}
          renderActions={(confirmButton) => (
            <AlertDialogFooter>
              {cancel}
              {other}
              {blocked
                ? React.cloneElement(
                    confirmButton as React.ReactElement<{ disabled?: boolean }>,
                    { disabled: true }
                  )
                : confirmButton}
            </AlertDialogFooter>
          )}
        />
      ) : (
        <>
          {acknowledgements.length + choices.length > 0 && (
            <div className="grid gap-4">
              <ConfirmChoiceList
                choices={acknowledgementChoices}
                value={acknowledged}
                disabled={!!pending}
                onChange={setAcknowledged}
              />
              <ConfirmChoiceList
                choices={choices}
                value={picked}
                disabled={!!pending}
                onChange={setPicked}
              />
            </div>
          )}
          <AlertDialogFooter>
            {cancel}
            {other}
            <ConfirmButton
              {...gestureOptions}
              ref={confirmRef}
              announcements={announcements}
              errorLabel={errorLabel}
              variant={variant}
              disabled={
                blocked ||
                !acknowledgementChoices.every(({ name }) => acknowledged[name])
              }
              onConfirm={() => onConfirm(picked)}
              onConfirmError={onConfirmError}
            >
              {confirmLabel}
            </ConfirmButton>
          </AlertDialogFooter>
        </>
      )}
    </>
  )
}

export {
  ConfirmDialog,
  useConfirm,
  type ConfirmDialogAlternative,
  type ConfirmDialogProps,
  type ConfirmOptions,
}
