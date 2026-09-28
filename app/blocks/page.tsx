import { readFileSync } from "node:fs"
import type { Metadata } from "next"

import { BlockDemo } from "@/components/site/blocks/demos"
import { Code } from "@/components/site/code/code"
import { CodeFiles } from "@/components/site/code/code-files"
import { InstallCommand } from "@/components/site/code/install-command"
import { Preview } from "@/components/site/docs/preview"
import { InlineCode, StyleLink } from "@/components/site/docs/sections"
import { Band, Label } from "@/components/site/layout/frame"
import { blocks, blocksLead, blocksNote, type Block } from "@/lib/site/blocks"
import { addArgs } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Blocks",
  description: "Full screens built from SureUI confirmation components.",
}

function number(index: number) {
  return String(index + 1).padStart(2, "0")
}

function BlockSection({ block, index }: { block: Block; index: number }) {
  const files = block.files.map((file) => ({
    name: file.target,
    code: (
      <Code framed={false} label={file.target} bodyClassName="max-h-128">
        {readFileSync(file.path, "utf8").trimEnd()}
      </Code>
    ),
  }))

  return (
    <section
      id={block.name}
      aria-labelledby={`${block.name}-title`}
      className="grid scroll-mt-4 grid-cols-1 gap-8 px-3 py-12 sm:px-6 lg:py-16"
    >
      <div className="grid max-w-160 gap-3">
        <Label className="text-(--mark-text)">
          Block {number(index)}{" "}
          <span className="text-(--ink-label)">· {block.name}</span>
        </Label>
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
      <Preview
        label={block.name}
        log={false}
        resettable
        stageClassName="min-h-96 px-3 py-8 sm:p-10"
        code={<CodeFiles files={files} />}
      >
        <div className="flex w-full max-w-3xl justify-center">
          <BlockDemo name={block.name} />
        </div>
      </Preview>
      <div className="grid gap-px border border-(--rule) bg-(--rule) lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid content-start gap-5 bg-(--paper) p-5">
          <Label>Why each action asks what it does</Label>
          <ul className="grid gap-5 text-sm">
            {block.actions.map((action) => (
              <li
                key={action.action}
                className="grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
              >
                <div className="grid content-start gap-0.5">
                  <span className="font-medium text-(--ink)">
                    {action.action}
                  </span>
                  {action.style ? (
                    <StyleLink slug={action.style}>
                      {action.styleName} →
                    </StyleLink>
                  ) : (
                    <span className="text-(--ink-label)">
                      {action.styleName}
                    </span>
                  )}
                </div>
                <p className="text-pretty text-(--ink-muted)">{action.why}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-4 bg-(--paper) p-5">
          <Label>Installation</Label>
          <InstallCommand args={addArgs([block.name])} />
          <p className="text-sm text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
            Adds{" "}
            {block.files.map((file, fileIndex) => (
              <span key={file.target}>
                {fileIndex > 0 && ", "}
                <code>{file.target}</code>
              </span>
            ))}{" "}
            and the SureUI components it uses.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Blocks() {
  return (
    <main>
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
          <span className="block text-(--mark)">Blocks</span>
          built from SureUI.
        </h1>
        <div className="grid max-w-140 gap-3 text-[17px] leading-7 text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
          <p>
            <InlineCode>{blocksLead}</InlineCode>
          </p>
          <p>{blocksNote}</p>
        </div>
        <nav aria-label="Blocks" className="flex flex-wrap gap-x-6 gap-y-2">
          {blocks.map((block, index) => (
            <a
              key={block.name}
              href={`#${block.name}`}
              className="flex items-baseline gap-2 text-sm text-(--ink-muted) hover:text-(--ink)"
            >
              <Label>{number(index)}</Label>
              {block.title}
            </a>
          ))}
        </nav>
      </Band>
      {blocks.map((block, index) => (
        <Band key={block.name}>
          <BlockSection block={block} index={index} />
        </Band>
      ))}
    </main>
  )
}
