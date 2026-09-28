import { Code } from "@/components/site/code/code"
import { Preview } from "@/components/site/docs/preview"
import {
  exampleControls,
  exampleNames,
  exampleSource,
  usesLog,
} from "@/lib/site/docs"
import { toggleKey, type ControlValues } from "@/lib/site/controls"

function toggleCombinations(names: string[]) {
  return names.reduce<ControlValues[]>(
    (combos, name) =>
      combos.flatMap((combo) => [
        { ...combo, [name]: false },
        { ...combo, [name]: true },
      ]),
    [{}]
  )
}

export async function Example({ name }: { name: string }) {
  const { default: Component } = await import(
    `@/components/site/docs/examples/${name}.tsx`
  )
  const index = exampleNames(name.split("/")[0]).indexOf(name)
  const controls = exampleControls(name)
  const toggles = controls
    .filter((control) => typeof control.value === "boolean")
    .map((control) => control.name)

  return (
    <Preview
      figure={String(index + 1).padStart(2, "0")}
      log={usesLog(name)}
      controls={controls}
      code={<Code framed={false}>{exampleSource(name)}</Code>}
      codes={
        controls.length > 0
          ? Object.fromEntries(
              toggleCombinations(toggles).map((values) => [
                toggleKey(values),
                <Code key={toggleKey(values)} framed={false}>
                  {exampleSource(name, values, true)}
                </Code>,
              ])
            )
          : undefined
      }
    >
      <Component />
    </Preview>
  )
}
