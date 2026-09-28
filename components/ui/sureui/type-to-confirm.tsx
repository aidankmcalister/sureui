"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useConfirmationMachine,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

type TypeToConfirmProps = ConfirmationOptions & {
  phrase: string
  caseSensitive?: boolean
  trim?: boolean
  label?: React.ReactNode
  announcements?: {
    match?: string
    undo?: string
  }
  confirmLabel?: string
  undoLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  acknowledgements?: string[]
  renderActions?: (confirmButton: React.ReactElement) => React.ReactNode
  className?: string
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
  announcements,
  confirmLabel = "Confirm",
  undoLabel = "Undo",
  variant = "destructive",
  acknowledgements = [],
  renderActions,
  className,
}: TypeToConfirmProps) {
  const { state, fillRef, confirm, cancel, pauseUndo, resumeUndo } =
    useConfirmationMachine({
      onConfirm,
      onCancel,
      undo,
      pauseUndoOnHover,
      pauseUndoOnFocus,
    })
  const [value, setValue] = React.useState("")
  const [checked, setChecked] = React.useState<number[]>([])
  const inputId = React.useId()

  const normalize = (text: string) => {
    const trimmed = trim ? text.trim() : text
    return caseSensitive ? trimmed : trimmed.toLocaleLowerCase()
  }
  const matches = normalize(value) === normalize(phrase)
  const ready = matches && checked.length === acknowledgements.length

  const confirmButton = (
    <Button
      type={state === "undo" ? "button" : "submit"}
      variant={variant}
      data-state={state}
      disabled={state === "undo" ? false : !ready || state === "pending"}
      focusableWhenDisabled={state === "pending"}
      className="relative justify-self-start overflow-hidden aria-disabled:opacity-50"
      onClick={state === "undo" ? cancel : undefined}
      onPointerEnter={() => pauseUndo("hover")}
      onPointerLeave={() => resumeUndo("hover")}
      onFocus={() => pauseUndo("focus")}
      onBlur={() => resumeUndo("focus")}
    >
      <span
        ref={fillRef}
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
      />
      {state === "undo" ? undoLabel : confirmLabel}
    </Button>
  )

  return (
    <form
      className={cn("grid gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready || state !== "idle") return
        confirm()
        setValue("")
        setChecked([])
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor={inputId} className="block leading-normal">
          {label ?? (
            <>
              Type <span className="font-mono">{phrase}</span> to confirm
            </>
          )}
        </Label>
        <Input
          id={inputId}
          value={value}
          autoComplete="off"
          spellCheck={false}
          readOnly={state === "pending"}
          onChange={(event) => setValue(event.target.value)}
        />
        <p aria-live="polite" className="sr-only">
          {state === "undo"
            ? (announcements?.undo ?? "Done. Undo is available.")
            : matches
              ? (announcements?.match ?? "Phrase matches")
              : ""}
        </p>
      </div>
      {acknowledgements.map((text, index) => (
        <Label key={index} className="items-start leading-normal font-normal">
          <Checkbox
            className="mt-0.5"
            checked={checked.includes(index)}
            disabled={state === "pending"}
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
