"use client"

import * as React from "react"

import type { Control, ControlValue, ControlValues } from "@/lib/site/controls"

const ControlContext = React.createContext<ControlValues>({})

export function useControlValues() {
  return React.useContext(ControlContext)
}

export function useControl() {
  const values = useControlValues()
  return function control<T extends ControlValue>(name: string, fallback: T) {
    return (values[name] as T | undefined) ?? fallback
  }
}

export function ControlText({ name }: { name: string }) {
  return <>{String(useControlValues()[name])}</>
}

const box =
  "h-6 border border-(--rule) bg-(--paper) px-1.5 font-mono text-[11px] text-(--ink) outline-none focus-visible:border-(--mark)"

function NumberControl({
  name,
  value,
  onChange,
}: {
  name: string
  value: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = React.useState(String(value))

  return (
    <label className="flex items-center gap-1 font-mono text-[11px] text-(--ink-label)">
      {name}
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 5)
          setDraft(digits)
          if (digits) onChange(Number(digits))
        }}
        onBlur={() => setDraft(String(value))}
        className={`${box} field-sizing-content min-w-[5ch] text-right`}
      />
      ms
    </label>
  )
}

export function ExampleControls({
  controls,
  values,
  onChange,
}: {
  controls: Control[]
  values: ControlValues
  onChange: (values: ControlValues) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start sm:gap-x-4">
      {controls.map((control) => {
        const value = values[control.name]
        const set = (next: ControlValue) =>
          onChange({ ...values, [control.name]: next })

        return typeof value === "number" ? (
          <NumberControl
            key={control.name}
            name={control.name}
            value={value}
            onChange={set}
          />
        ) : (
          <label
            key={control.name}
            className="flex items-center gap-1 font-mono text-[11px] text-(--ink-label)"
          >
            {control.name}
            <button
              type="button"
              aria-pressed={value}
              onClick={() => set(!value)}
              className={`${box} min-w-[6ch]`}
            >
              {String(value)}
            </button>
          </label>
        )
      })}
    </div>
  )
}

export function ControlScope({
  values,
  children,
}: {
  values: ControlValues
  children: React.ReactNode
}) {
  return <ControlContext value={values}>{children}</ControlContext>
}
