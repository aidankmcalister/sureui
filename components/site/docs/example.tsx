import { highlight } from "@/components/site/code/highlight"
import { ExampleCode } from "@/components/site/docs/example-code"
import { Preview } from "@/components/site/docs/preview"
import { loadExample } from "@/lib/site/examples"

export async function Example({ name }: { name: string }) {
  const { default: Component } = await import(
    `@/components/site/docs/examples/${name}.tsx`
  )
  const example = loadExample(name)

  return (
    <Preview
      log={example.log}
      controls={example.controls}
      code={
        <ExampleCode lines={highlight(example.template)} example={example} />
      }
    >
      <Component />
    </Preview>
  )
}
