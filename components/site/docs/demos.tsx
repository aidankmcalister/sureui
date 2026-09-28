"use client"

import * as React from "react"
import {
  ArchiveIcon,
  CheckIcon,
  EllipsisIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import {
  ConfirmDialog,
  useConfirm,
} from "@/components/ui/sureui/confirm-dialog"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { ConfirmSwitch } from "@/components/ui/sureui/confirm-switch"
import { Consequences } from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useReport } from "@/components/site/docs/preview"

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
)

const files = ["q3-report.pdf", "brand-assets.zip", "meeting-notes.md"]

function UndoableList() {
  const report = useReport()
  const [names, setNames] = React.useState(files)

  return (
    <ul className="w-full max-w-sm divide-y rounded-lg border bg-background text-sm">
      {names.map((name) => (
        <Undoable
          key={name}
          render={<li className="flex items-center gap-2 py-1.5 pr-1.5 pl-3" />}
          label={`Deleted ${name}`}
          onConfirm={() => {
            setNames((prev) => prev.filter((item) => item !== name))
            report(`onConfirm, ${name} removed`)
          }}
          onCancel={() => report(`onCancel, ${name} restored`)}
        >
          {({ remove }) => (
            <>
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${name}`}
                onClick={remove}
              >
                <Trash2Icon />
              </Button>
            </>
          )}
        </Undoable>
      ))}
      {names.length === 0 && (
        <li className="flex items-center justify-between gap-2 py-1.5 pr-1.5 pl-3 text-muted-foreground">
          No files
          <Button variant="outline" size="sm" onClick={() => setNames(files)}>
            Reset
          </Button>
        </li>
      )}
    </ul>
  )
}

function UndoDemo() {
  const report = useReport()

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        <ConfirmButton
          undo
          variant="outline"
          onConfirm={() => report("onConfirm, the undo window closed")}
          onCancel={() => report("onCancel, undone")}
        >
          Move to trash
        </ConfirmButton>
        <Button
          variant="outline"
          onClick={async () => {
            const { undoToast } =
              await import("@/components/ui/sureui/undo-toast")
            const committed = await undoToast("Moved 3 files to trash")
            report(`undoToast() resolved ${committed}`)
          }}
        >
          Trash with a toast
        </Button>
      </div>
      <UndoableList />
      <Toaster />
    </div>
  )
}

function TwoFactorSetting() {
  const report = useReport()
  const id = React.useId()

  return (
    <div className="group flex w-full max-w-sm items-center justify-between gap-4 rounded-lg border bg-background p-3">
      <div className="grid gap-1.5">
        <Label htmlFor={id}>Two-factor authentication</Label>
        <p className="text-sm text-muted-foreground group-has-[[data-state=armed]]:hidden">
          Ask for a code at every sign-in.
        </p>
        <p
          aria-hidden
          className="hidden text-sm text-destructive group-has-[[data-state=armed]]:block"
        >
          Click again to turn off
        </p>
      </div>
      <ConfirmSwitch
        id={id}
        defaultChecked
        onConfirm={async (on) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          report(`onConfirm(${on}), saved`)
        }}
        onCancel={() => report("onCancel, disarmed")}
      />
    </div>
  )
}

function ClickAgainDemo() {
  const report = useReport()

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ConfirmButton
          gesture="click-again"
          variant="outline"
          onConfirm={() => report("onConfirm")}
          onCancel={() => report("onCancel, disarmed")}
        >
          Archive
        </ConfirmButton>
        <ConfirmButton
          gesture="click-again"
          variant="ghost"
          size="icon"
          aria-label="Archive"
          confirmLabel={<CheckIcon />}
          onConfirm={() => report("onConfirm, icon button")}
          onCancel={() => report("onCancel, disarmed")}
        >
          <ArchiveIcon />
        </ConfirmButton>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="More actions" />
            }
          >
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto">
            <DropdownMenuItem onClick={() => report("Rename")}>
              <PencilIcon />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmMenuItem
              variant="destructive"
              onConfirm={() => report("onConfirm, menu item")}
              onCancel={() => report("onCancel, disarmed")}
            >
              <Trash2Icon />
              Delete
            </ConfirmMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TwoFactorSetting />
    </div>
  )
}

function HoldDemo() {
  const report = useReport()

  return (
    <ConfirmButton
      gesture="hold"
      variant="destructive"
      onConfirm={() => report("onConfirm")}
      onCancel={() => report("onCancel, released early")}
    >
      Hold to revoke
    </ConfirmButton>
  )
}

function DialogsDemo() {
  const report = useReport()
  const { confirm, dialog } = useConfirm()

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ConfirmDialog
        title="Leave the Design team?"
        description="An admin can add you back later."
        confirmLabel="Leave team"
        variant="destructive"
        onConfirm={() => report("onConfirm")}
        onCancel={() => report("onCancel")}
      >
        <Button variant="outline">Leave team</Button>
      </ConfirmDialog>
      <ConfirmPopover
        description="Open pull requests from this branch will close."
        confirmLabel="Delete branch"
        variant="destructive"
        onConfirm={() => report("onConfirm, popover")}
        onCancel={() => report("onCancel, popover")}
      >
        <Button variant="outline">Delete branch</Button>
      </ConfirmPopover>
      <Button
        variant="outline"
        onClick={async () => {
          const ok = await confirm({
            title: "Discard this draft?",
            confirmLabel: "Discard",
            variant: "destructive",
          })
          report(`useConfirm() resolved ${ok}`)
        }}
      >
        Discard draft
      </Button>
      {dialog}
    </div>
  )
}

function TypeToConfirmDemo() {
  const report = useReport()

  return (
    <TypeToConfirm
      phrase="acme-prod"
      consequences={
        <Consequences
          title="This deletes"
          items={[
            { label: "deployments", count: 128 },
            {
              label: "domains",
              count: 4,
              names: [
                "acme.com",
                "www.acme.com",
                "api.acme.com",
                "status.acme.com",
              ],
            },
            { label: "environment variables", count: 23 },
          ]}
        />
      }
      acknowledgements={["I understand active deployments will go offline."]}
      confirmLabel="Delete project"
      onConfirm={() => report("onConfirm")}
      className="w-full max-w-sm"
    />
  )
}

const demos: Record<string, () => React.ReactNode> = {
  undo: UndoDemo,
  "click-again": ClickAgainDemo,
  hold: HoldDemo,
  dialogs: DialogsDemo,
  "type-to-confirm": TypeToConfirmDemo,
}

export const demoSlugs = Object.keys(demos)

export function Demo({ slug }: { slug: string }) {
  const Component = demos[slug]
  return Component ? <Component /> : null
}
