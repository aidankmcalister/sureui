"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { track } from "@/lib/site/analytics"
import { choose, questions, type Answers } from "@/lib/site/choose"
import { InstallCommand } from "@/components/site/code/install-command"
import { Label } from "@/components/site/layout/frame"
import { siteButton } from "@/components/site/ui/button"

export function Chooser() {
  const [answers, setAnswers] = React.useState<Answers>({
    undo: "later",
    count: "one",
    place: "button",
  })
  const choice = choose(answers)

  return (
    <div className="not-prose my-6 border border-(--rule) bg-(--well)">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 p-4">
        {questions.map((question) => (
          <fieldset key={question.key} className="grid gap-2">
            <legend className="mb-2">
              <Label>{question.label}</Label>
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {question.options.map((option) => {
                const selected = answers[question.key] === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      const next = { ...answers, [question.key]: option.value }
                      setAnswers(next)
                      track("choose", { ...next, item: choose(next).item })
                    }}
                    className={siteButton({
                      variant: selected ? "primary" : "outline",
                      size: "sm",
                      className: "tracking-normal normal-case",
                    })}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div
        aria-live="polite"
        className="grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-(--rule) p-4"
      >
        <p>
          <Link
            href={choice.href}
            className="font-medium text-(--ink) underline decoration-(--mark) underline-offset-4"
          >
            {choice.name}
          </Link>
          <span className="text-(--ink-muted)">: {choice.why}</span>
        </p>
        <pre
          className={cn(
            "overflow-x-auto border border-(--rule) bg-(--paper) px-3 py-2 font-mono text-[13px] text-(--code-foreground)"
          )}
        >
          {choice.code}
        </pre>
        <InstallCommand args={`add @sureui/${choice.item}`} />
      </div>
    </div>
  )
}
