"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useConfirmation,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

type TypeToConfirmProps = ConfirmationOptions & {
  phrase: string
  confirmLabel?: string
  undoLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  acknowledgements?: string[]
  className?: string
}

function TypeToConfirm({
  onConfirm,
  onCancel,
  undo,
  phrase,
  confirmLabel = "Confirm",
  undoLabel = "Undo",
  variant = "destructive",
  acknowledgements = [],
  className,
}: TypeToConfirmProps) {
  const { state, fillRef, confirm, cancel } = useConfirmation({
    onConfirm,
    onCancel,
    undo,
  })
  const [value, setValue] = React.useState("")
  const [checked, setChecked] = React.useState<number[]>([])
  const inputId = React.useId()

  const matches = value === phrase
  const ready = matches && checked.length === acknowledgements.length

  return (
    <form
      className={cn("grid gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready) return
        confirm()
        setValue("")
        setChecked([])
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor={inputId} className="block leading-normal">
          Type <span className="font-mono">{phrase}</span> to confirm
        </Label>
        <Input
          id={inputId}
          value={value}
          autoComplete="off"
          spellCheck={false}
          disabled={state === "pending"}
          onChange={(event) => setValue(event.target.value)}
        />
        <p aria-live="polite" className="sr-only">
          {matches ? "Phrase matches" : ""}
        </p>
      </div>
      {acknowledgements.map((text, index) => (
        <Label key={index} className="font-normal">
          <Checkbox
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
      <Button
        type={state === "undo" ? "button" : "submit"}
        variant={variant}
        data-state={state}
        disabled={state === "undo" ? false : !ready || state === "pending"}
        className="relative justify-self-start overflow-hidden"
        onClick={state === "undo" ? cancel : undefined}
      >
        <span
          ref={fillRef}
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-current opacity-20"
        />
        {state === "undo" ? undoLabel : confirmLabel}
      </Button>
    </form>
  )
}

export { TypeToConfirm, type TypeToConfirmProps }
