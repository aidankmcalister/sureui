"use client"

import * as React from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DialogOptions = {
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  signal?: AbortSignal
}

type SureConfirmOptions = DialogOptions

type SureAlertOptions = Pick<
  DialogOptions,
  "title" | "description" | "confirmLabel" | "signal"
>

type SurePromptOptions = DialogOptions & {
  label?: string
  defaultValue?: string
  placeholder?: string
}

type SureTypeOptions = DialogOptions & {
  phrase: string
  acknowledgements?: string[]
}

type SureUndoOptions = {
  description?: React.ReactNode
  duration?: number
  undoLabel?: string
  signal?: AbortSignal
}

type SureRequest = {
  id: number
  kind: "confirm" | "alert" | "prompt" | "type"
  options: SurePromptOptions & Partial<SureTypeOptions>
}

type Entry = {
  request: SureRequest
  resolve: (value: unknown) => void
  cancelValue: unknown
  cleanup: () => void
}

let queue: Entry[] = []
let mounts = 0
let nextId = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return queue[0]?.request ?? null
}

function remove(id: number) {
  const entry = queue.find((entry) => entry.request.id === id)
  if (!entry) return
  queue = queue.filter((item) => item !== entry)
  entry.cleanup()
  emit()
  return entry
}

function settle(id: number, value: unknown) {
  remove(id)?.resolve(value)
}

function cancel(id: number) {
  const entry = remove(id)
  entry?.resolve(entry.cancelValue)
}

function mount() {
  mounts++
  return () => {
    mounts--
    if (mounts) return
    queue.forEach((entry) => cancel(entry.request.id))
  }
}

function open<T>(
  kind: SureRequest["kind"],
  options: SureRequest["options"],
  cancelValue: T
) {
  if (!mounts) throw new Error("Add <Sure /> to your root layout")
  const { signal } = options
  if (signal?.aborted) return Promise.resolve(cancelValue)

  return new Promise<T>((resolve) => {
    const id = ++nextId
    const onAbort = () => cancel(id)
    signal?.addEventListener("abort", onAbort, { once: true })
    queue = [
      ...queue,
      {
        request: { id, kind, options },
        resolve: resolve as (value: unknown) => void,
        cancelValue,
        cleanup: () => signal?.removeEventListener("abort", onAbort),
      },
    ]
    emit()
  })
}

function undo(message: React.ReactNode, options: SureUndoOptions = {}) {
  const { description, duration = 5000, undoLabel = "Undo", signal } = options
  if (signal?.aborted) return Promise.resolve(false)

  return new Promise<boolean>((resolve) => {
    const done = (value: boolean) => {
      signal?.removeEventListener("abort", onAbort)
      resolve(value)
    }
    const onAbort = () => {
      done(false)
      toast.dismiss(id)
    }
    const id = toast(message, {
      description,
      duration: Math.max(duration, 4000),
      action: { label: undoLabel, onClick: () => done(false) },
      onAutoClose: () => done(true),
      onDismiss: () => done(true),
    })
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

const sure = {
  confirm: (options: SureConfirmOptions) =>
    open<boolean>("confirm", options, false),
  alert: (options: SureAlertOptions) => open<void>("alert", options, undefined),
  prompt: (options: SurePromptOptions) =>
    open<string | null>("prompt", options, null),
  type: (options: SureTypeOptions) => open<boolean>("type", options, false),
  undo,
}

function Sure() {
  const current = React.useSyncExternalStore(subscribe, getSnapshot, () => null)
  const [shown, setShown] = React.useState(current)

  if (current && current !== shown) setShown(current)

  React.useEffect(() => mount(), [])

  return (
    <AlertDialog
      open={!!current}
      onOpenChange={(open) => {
        if (!open && current) cancel(current.id)
      }}
    >
      {shown && <SureDialog key={shown.id} request={shown} />}
    </AlertDialog>
  )
}

function SureDialog({ request }: { request: SureRequest }) {
  const { id, kind, options } = request
  const [value, setValue] = React.useState(options.defaultValue ?? "")
  const [checked, setChecked] = React.useState<number[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  const hasInput = kind === "prompt" || kind === "type"
  const phraseMatches = value === options.phrase
  const ready =
    kind !== "type" ||
    (phraseMatches &&
      checked.length === (options.acknowledgements?.length ?? 0))

  return (
    <AlertDialogContent initialFocus={hasInput ? inputRef : true}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) settle(id, kind === "prompt" ? value : true)
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && (
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {kind === "type" &&
          options.acknowledgements?.map((text, index) => (
            <Label key={index} className="font-normal">
              <Checkbox
                checked={checked.includes(index)}
                onCheckedChange={(on) =>
                  setChecked((prev) =>
                    on
                      ? [...prev, index]
                      : prev.filter((item) => item !== index)
                  )
                }
              />
              {text}
            </Label>
          ))}
        {hasInput && (
          <div className="grid gap-2">
            <Label
              htmlFor={inputId}
              className={cn(
                "block leading-normal",
                kind === "prompt" && !options.label && "sr-only"
              )}
            >
              {kind === "type" ? (
                <>
                  Type <span className="font-mono">{options.phrase}</span> to
                  confirm
                </>
              ) : (
                (options.label ?? options.title)
              )}
            </Label>
            <Input
              ref={inputRef}
              id={inputId}
              value={value}
              placeholder={options.placeholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setValue(event.target.value)}
            />
            {kind === "type" && (
              <p aria-live="polite" className="sr-only">
                {phraseMatches ? "Phrase matches" : ""}
              </p>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>
            {kind === "alert"
              ? (options.confirmLabel ?? "OK")
              : (options.cancelLabel ?? "Cancel")}
          </AlertDialogCancel>
          {kind !== "alert" && (
            <Button type="submit" variant={options.variant} disabled={!ready}>
              {options.confirmLabel ?? "Confirm"}
            </Button>
          )}
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  )
}

export {
  Sure,
  sure,
  type SureAlertOptions,
  type SureConfirmOptions,
  type SurePromptOptions,
  type SureTypeOptions,
  type SureUndoOptions,
}
