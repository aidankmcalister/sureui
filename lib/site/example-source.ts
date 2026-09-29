export type ControlValue = number | boolean

export type Control = { name: string; value: ControlValue }

export type ControlValues = Record<string, ControlValue>

export type ExampleSource = {
  controls: Control[]
  log: boolean
  template: string
  conditions: Record<number, string>
}

const call = /control\("(\w+)", (\w+)\)/g
const placeholder = /__control_(\w+)__/g

function parseValue(text: string): ControlValue {
  return text === "true" || (text !== "false" && Number(text))
}

function stripDocsHooks(file: string) {
  return file
    .replace(
      /^import \{[^}]*\} from "@\/components\/site\/docs\/preview"\n/m,
      ""
    )
    .replace(/^ *const log = useLog\(\)\n/m, "")
    .replace(/^ *const control = useControl\(\)\n/m, "")
    .replace(/\{\n\n+/g, "{\n")
    .replace(/\blog\(/g, "console.log(")
    .trim()
}

export function parseExample(file: string): ExampleSource {
  const conditions: Record<number, string> = {}
  const template = stripDocsHooks(file)
    .split("\n")
    .map((line, index) => {
      const toggle = /^( *)(\w+)=\{control\("(\w+)", (?:true|false)\)\}$/.exec(
        line
      )
      if (toggle) {
        conditions[index] = toggle[3]
        return `${toggle[1]}${toggle[2]}`
      }
      return line.replace(call, (_, name) => `__control_${name}__`)
    })
    .join("\n")

  return {
    controls: [...file.matchAll(call)].map(([, name, value]) => ({
      name,
      value: parseValue(value),
    })),
    log: file.includes("useLog()"),
    template,
    conditions,
  }
}

export function defaultValues(controls: Control[]): ControlValues {
  return Object.fromEntries(
    controls.map((control) => [control.name, control.value])
  )
}

export function lineShown(
  example: ExampleSource,
  index: number,
  values: ControlValues
) {
  const name = example.conditions[index]
  return name === undefined || values[name] === true
}

export function controlIn(text: string) {
  return /^__control_(\w+)__$/.exec(text)?.[1]
}

export function renderExample(
  example: ExampleSource,
  values: ControlValues = defaultValues(example.controls)
) {
  return example.template
    .split("\n")
    .filter((_, index) => lineShown(example, index, values))
    .map((line) => line.replace(placeholder, (_, name) => String(values[name])))
    .join("\n")
}
