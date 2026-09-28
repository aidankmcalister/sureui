import type { Metadata } from "next"
import { CheckIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { Code } from "@/components/site/code/code"
import { ApiDemo, Demo } from "@/components/site/docs/demos"
import { Figure } from "@/components/site/docs/figure"
import {
  DocsHeader,
  DocsSection,
  StyleLink,
} from "@/components/site/docs/sections"
import { Label } from "@/components/site/layout/frame"
import { Preview } from "@/components/site/docs/preview"
import { PropsTable } from "@/components/site/docs/props-table"
import { InstallCommand } from "@/components/site/code/install-command"
import { addArgs } from "@/lib/site/config"
import { getStyle, sectionsFor, styles, whenLabels } from "@/lib/site/styles"

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
      <DocsHeader href={`/docs/${style.slug}`}>
        <Preview
          figure={figure}
          log={!style.inlineFeedback}
          code={<Code framed={false}>{style.preview ?? style.usage}</Code>}
        >
          <Demo slug={style.slug} />
        </Preview>
      </DocsHeader>
      {sectionsFor(style).map((section) => (
        <DocsSection
          key={section.id}
          label={section.label}
          className={section.id === "props" ? "gap-6" : undefined}
        >
          {section.id === "installation" && (
            <InstallCommand args={addArgs(style.items)} />
          )}
          {section.id === "usage" && <Code>{style.usage}</Code>}
          {section.id === "behavior" && (
            <ul className="grid max-w-160 list-disc gap-3 pl-5 text-sm text-pretty marker:text-(--ink-label)">
              {(style.behavior ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.id === "props" &&
            style.api.map((api) => (
              <div key={api.name} className="grid gap-3">
                {style.api.length > 1 && (
                  <h3 className="font-mono text-sm font-medium">{api.name}</h3>
                )}
                {api.figure && (
                  <Figure
                    label={`Fig. ${figure}·${String.fromCharCode(
                      98 + style.api.filter((item) => item.figure).indexOf(api)
                    )}`}
                  >
                    <ApiDemo slug={style.slug} api={api.name} />
                  </Figure>
                )}
                <PropsTable rows={api.rows} />
              </div>
            ))}
          {section.id === "when" && (
            <div className="grid gap-px border border-(--rule) bg-(--rule) md:grid-cols-2">
              <div className="grid content-start gap-4 bg-(--paper) p-5">
                <Label>{whenLabels.use}</Label>
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
                <Label>{whenLabels.instead}</Label>
                <ul className="grid gap-3 text-sm">
                  {style.instead.map((item) => (
                    <li key={item.slug} className="grid gap-0.5">
                      <span className="text-(--ink-muted)">{item.when}</span>
                      <StyleLink slug={item.slug}>
                        {styles.find((other) => other.slug === item.slug)?.name}{" "}
                        →
                      </StyleLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DocsSection>
      ))}
    </>
  )
}
