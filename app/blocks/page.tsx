import { readFileSync } from "node:fs"
import type { Metadata } from "next"

import { BlockPreview } from "@/components/site/blocks/previews"
import { Code } from "@/components/site/code/code"
import { InstallCommand } from "@/components/site/code/install-command"
import { Preview } from "@/components/site/docs/preview"
import { InlineCode } from "@/components/site/docs/sections"
import {
  aboveMark,
  Band,
  PageLead,
  PageTitle,
} from "@/components/site/layout/frame"
import { blocks, type Block } from "@/lib/site/registry"

export const metadata: Metadata = {
  title: "Blocks",
  description: "Full screens built from SureUI confirmation components.",
}

const blocksLead =
  "Full screens built from SureUI components. The shadcn CLI installs each one into your `components/` folder as app code you edit, along with the SureUI components it uses."

function BlockSection({ block }: { block: Block }) {
  return (
    <section
      id={block.name}
      className="grid scroll-mt-4 grid-cols-1 gap-6 px-3 py-12 sm:px-6 lg:py-16"
    >
      <div className="grid max-w-160 gap-3">
        <h2
          id={`${block.name}-title`}
          className="font-display text-3xl leading-9 font-bold tracking-[-0.04em] text-balance sm:text-[40px] sm:leading-11"
        >
          {block.title}
        </h2>
        <p className="text-[17px] leading-7 text-pretty text-(--ink-muted)">
          {block.description}
        </p>
      </div>
      <InstallCommand args={`add @sureui/${block.name}`} />
      <Preview
        name={block.name}
        log={false}
        code={
          <div className="divide-y divide-(--rule)">
            {block.files.map((file, index) => (
              <Code
                key={file.path}
                framed={false}
                collapsible={block.files.length > 1}
                defaultOpen={index === 0}
                label={file.name}
                bodyClassName="max-h-128 overflow-y-auto"
              >
                {readFileSync(file.path, "utf8").trimEnd()}
              </Code>
            ))}
          </div>
        }
      >
        <div className="flex w-full max-w-2xl justify-center py-4">
          <BlockPreview name={block.name} />
        </div>
      </Preview>
    </section>
  )
}

export default function Blocks() {
  return (
    <main>
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <PageTitle>
          <span className="block text-(--mark)">Blocks</span>
          built from SureUI<span className="text-(--mark)">.</span>
        </PageTitle>
        <PageLead className="text-[17px] leading-7 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
          <InlineCode>{blocksLead}</InlineCode>
        </PageLead>
      </Band>
      {blocks.map((block) => (
        <Band key={block.name} className={aboveMark}>
          <BlockSection block={block} />
        </Band>
      ))}
    </main>
  )
}
