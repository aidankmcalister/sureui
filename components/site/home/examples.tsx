"use client"

import * as React from "react"
import {
  ArchiveIcon,
  CheckIcon,
  FileIcon,
  KeyRoundIcon,
  LogOutIcon,
  RotateCcwIcon,
  Trash2Icon,
  UserMinusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

function Outcome({
  done,
  icon,
  title,
  description,
  onReset,
  children,
}: {
  done: boolean
  icon: React.ReactNode
  title: string
  description?: string
  onReset: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative grid w-full">
      <div
        inert={done}
        className={cn("grid w-full place-items-center", done && "opacity-0")}
      >
        {children}
      </div>
      {done && (
        <div role="status" className="absolute inset-0 flex">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">{icon}</EmptyMedia>
              <EmptyTitle>{title}</EmptyTitle>
              {description && (
                <EmptyDescription>{description}</EmptyDescription>
              )}
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" autoFocus onClick={onReset}>
                Reset demo
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  )
}

function Details({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-1.5 text-sm">
      {rows.map(([name, value]) => (
        <div key={name} className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function useToggle() {
  const [items, setItems] = React.useState<string[]>([])
  return {
    has: (item: string) => items.includes(item),
    toggle: (item: string) =>
      setItems((prev) =>
        prev.includes(item)
          ? prev.filter((other) => other !== item)
          : [...prev, item]
      ),
    count: items.length,
    reset: () => setItems([]),
  }
}

const dangers = [
  {
    id: "pause",
    title: "Pause deployments",
    description: "New pushes stop deploying until you resume.",
    done: "Deployments paused.",
  },
  {
    id: "transfer",
    title: "Transfer project",
    description: "Move acme-prod to another team.",
    done: "Transferred to Design.",
  },
  {
    id: "delete",
    title: "Delete project",
    description: "Removes every deployment and its data for good.",
    done: "Deleted, with every deployment.",
  },
]

export function DangerZone() {
  const done = useToggle()

  function control(id: string) {
    const finish = () => done.toggle(id)
    if (id === "pause") {
      return (
        <ConfirmButton undo variant="outline" size="sm" onConfirm={finish}>
          Pause
        </ConfirmButton>
      )
    }
    if (id === "transfer") {
      return (
        <ConfirmDialog
          title="Transfer acme-prod?"
          description="Members of Acme lose access. Owners of Design get it."
          confirmLabel="Transfer"
          onConfirm={finish}
        >
          <Button variant="outline" size="sm">
            Transfer
          </Button>
        </ConfirmDialog>
      )
    }
    return (
      <ConfirmDialog
        title="Delete acme-prod?"
        description="This removes the project, its deployments and its data for good."
        phrase="acme-prod"
        acknowledgements={["Active deployments will go offline."]}
        confirmLabel="Delete project"
        variant="destructive"
        onConfirm={finish}
      >
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </ConfirmDialog>
    )
  }

  return (
    <Outcome
      done={done.count === dangers.length}
      icon={<CheckIcon />}
      title="All three actions ran"
      onReset={done.reset}
    >
      <div className="grid w-full divide-y text-sm">
        {dangers.map((danger) => (
          <div
            key={danger.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5">
              <span className="font-medium">{danger.title}</span>
              <span className="text-muted-foreground">
                {done.has(danger.id) ? danger.done : danger.description}
              </span>
            </div>
            {!done.has(danger.id) && control(danger.id)}
          </div>
        ))}
      </div>
    </Outcome>
  )
}

export function ConfirmByName() {
  const [deleted, setDeleted] = React.useState(false)

  return (
    <Outcome
      done={deleted}
      icon={<Trash2Icon />}
      title="acme-prod was deleted"
      onReset={() => setDeleted(false)}
    >
      <TypeToConfirm
        phrase="acme-prod"
        acknowledgements={["I understand active deployments will go offline."]}
        confirmLabel="Delete project"
        onConfirm={() => setDeleted(true)}
        className="w-full"
      />
    </Outcome>
  )
}

const keys = [
  { name: "Production", value: "sk_live_••••4f2a" },
  { name: "Staging", value: "sk_test_••••9c1e" },
  { name: "Preview", value: "sk_test_••••71b3" },
]

export function ApiKeys() {
  const revoked = useToggle()

  return (
    <Outcome
      done={revoked.count === keys.length}
      icon={<KeyRoundIcon />}
      title="Every key is revoked"
      onReset={revoked.reset}
    >
      <div className="grid w-full divide-y">
        {keys.map((key) => (
          <div
            key={key.name}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {key.name}
                {revoked.has(key.name) && (
                  <Badge variant="outline">Revoked</Badge>
                )}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {key.value}
              </span>
            </div>
            {!revoked.has(key.name) && (
              <ConfirmButton
                gesture="hold"
                variant="destructive"
                size="sm"
                onConfirm={() => revoked.toggle(key.name)}
              >
                Hold to revoke
              </ConfirmButton>
            )}
          </div>
        ))}
      </div>
    </Outcome>
  )
}

export function Workspace() {
  const [left, setLeft] = React.useState(false)

  return (
    <Outcome
      done={left}
      icon={<LogOutIcon />}
      title="You left Acme"
      onReset={() => setLeft(false)}
    >
      <div className="grid w-full gap-3 text-sm">
        <Details
          rows={[
            ["Workspace", "Acme"],
            ["Plan", "Team"],
            ["Members", "12"],
          ]}
        />
        <ConfirmDialog
          title="Leave Acme?"
          description="You'll lose access to its projects until someone invites you back."
          confirmLabel="Leave"
          variant="destructive"
          onConfirm={() => setLeft(true)}
        >
          <Button variant="outline">Leave workspace</Button>
        </ConfirmDialog>
      </div>
    </Outcome>
  )
}

const preferences = { Theme: "Dark", Alerts: "Mentions", Keys: "Custom" }

export function Preferences() {
  const [reset, setReset] = React.useState(false)

  return (
    <Outcome
      done={reset}
      icon={<RotateCcwIcon />}
      title="Preferences reset"
      onReset={() => setReset(false)}
    >
      <div className="grid w-full gap-3 text-sm">
        <Details rows={Object.entries(preferences)} />
        <ConfirmButton
          gesture="hold"
          duration={2000}
          variant="outline"
          onConfirm={() => setReset(true)}
        >
          Hold to reset
        </ConfirmButton>
      </div>
    </Outcome>
  )
}

const files = [
  { name: "q3-report.pdf", size: "2.4 MB", modified: "2h ago" },
  { name: "brand-assets.zip", size: "18.1 MB", modified: "Yesterday" },
  { name: "meeting-notes.md", size: "4 KB", modified: "Monday" },
]

export function Files() {
  const [selected, setSelected] = React.useState(files.map((file) => file.name))
  const [trashed, setTrashed] = React.useState<string[]>([])

  return (
    <Outcome
      done={trashed.length === files.length}
      icon={<Trash2Icon />}
      title="Moved to trash"
      onReset={() => {
        setTrashed([])
        setSelected(files.map((file) => file.name))
      }}
    >
      <div className="group grid w-full gap-3">
        <div className="divide-y text-sm">
          {files.map((file) => (
            <label
              key={file.name}
              className={cn(
                "flex items-center gap-3 py-2 first:pt-0",
                trashed.includes(file.name) &&
                  "text-muted-foreground line-through",
                selected.includes(file.name) &&
                  "group-has-data-[state=undo]:text-muted-foreground group-has-data-[state=undo]:line-through"
              )}
            >
              <Checkbox
                checked={selected.includes(file.name)}
                disabled={trashed.includes(file.name)}
                onCheckedChange={(on) =>
                  setSelected((prev) =>
                    on
                      ? [...prev, file.name]
                      : prev.filter((name) => name !== file.name)
                  )
                }
              />
              <FileIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {file.size}
              </span>
              <span className="w-20 text-right text-muted-foreground">
                {file.modified}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <ConfirmButton
            undo
            variant="outline"
            disabled={selected.length === 0}
            onConfirm={() => {
              setTrashed((prev) => [...prev, ...selected])
              setSelected([])
            }}
          >
            <Trash2Icon />
            Move {selected.length} to trash
          </ConfirmButton>
        </div>
      </div>
    </Outcome>
  )
}

const people = [
  { name: "Leo Park", initials: "LP", role: "Editor" },
  { name: "Ava Diaz", initials: "AD", role: "Viewer" },
  { name: "Sam Lee", initials: "SL", role: "Editor" },
]

export function Members() {
  const removed = useToggle()

  return (
    <Outcome
      done={removed.count === people.length}
      icon={<UserMinusIcon />}
      title="Everyone was removed"
      onReset={removed.reset}
    >
      <div className="grid w-full gap-1">
        {people.map((person) => (
          <div
            key={person.name}
            className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0"
          >
            <Avatar size="sm">
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "grid flex-1 text-sm",
                removed.has(person.name) && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  removed.has(person.name) && "line-through"
                )}
              >
                {person.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {removed.has(person.name) ? "Removed" : person.role}
              </span>
            </div>
            {!removed.has(person.name) && (
              <ConfirmButton
                gesture="click-again"
                variant="outline"
                size="sm"
                confirmLabel="Are you sure?"
                onConfirm={() => removed.toggle(person.name)}
              >
                Remove
              </ConfirmButton>
            )}
          </div>
        ))}
      </div>
    </Outcome>
  )
}

export function MessageToolbar() {
  const [status, setStatus] = React.useState<"open" | "archived" | "deleted">(
    "open"
  )

  return (
    <Outcome
      done={status !== "open"}
      icon={status === "deleted" ? <Trash2Icon /> : <ArchiveIcon />}
      title={`Message ${status}`}
      onReset={() => setStatus("open")}
    >
      <div className="grid w-full gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>PS</AvatarFallback>
          </Avatar>
          <div className="grid flex-1">
            <span className="font-medium">Priya Shah</span>
            <span className="text-xs text-muted-foreground">Today, 9:41</span>
          </div>
          <div className="flex gap-1">
            <ConfirmButton
              gesture="click-again"
              variant="ghost"
              size="icon-sm"
              aria-label="Archive"
              confirmLabel={<CheckIcon />}
              onConfirm={() => setStatus("archived")}
            >
              <ArchiveIcon />
            </ConfirmButton>
            <ConfirmButton
              gesture="hold"
              variant="ghost"
              size="icon-sm"
              aria-label="Hold to delete"
              title="Hold to delete"
              onConfirm={() => setStatus("deleted")}
            >
              <Trash2Icon />
            </ConfirmButton>
          </div>
        </div>
        <div className="grid gap-1">
          <span className="font-medium">Launch checklist</span>
          <p className="text-muted-foreground">
            Final checklist for Thursday. Anything missing before we ship?
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">checklist.pdf</Badge>
          <Badge variant="outline">timeline.png</Badge>
        </div>
      </div>
    </Outcome>
  )
}
