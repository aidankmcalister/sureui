"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ConfirmButton,
  type ConfirmButtonProps,
} from "@/components/ui/sureui/confirm-button"
import { type ConfirmationOptions } from "@/components/ui/sureui/confirmation"

type TypeToConfirmProps = ConfirmationOptions & {
  phrase: string
  caseSensitive?: boolean
  trim?: boolean
  label?: React.ReactNode
  consequences?: React.ReactNode
  announcements?: {
    match?: string
    undo?: string
  }
  confirmLabel?: string
  undoLabel?: string
  variant?: ConfirmButtonProps["variant"]
  acknowledgements?: string[]
  renderActions?: (confirmButton: React.ReactElement) => React.ReactNode
  className?: string
}

function isIdle(button: HTMLElement | null) {
  return button?.getAttribute("data-state") === "idle"
}

function TypeToConfirm({
  onConfirm,
  onCancel,
  undo,
  pauseUndoOnHover,
  pauseUndoOnFocus,
  phrase,
  caseSensitive = true,
  trim = false,
  label,
  consequences,
  announcements,
  confirmLabel = "Confirm",
  undoLabel = "Undo",
  variant = "destructive",
  acknowledgements = [],
  renderActions,
  className,
}: TypeToConfirmProps) {
  const [value, setValue] = React.useState("")
  const [checked, setChecked] = React.useState<number[]>([])
  const [pending, setPending] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const inputId = React.useId()

  const normalize = (text: string) => {
    const trimmed = trim ? text.trim() : text
    return caseSensitive ? trimmed : trimmed.toLocaleLowerCase()
  }
  const matches = normalize(value) === normalize(phrase)
  const ready = matches && checked.length === acknowledgements.length

  function run() {
    const result = onConfirm()
    if (
      typeof (result as PromiseLike<unknown> | undefined)?.then === "function"
    ) {
      const settle = () => setPending(false)
      setPending(true)
      Promise.resolve(result).then(settle, settle)
    }
    return result
  }

  const confirmButton = (
    <ConfirmButton
      ref={buttonRef}
      type="button"
      variant={variant}
      undo={undo}
      undoLabel={undoLabel}
      announcements={{ undo: announcements?.undo }}
      pauseUndoOnHover={pauseUndoOnHover}
      pauseUndoOnFocus={pauseUndoOnFocus}
      disabled={!ready}
      className="justify-self-start"
      onClick={(event) => {
        if (!isIdle(event.currentTarget)) return
        setValue("")
        setChecked([])
      }}
      onConfirm={run}
      onCancel={onCancel}
    >
      {confirmLabel}
    </ConfirmButton>
  )

  return (
    <form
      className={cn("grid gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (ready && isIdle(buttonRef.current)) buttonRef.current?.click()
      }}
    >
      {consequences}
      <div className="grid gap-2">
        <Label
          htmlFor={inputId}
          className="block leading-normal select-text"
          onClick={(event) => {
            if (window.getSelection()?.isCollapsed === false) {
              event.preventDefault()
            }
          }}
        >
          {label ?? (
            <>
              Type{" "}
              <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.9em] font-semibold text-foreground">
                {phrase}
              </code>{" "}
              to confirm
            </>
          )}
        </Label>
        <Input
          id={inputId}
          value={value}
          autoComplete="off"
          spellCheck={false}
          readOnly={pending}
          onChange={(event) => setValue(event.target.value)}
        />
        <p aria-live="polite" className="sr-only">
          {matches ? (announcements?.match ?? "Phrase matches") : ""}
        </p>
      </div>
      {acknowledgements.map((text, index) => (
        <Label key={index} className="items-start leading-normal font-normal">
          <Checkbox
            className="mt-0.5"
            checked={checked.includes(index)}
            disabled={pending}
            onCheckedChange={(on) =>
              setChecked((prev) =>
                on ? [...prev, index] : prev.filter((item) => item !== index)
              )
            }
          />
          {text}
        </Label>
      ))}
      {renderActions ? renderActions(confirmButton) : confirmButton}
    </form>
  )
}

export { TypeToConfirm, type TypeToConfirmProps }
