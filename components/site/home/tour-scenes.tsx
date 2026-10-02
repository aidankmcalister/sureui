"use client"

import * as React from "react"

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
}

export type Scene = {
  id: string
  label: string
  hint: string
  render: (call: Call) => React.ReactNode
  run: (cursor: Cursor) => Promise<void>
}

function AgentScene({ call }: { call: Call }) {
  const [part, setPart] = React.useState<ToolApprovalPart>({
    state: "approval-requested",
    approval: { id: "approval_1" },
  })
  return (
    <div className="grid w-full gap-3 text-sm">
      <p className="w-fit rounded-lg bg-muted px-3 py-2">
        I&apos;ll drop the <code className="font-mono">users_old</code> table.
      </p>
      <ToolApproval
        risk="high"
        part={part}
        onRespond={(response) => {
          setPart({ state: "approval-responded", approval: response })
          call(`addToolApprovalResponse({ approved: ${response.approved} })`)
        }}
      />
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
      await c.wait(400)
      const button = c.find("button", "Hold to approve")
      await c.moveTo(button)
      await c.press(button)
      await c.wait(1500)
    },
  },
]
