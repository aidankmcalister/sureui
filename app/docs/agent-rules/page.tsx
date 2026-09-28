import type { Metadata } from "next"

import { Code } from "@/components/site/code/code"
import { InstallCommand } from "@/components/site/code/install-command"
import {
  DocsHeader,
  DocsSection,
  InlineCode,
  Prose,
} from "@/components/site/docs/sections"
import { agentRules } from "@/lib/site/pages"

export const metadata: Metadata = { title: "Agent rules" }

export default function AgentRules() {
  const { intro, shadcn, skill, contents } = agentRules

  return (
    <>
      <DocsHeader href="/docs/agent-rules" />
      <DocsSection label={intro.label}>
        <Prose>
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Prose>
      </DocsSection>
      <DocsSection label={shadcn.label}>
        <Prose>
          <p>
            <InlineCode>{shadcn.body}</InlineCode>
          </p>
        </Prose>
        <InstallCommand args={shadcn.command} />
      </DocsSection>
      <DocsSection label={skill.label}>
        <Prose>
          <p>{skill.body}</p>
        </Prose>
        <Code label="bash">{skill.command}</Code>
      </DocsSection>
      <DocsSection label={contents.label}>
        <ul className="grid max-w-160 list-disc gap-3 pl-5 text-sm text-pretty marker:text-(--ink-label) [&_code]:font-mono [&_code]:text-[0.9em]">
          {contents.items.map((item) => (
            <li key={item}>
              <InlineCode>{item}</InlineCode>
            </li>
          ))}
        </ul>
      </DocsSection>
    </>
  )
}
