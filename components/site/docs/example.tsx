import { Code } from "@/components/site/code/code"
import { Preview } from "@/components/site/docs/preview"
import { exampleNames, exampleSource, usesLog } from "@/lib/site/docs"

export async function Example({ name }: { name: string }) {
  const { default: Component } = await import(
    `@/components/site/docs/examples/${name}.tsx`
  )
  const index = exampleNames(name.split("/")[0]).indexOf(name)

  return (
    <Preview
      figure={String(index + 1).padStart(2, "0")}
      log={usesLog(name)}
      code={<Code framed={false}>{exampleSource(name)}</Code>}
    >
      <Component />
    </Preview>
  )
}
