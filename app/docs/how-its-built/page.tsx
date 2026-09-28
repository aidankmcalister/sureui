import type { Metadata } from "next"

import { Code } from "@/components/site/code/code"
import {
  DocsHeader,
  DocsSection,
  InlineCode,
  Prose,
} from "@/components/site/docs/sections"
import { StateDiagram } from "@/components/site/docs/state-diagram"
import { howItsBuilt, type GuideSection } from "@/lib/site/how-its-built"

export const metadata: Metadata = { title: "How it's built" }

function Paragraphs({ section }: { section: GuideSection }) {
  return (
    <Prose>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph}>
          <InlineCode>{paragraph}</InlineCode>
        </p>
      ))}
    </Prose>
  )
}

export default function HowItsBuilt() {
  const { core, states, sections } = howItsBuilt

  return (
    <>
      <DocsHeader href="/docs/how-its-built" />
      <DocsSection label={core.label}>
        <Paragraphs section={core} />
      </DocsSection>
      <DocsSection label={states.label}>
        <Paragraphs section={states} />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <StateDiagram description={states.figure} />
          <dl className="divide-y divide-(--rule) border border-(--rule)">
            {states.notes.map((state) => (
              <div key={state.name} className="grid gap-1 px-4 py-3.5">
                <dt className="font-mono text-[13px] text-(--mark-text)">
                  {state.name}
                </dt>
                <dd className="text-sm leading-6 text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
                  <InlineCode>{state.note}</InlineCode>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DocsSection>
      {sections.map((section) => (
        <DocsSection key={section.id} label={section.label}>
          <Paragraphs section={section} />
          {section.items && (
            <ul className="grid max-w-160 list-disc gap-3 pl-5 text-sm text-pretty marker:text-(--ink-label) [&_code]:font-mono [&_code]:text-[0.9em]">
              {section.items.map((item) => (
                <li key={item}>
                  <InlineCode>{item}</InlineCode>
                </li>
              ))}
            </ul>
          )}
          {section.excerpt && (
            <Code label={section.excerpt.file}>{section.excerpt.source}</Code>
          )}
        </DocsSection>
      ))}
    </>
  )
}
