"use client"

import * as React from "react"
import { ArrowUpIcon, BotIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import {
  ToolApproval,
  type ToolApprovalPart,
} from "@/components/ui/sureui/tool-approval"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

export type Call = (text: string) => void

export type Cursor = {
  moveTo: (
    target: Element | null,
    at?: { x?: number; y?: number }
  ) => Promise<void>
  press: (target: Element | null, ms?: number) => Promise<void>
  click: (target: Element | null) => Promise<void>
  type: (target: Element | null, text: string) => Promise<void>
  wait: (ms: number) => Promise<void>
  find: (selector: string, text?: string) => HTMLElement | null
  until: (get: () => HTMLElement | null) => Promise<HTMLElement | null>
}

export type Scene = {
  id: string
  label: string
  hint: string
  render: (call: Call) => React.ReactNode
  run: (cursor: Cursor) => Promise<void>
}

function AgentScene({ call }: { call: Call }) {
  const [draft, setDraft] = React.useState("")
  const [sent, setSent] = React.useState("")
  const [step, setStep] = React.useState<"sent" | "thinking" | "reply">("sent")
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })

  React.useEffect(() => {
    if (!sent) return
    const timers = [
      setTimeout(() => setStep("thinking"), 500),
      setTimeout(() => setStep("reply"), 1200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [sent])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto] gap-3 self-stretch text-sm">
      <div className="grid content-end gap-2">
        {sent && (
          <p className="w-fit max-w-[80%] animate-in justify-self-end rounded-xl rounded-br-sm bg-primary px-3 py-1.5 text-primary-foreground duration-200 fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
            {sent}
          </p>
        )}
        {step !== "sent" && (
          <div className="flex max-w-[90%] animate-in items-start gap-2 duration-200 fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
            <BotIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
            <div className="grid gap-2">
              <p className="w-fit rounded-xl rounded-bl-sm bg-muted px-3 py-1.5">
                {step === "reply" ? (
                  <>
                    I&apos;ll drop <code className="font-mono">users_old</code>.
                    It has 2.1M rows.
                  </>
                ) : (
                  <span className="animate-pulse tracking-widest">···</span>
                )}
              </p>
              {step === "reply" && (
                <ToolApproval
                  risk="high"
                  part={part}
                  onRespond={(response) => {
                    setPart({ state: "approval-responded", approval: response })
                    call(
                      `addToolApprovalResponse({ approved: ${response.approved} })`
                    )
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-xl border bg-background py-1.5 pr-1.5 pl-3 shadow-xs">
        <input
          aria-label="Message the agent"
          placeholder="Message the agent"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <Button
          size="icon"
          aria-label="Send"
          disabled={!draft}
          onClick={() => {
            setSent(draft)
            setDraft("")
          }}
          className="size-7 rounded-full"
        >
          <ArrowUpIcon />
        </Button>
      </div>
    </div>
  )
}

export const scenes: Scene[] = [
  {
    id: "hold",
    label: "Hold",
    hint: "press and hold",
    render: (call) => (
      <ConfirmButton
        gesture="hold"
        variant="destructive"
        size="lg"
        onConfirm={() => call('deleteProject("acme-prod")')}
      >
        Hold to delete project
      </ConfirmButton>
    ),
    async run(c) {
      const button = c.find("button")
      await c.moveTo(button)
      await c.press(button)
      await c.wait(1300)
    },
  },
  {
    id: "again",
    label: "Click again",
    hint: "click, then click again",
    render: (call) => (
      <ConfirmButton
        gesture="click-again"
        variant="destructive"
        size="lg"
        onConfirm={() => call('deleteBranch("fix/login")')}
      >
        Delete branch
      </ConfirmButton>
    ),
    async run(c) {
      const button = c.find("button")
      await c.moveTo(button)
      await c.click(button)
      await c.wait(900)
      await c.click(button)
      await c.wait(1300)
    },
  },
  {
    id: "type",
    label: "Type",
    hint: "type the name",
    render: (call) => (
      <TypeToConfirm
        phrase="acme-prod"
        variant="destructive"
        confirmLabel="Delete project"
        onConfirm={() => call('deleteProject("acme-prod")')}
        className="w-full"
      />
    ),
    async run(c) {
      const input = c.find("input")
      await c.moveTo(input, { x: 0.2 })
      await c.click(input)
      await c.type(input, "acme-prod")
      await c.wait(350)
      const button = c.find("button", "Delete project")
      await c.moveTo(button)
      await c.click(button)
      await c.wait(1300)
    },
  },
  {
    id: "undo",
    label: "Undo",
    hint: "it waits before it runs",
    render: (call) => (
      <ConfirmButton
        undo={4000}
        variant="outline"
        size="lg"
        onConfirm={() => call("archiveThread(482)")}
        onCancel={() => call("// undone, nothing ran")}
      >
        Archive thread
      </ConfirmButton>
    ),
    async run(c) {
      const button = c.find("button")
      await c.moveTo(button)
      await c.click(button)
      await c.moveTo(button, { y: 2.2 })
      await c.wait(1500)
      await c.moveTo(button)
      await c.click(button)
      await c.wait(1300)
    },
  },
  {
    id: "switch",
    label: "Switch",
    hint: "it saves when the window closes",
    render: (call) => (
      <div className="flex w-full items-center justify-between gap-6 rounded-lg border bg-card p-4 text-sm">
        <div className="grid gap-0.5">
          <p className="font-medium">Public repository</p>
          <p className="text-muted-foreground">Anyone can see the code.</p>
        </div>
        <ConfirmSwitch
          aria-label="Public repository"
          defaultChecked
          undo={2500}
          undoLabel
          onConfirm={(checked) => call(`setPublic(${checked})`)}
        />
      </div>
    ),
    async run(c) {
      const toggle = c.find("[role=switch]")
      await c.moveTo(toggle)
      await c.click(toggle)
      await c.moveTo(toggle, { x: -6, y: 1.8 })
      await c.wait(3600)
    },
  },
  {
    id: "agent",
    label: "Agent",
    hint: "the agent waits for you",
    render: (call) => <AgentScene call={call} />,
    async run(c) {
      const input = c.find("input")
      await c.moveTo(input, { x: 0.3 })
      await c.click(input)
      await c.type(input, "Clean up the old users table")
      await c.wait(150)
      const send = c.find("[aria-label=Send]")
      await c.moveTo(send)
      await c.click(send)
      const button = await c.until(() => c.find("button", "Hold to approve"))
      await c.wait(250)
      await c.moveTo(button)
      await c.press(button)
      await c.wait(1200)
    },
  },
]
