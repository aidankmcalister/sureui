export type ControlValue = number | boolean

export type Control = { name: string; value: ControlValue }

export type ControlValues = Record<string, ControlValue>

const slot = /__control_(\w+)__/g

export function controlSlot(name: string) {
  return `__control_${name}__`
}

export function controlSlotName(text: string) {
  return /^__control_(\w+)__$/.exec(text)?.[1]
}

export function fillControlSlots(text: string, values: ControlValues) {
  return text.replace(slot, (match, name) =>
    name in values ? String(values[name]) : match
  )
}

export function defaultValues(controls: Control[]): ControlValues {
  return Object.fromEntries(
    controls.map((control) => [control.name, control.value])
  )
}

export function toggleKey(values: ControlValues) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(values).filter(([, value]) => typeof value === "boolean")
    )
  )
}
