export type ControlValue = number | boolean | string

export type Control = { name: string; value: ControlValue; options?: string[] }

export type ControlValues = Record<string, ControlValue>

export type ExampleSource = {
  controls: Control[]
  log: boolean
  template: string
  conditions: Record<number, string>
}

const call = /control\("(\w+)", ("[^"]*"|\w+)\)/g
const placeholder = /__control_(\w+)__/g

function parseValue(text: string): ControlValue {
  if (text.startsWith('"')) return text.slice(1, -1)
  return text === "true" || (text !== "false" && Number(text))
}

function parseOptions(file: string): Record<string, string[]> {
  const body = /useControl\(\{([\s\S]*?)\}\)/.exec(file)?.[1] ?? ""
  return Object.fromEntries(
    [...body.matchAll(/(\w+): \[([^\]]*)\]/g)].map(([, name, list]) => [
      name,
      [...list.matchAll(/"([^"]*)"/g)].map(([, option]) => option),
    ])
  )
}

function stripDocsHooks(file: string) {
  return file
    .replace(
      /^import \{[^}]*\} from "@\/components\/site\/docs\/preview"\n/m,
      ""
    )
    .replace(/^ *const \{[^}]*\} = useActions\((?:[^()]|\([^()]*\))*\)\n/m, "")
    .replace(/^ *const control = useControl\((?:\{[\s\S]*?\})?\)\n/m, "")
    .replace(/^ *useAutoReset\(.*\)\n/m, "")
    .replace(/\{\n\n+/g, "{\n")
    .trim()
}

export function parseExample(file: string): ExampleSource {
  const options = parseOptions(file)
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
      const choice = /^( *)(\w+)=\{control\("(\w+)", "[^"]*"\)\}$/.exec(line)
      if (choice) return `${choice[1]}${choice[2]}="__control_${choice[3]}__"`
      return line.replace(call, (_, name) => `__control_${name}__`)
    })
    .join("\n")

  return {
    controls: [...file.matchAll(call)]
      .filter(
        ([, name], index, all) =>
          all.findIndex(([, other]) => other === name) === index
      )
      .map(([, name, value]) => ({
        name,
        value: parseValue(value),
        ...(options[name] && { options: options[name] }),
      })),
    log: file.includes("useActions("),
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
