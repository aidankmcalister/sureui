"use client"

import * as React from "react"
import Link from "next/link"
import { Select } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { track } from "@/lib/site/analytics"
import { asks, choose, questions, type Answers } from "@/lib/site/choose"
import { CodeView, type Token } from "@/components/site/code/code-view"
import { InstallCommand } from "@/components/site/code/install-command"
import { InlineCode } from "@/components/site/docs/sections"
import ChoosingCount from "@/components/site/docs/examples/choosing-a-confirmation/count"
import ConfirmButtonClickAgain from "@/components/site/docs/examples/confirm-button/click-again"
import ConfirmButtonUndo from "@/components/site/docs/examples/confirm-button/undo"
import ConfirmDialogSelectChange from "@/components/site/docs/examples/confirm-dialog/select-change"
import ConfirmDialogTypedPhrase from "@/components/site/docs/examples/confirm-dialog/typed-phrase"
import ConfirmMenuItemDemo from "@/components/site/docs/examples/confirm-menu-item/demo"
import ConfirmMenuItemUndo from "@/components/site/docs/examples/confirm-menu-item/undo"
import ToolApprovalCritical from "@/components/site/docs/examples/tool-approval/critical"
import ToolApprovalLow from "@/components/site/docs/examples/tool-approval/low"
import ToolApprovalMedium from "@/components/site/docs/examples/tool-approval/medium"
import UndoableDemo from "@/components/site/docs/examples/undoable/demo"
import UnsavedChangesDemo from "@/components/site/docs/examples/unsaved-changes/demo"

export const demos: Record<string, React.ComponentType> = {
  "choosing-a-confirmation/count": ChoosingCount,
  "confirm-button/click-again": ConfirmButtonClickAgain,
  "confirm-button/undo": ConfirmButtonUndo,
  "confirm-dialog/select-change": ConfirmDialogSelectChange,
  "confirm-dialog/typed-phrase": ConfirmDialogTypedPhrase,
  "confirm-menu-item/demo": ConfirmMenuItemDemo,
  "confirm-menu-item/undo": ConfirmMenuItemUndo,
  "tool-approval/critical": ToolApprovalCritical,
  "tool-approval/low": ToolApprovalLow,
  "tool-approval/medium": ToolApprovalMedium,
  "undoable/demo": UndoableDemo,
  "unsaved-changes/demo": UnsavedChangesDemo,
}

const rows: Record<string, string[]> = {
  "confirm-button/click-again": ["fix/login-redirect", "feat/billing-page"],
  "confirm-dialog/typed-phrase": ["acme-prod", "acme-staging"],
}

type Question = (typeof questions)[number]

function Choice({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select.Root
      items={question.options.map(({ value, label }) => ({ value, label }))}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <Select.Trigger
        aria-label={question.label}
        className="inline-flex cursor-pointer items-baseline gap-1 font-medium text-(--ink) underline decoration-(--mark) decoration-2 underline-offset-[6px] outline-none hover:decoration-(--mark-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mark) data-popup-open:decoration-(--mark-text)"
      >
        <Select.Value />
        <Select.Icon className="self-center text-(--ink-label)">
          <ChevronDownIcon aria-hidden className="size-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          sideOffset={8}
          align="start"
          alignItemWithTrigger={false}
          className="z-50"
        >
          <Select.Popup className="min-w-(--anchor-width) border border-(--rule) bg-(--well) py-1 text-(--ink) shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] outline-none">
            {question.options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex cursor-default items-center gap-6 py-2 pr-3 pl-4 text-[15px] text-(--ink-muted) outline-none select-none data-highlighted:bg-(--rule)/50 data-highlighted:text-(--ink) data-selected:text-(--ink)"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto text-(--mark)">
                  <CheckIcon aria-hidden className="size-3.5" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}

export function ChooserPicker({
  code,
}: {
  code: Record<string, { text: string; lines: Token[][] }>
}) {
  const [answers, setAnswers] = React.useState<Answers>({
    place: "button",
    undo: "later",
    count: "one",
  })
  const choice = choose(answers)
  const shown = asks(answers.place)
  const Demo = demos[choice.example]
  const example = code[choice.example]
  const question = (key: keyof Answers) =>
    questions.find((item) => item.key === key)!

  function answer(key: keyof Answers, value: string) {
    const next = { ...answers, [key]: value } as Answers
    setAnswers(next)
    track("choose", { ...next, item: choose(next).item })
  }

  const choiceFor = (key: keyof Answers) => (
    <Choice
      question={question(key)}
      value={answers[key]}
      onChange={(value) => answer(key, value)}
    />
  )

  return (
    <div className="not-prose my-8 border border-(--rule) bg-(--well)">
      <p className="px-4 py-4 leading-9 text-pretty text-(--ink-muted) sm:px-6">
        I&apos;m confirming {choiceFor("place")}
        {shown.includes("undo") && <> that {choiceFor("undo")}</>}
        {shown.includes("count") && <> and affects {choiceFor("count")}</>}.
      </p>
      <p
        aria-live="polite"
        className="border-t border-(--rule) px-4 py-4 leading-7 text-pretty text-(--ink-muted) sm:px-6"
      >
        Use{" "}
        <Link
          href={choice.href}
          className="font-medium text-(--ink) underline decoration-(--rule) underline-offset-4 hover:decoration-(--ink) [&_code]:font-mono [&_code]:text-[0.9em]"
        >
          <InlineCode>{choice.name}</InlineCode>
        </Link>
        : {choice.why.charAt(0).toLowerCase() + choice.why.slice(1)}
      </p>
      <div className="grid min-h-40 place-items-center border-t border-(--rule) bg-(--paper) px-4 py-8 sm:px-6">
        {answers.place === "row" && rows[choice.example] ? (
          <ul className="w-full max-w-sm divide-y rounded-lg border text-sm">
            {rows[choice.example].map((name) => (
              <li
                key={`${choice.example}-${name}`}
                className="flex items-center justify-between gap-4 py-1.5 pr-1.5 pl-3"
              >
                <span className="truncate">{name}</span>
                <Demo />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex w-full justify-center">
            <Demo key={choice.example} />
          </div>
        )}
      </div>
      <div className="border-t border-(--rule)">
        <CodeView
          framed={false}
          name={choice.example}
          lines={example.lines}
          copy={example.text}
          bodyClassName="max-h-72 overflow-y-auto"
        />
      </div>
      <div className="border-t border-(--rule)">
        <InstallCommand args={`add @sureui/${choice.item}`} framed={false} />
      </div>
    </div>
  )
}
