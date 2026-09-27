import type { Metadata } from "next"
import { CheckIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { Code, Command } from "@/components/site/code"
import { Demo } from "@/components/site/demos"
import { DocsHeader, DocsSection, StyleLink } from "@/components/site/docs"
import { Label } from "@/components/site/frame"
import { Preview } from "@/components/site/preview"
import { PropsTable } from "@/components/site/props-table"
import { getStyle, installCommand, styles } from "@/components/site/styles"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return styles.map((style) => ({ slug: style.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getStyle((await params).slug)?.name }
}

export default async function StylePage({ params }: Props) {
  const style = getStyle((await params).slug)
  if (!style) notFound()

  const figure = String(styles.indexOf(style) + 1).padStart(2, "0")

  return (
    <>
      <DocsHeader href={`/docs/${style.slug}`} lead={style.lead}>
        <Preview figure={figure} code={<Code>{style.usage}</Code>}>
          <Demo slug={style.slug} />
        </Preview>
      </DocsHeader>
      <DocsSection label="Installation">
        <div className="grid grid-cols-1 gap-2">
          {style.items.map((item) => (
            <Command key={item}>{installCommand(item)}</Command>
          ))}
        </div>
      </DocsSection>
      <DocsSection label="Usage">
        <Code>{style.usage}</Code>
      </DocsSection>
      {style.behavior && (
        <DocsSection label="How it behaves">
          <ul className="grid max-w-160 list-disc gap-3 pl-5 text-sm text-pretty marker:text-(--ink-label)">
            {style.behavior.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DocsSection>
      )}
      <DocsSection label="Props" className="gap-6">
        {style.api.map((api) => (
          <div key={api.name} className="grid gap-3">
            {style.api.length > 1 && (
              <h3 className="font-mono text-sm font-medium">{api.name}</h3>
            )}
            <PropsTable rows={api.rows} />
          </div>
        ))}
      </DocsSection>
      <DocsSection label="When to use it">
        <div className="grid gap-px border border-(--rule) bg-(--rule) md:grid-cols-2">
          <div className="grid content-start gap-4 bg-(--paper) p-5">
            <Label>Use it when</Label>
            <ul className="grid gap-3 text-sm">
              {style.useWhen.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-(--ink-label)" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-4 bg-(--paper) p-5">
            <Label>Reach for something else when</Label>
            <ul className="grid gap-3 text-sm">
              {style.instead.map((item) => (
                <li key={item.slug} className="grid gap-0.5">
                  <span className="text-(--ink-muted)">{item.when}</span>
                  <StyleLink slug={item.slug}>
                    {styles.find((other) => other.slug === item.slug)?.name} →
                  </StyleLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DocsSection>
    </>
  )
}
