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
import {
  isPromise,
  type ConfirmationOptions,
} from "@/components/ui/sureui/confirmation"

interface ConfirmChoice {
  name: string
  label: React.ReactNode
  defaultChecked?: boolean
}

type ConfirmChoices = Record<string, boolean>

interface TypeToConfirmProps extends Omit<ConfirmationOptions, "onConfirm"> {
  onConfirm: (choices: ConfirmChoices) => void | Promise<unknown>
  phrase: string | string[]
  caseSensitive?: boolean
  trim?: boolean
  label?: React.ReactNode | React.ReactNode[]
  consequences?: React.ReactNode
  announcements?: {
    match?: string
    undo?: string
    error?: string
  }
  confirmLabel?: string
  undoLabel?: string
  errorLabel?: string
  variant?: ConfirmButtonProps["variant"]
  acknowledgements?: string[]
  choices?: ConfirmChoice[]
  renderActions?: (confirmButton: React.ReactElement) => React.ReactNode
  className?: string
}

function isIdle(button: HTMLElement | null) {
  return button?.getAttribute("data-state") === "idle"
}

function defaultChoices(choices: ConfirmChoice[]): ConfirmChoices {
  return Object.fromEntries(
    choices.map((choice) => [choice.name, choice.defaultChecked ?? false])
  )
}

function ConfirmChoiceList({
  choices,
  value,
  disabled,
  onChange,
}: {
  choices: ConfirmChoice[]
  value: ConfirmChoices
  disabled?: boolean
  onChange: (value: ConfirmChoices) => void
}) {
  return choices.map((choice) => (
    <Label key={choice.name} className="items-start leading-normal font-normal">
      <Checkbox
        className="mt-0.5"
        name={choice.name}
        checked={value[choice.name] ?? false}
        disabled={disabled}
        onCheckedChange={(on) => onChange({ ...value, [choice.name]: on })}
      />
      {choice.label}
    </Label>
  ))
}

function TypeToConfirm(props: TypeToConfirmProps) {
  const {
    onConfirm,
    onCancel,
    onConfirmError,
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
    errorLabel,
    variant = "destructive",
    acknowledgements = [],
    choices = [],
    renderActions,
    className,
  } = props
  const [values, setValues] = React.useState<string[]>([])
  const [checked, setChecked] = React.useState<number[]>([])
  const [picked, setPicked] = React.useState(() => defaultChoices(choices))
  const [pending, setPending] = React.useState(false)
  const committed = React.useRef(picked)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const inputId = React.useId()

  const phrases = Array.isArray(phrase) ? phrase : [phrase]
  const labels = Array.isArray(phrase) && Array.isArray(label) ? label : [label]
  const normalize = (text: string) => {
    const trimmed = trim ? text.trim() : text
    return caseSensitive ? trimmed : trimmed.toLocaleLowerCase()
  }
  const matches = phrases.map(
    (text, index) => normalize(values[index] ?? "") === normalize(text)
  )
  const ready =
    matches.every(Boolean) && checked.length === acknowledgements.length

  function run() {
    const result = onConfirm(committed.current)
    if (isPromise(result)) {
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
      errorLabel={errorLabel}
      announcements={{
        undo: announcements?.undo,
        error: announcements?.error,
      }}
      pauseUndoOnHover={pauseUndoOnHover}
      pauseUndoOnFocus={pauseUndoOnFocus}
      disabled={!ready}
      className="justify-self-start"
      onClick={(event) => {
        if (!isIdle(event.currentTarget)) return
        committed.current = picked
        setValues([])
        setChecked([])
        setPicked(defaultChoices(choices))
      }}
      onConfirm={run}
      onCancel={onCancel}
      onConfirmError={onConfirmError}
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
      {phrases.map((text, index) => (
        <div key={index} className="grid gap-2">
          <Label
            htmlFor={`${inputId}-${index}`}
            className="block leading-normal select-text"
            onClick={(event) => {
              if (window.getSelection()?.isCollapsed === false) {
                event.preventDefault()
              }
            }}
          >
            {labels[index] ?? (
              <>
                Type{" "}
                <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.9em] font-semibold text-foreground">
                  {text}
                </code>{" "}
                to confirm
              </>
            )}
          </Label>
          <Input
            id={`${inputId}-${index}`}
            value={values[index] ?? ""}
            autoComplete="off"
            spellCheck={false}
            readOnly={pending}
            onChange={(event) => {
              const next = event.target.value
              setValues((prev) =>
                phrases.map((_, item) =>
                  item === index ? next : (prev[item] ?? "")
                )
              )
            }}
          />
          <p aria-live="polite" className="sr-only">
            {matches[index] ? (announcements?.match ?? "Phrase matches") : ""}
          </p>
        </div>
      ))}
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
      <ConfirmChoiceList
        choices={choices}
        value={picked}
        disabled={pending}
        onChange={setPicked}
      />
      {renderActions ? renderActions(confirmButton) : confirmButton}
    </form>
  )
}

export {
  TypeToConfirm,
  ConfirmChoiceList,
  type ConfirmChoice,
  type ConfirmChoices,
  type TypeToConfirmProps,
}
