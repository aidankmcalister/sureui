import type { Metadata } from "next"

import { Code } from "@/components/site/code/code"
import {
  DocsHeader,
  DocsSection,
  InlineCode,
} from "@/components/site/docs/sections"
import { Label } from "@/components/site/layout/frame"
import { InstallCommand } from "@/components/site/code/install-command"
import { installSteps } from "@/lib/site/pages"

export const metadata: Metadata = { title: "Installation" }

export default function Installation() {
  return (
    <>
      <DocsHeader href="/docs/installation" />
      <DocsSection label="Steps">
        <ol className="divide-y divide-(--rule) border border-(--rule)">
          {installSteps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-[48px_minmax(0,1fr)] sm:px-5"
            >
              <Label className="pt-1 text-(--mark-text)">
                {String(index + 1).padStart(2, "0")}
              </Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-1">
                  <h2 className="font-semibold">{step.title}</h2>
                  <p className="text-sm text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
                    <InlineCode>{step.body}</InlineCode>
                  </p>
                </div>
                {step.command && <InstallCommand args={step.command} />}
                {step.code && (
                  <Code label={step.code.label} highlight={step.code.highlight}>
                    {step.code.source}
                  </Code>
                )}
              </div>
            </li>
          ))}
        </ol>
      </DocsSection>
    </>
  )
}
