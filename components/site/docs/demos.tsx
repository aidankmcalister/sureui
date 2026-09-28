"use client"

import * as React from "react"
import {
  ArchiveIcon,
  CheckIcon,
  EllipsisIcon,
  FileArchiveIcon,
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
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { Undoable } from "@/components/ui/sureui/undoable"
import { useReport } from "@/components/site/docs/preview"

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
)

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <p
      aria-live="polite"
      className="min-h-10 max-w-sm text-center font-mono text-xs leading-5 text-pretty text-(--ink-label) [&_code]:text-(--ink)"
    >
      {children}
    </p>
  )
}

type UndoPhase = "idle" | "window" | "deleted" | "kept"

const undoReadout: Record<UndoPhase, React.ReactNode> = {
  idle: "Deletes right away, with 5 seconds to undo.",
  window: (
    <>
      <code>onConfirm</code> waits until the undo window closes.
    </>
  ),
  deleted: (
    <>
      <code>onConfirm()</code> ran. brand-assets.zip is in the trash.
    </>
  ),
  kept: (
    <>
      <code>onCancel()</code> ran. Nothing was deleted.
    </>
  ),
}

function UndoDemo() {
  const [phase, setPhase] = React.useState<UndoPhase>("idle")
  const gone = phase === "window" || phase === "deleted"

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        data-gone={gone}
        className="group flex w-full max-w-sm items-center gap-3 rounded-xl border bg-background p-3 shadow-xs"
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-opacity duration-200 group-data-[gone=true]:opacity-40">
          <FileArchiveIcon className="size-5" />
        </div>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <p className="truncate text-sm font-medium transition-colors duration-200 group-data-[gone=true]:text-muted-foreground group-data-[gone=true]:line-through">
            brand-assets.zip
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {gone ? "Moved to trash" : "14.2 MB · 2 days ago"}
          </p>
        </div>
        {phase === "deleted" ? (
          <Button variant="outline" size="sm" onClick={() => setPhase("idle")}>
            Reset
          </Button>
        ) : (
          <ConfirmButton
            undo
            variant="outline"
            size="sm"
            onClick={() => {
              if (phase !== "window") setPhase("window")
            }}
            onConfirm={() => setPhase("deleted")}
            onCancel={() => setPhase("kept")}
          >
            Delete
          </ConfirmButton>
        )}
      </div>
      <Readout>{undoReadout[phase]}</Readout>
    </div>
  )
}

function UndoToastFigure() {
  const [result, setResult] = React.useState<boolean | null>(null)
  const [waiting, setWaiting] = React.useState(false)

  return (
    <>
      <div className="flex w-full flex-col items-center gap-5">
        <Button
          variant="outline"
          disabled={waiting}
          onClick={async () => {
            setWaiting(true)
            setResult(await undoToast("Archived 3 messages"))
            setWaiting(false)
          }}
        >
          <ArchiveIcon />
          Archive 3 messages
        </Button>
        <Readout>
          {waiting ? (
            "Waiting on the toast."
          ) : result === null ? (
            <>
              Resolves <code>true</code> when the toast closes,{" "}
              <code>false</code> on Undo.
            </>
          ) : result ? (
            <>
              <code>undoToast() → true</code>. The messages are archived.
            </>
          ) : (
            <>
              <code>undoToast() → false</code>. Undone, nothing archived.
            </>
          )}
        </Readout>
      </div>
      <Toaster />
    </>
  )
}

const files = ["q3-report.pdf", "brand-assets.zip", "meeting-notes.md"]

function UndoableFigure() {
  const [names, setNames] = React.useState(files)
  const [last, setLast] = React.useState<{
    event: "confirm" | "cancel"
    name: string
  } | null>(null)

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <ul className="w-full max-w-sm divide-y rounded-lg border bg-background text-sm">
        {names.map((name) => (
          <Undoable
            key={name}
            render={
              <li className="flex items-center gap-2 py-1.5 pr-1.5 pl-3" />
            }
            label={`Deleted ${name}`}
            onConfirm={() => {
              setNames((prev) => prev.filter((item) => item !== name))
              setLast({ event: "confirm", name })
            }}
            onCancel={() => setLast({ event: "cancel", name })}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNames(files)
                setLast(null)
              }}
            >
              Reset
            </Button>
          </li>
        )}
      </ul>
      <Readout>
        {last === null ? (
          "Delete a row. It collapses in place to Undo."
        ) : last.event === "confirm" ? (
          <>
            <code>onConfirm()</code> ran. {last.name} is removed.
          </>
        ) : (
          <>
            <code>onCancel()</code> ran. {last.name} is back.
          </>
        )}
      </Readout>
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
          report(`onConfirm(${on})`, on ? "turned on" : "turned off, saved")
        }}
        onCancel={() => report("onCancel()", "timed out or focus left")}
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
          onConfirm={() => report("onConfirm()", "archived")}
          onCancel={() => report("onCancel()", "timed out or focus left")}
        >
          Archive
        </ConfirmButton>
        <ConfirmButton
          gesture="click-again"
          variant="ghost"
          size="icon"
          aria-label="Archive"
          confirmLabel={<CheckIcon />}
          onConfirm={() => report("onConfirm()", "archived")}
          onCancel={() => report("onCancel()", "timed out or focus left")}
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
            <DropdownMenuItem
              onClick={() => report("onClick()", "Rename, no confirmation")}
            >
              <PencilIcon />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmMenuItem
              variant="destructive"
              onConfirm={() => report("onConfirm()", "deleted from the menu")}
              onCancel={() => report("onCancel()", "timed out or focus left")}
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
      onConfirm={() => report("onConfirm()", "key revoked")}
      onCancel={() => report("onCancel()", "let go early, not revoked")}
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
        onConfirm={() => report("onConfirm()", "left the team")}
        onCancel={() => report("onCancel()", "dialog closed")}
      >
        <Button variant="outline">Leave team</Button>
      </ConfirmDialog>
      <ConfirmPopover
        description="Open pull requests from this branch will close."
        confirmLabel="Delete branch"
        variant="destructive"
        onConfirm={() => report("onConfirm()", "branch deleted")}
        onCancel={() => report("onCancel()", "popover closed")}
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
          report(
            `await confirm() → ${ok}`,
            ok ? "draft discarded" : "draft kept"
          )
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
      onConfirm={() => report("onConfirm()", "project deleted")}
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

const apiDemos: Record<string, () => React.ReactNode> = {
  "undo:undoToast(message, options)": UndoToastFigure,
  "undo:Undoable": UndoableFigure,
}

export function ApiDemo({ slug, api }: { slug: string; api: string }) {
  const Component = apiDemos[`${slug}:${api}`]
  return Component ? <Component /> : null
}

export function Demo({ slug }: { slug: string }) {
  const Component = demos[slug]
  return Component ? <Component /> : null
}
