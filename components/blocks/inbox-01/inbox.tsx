"use client"

import * as React from "react"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CheckIcon,
  InboxIcon,
  PaperclipIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Undoable } from "@/components/ui/sureui/undoable"

type Message = {
  id: string
  from: string
  email: string
  subject: string
  body: string[]
  time: string
  attachments?: string[]
  unread?: boolean
}

type InboxProps = {
  initialMessages?: Message[]
  className?: string
}

type Leaving = "archive" | "delete"

const sampleMessages: Message[] = [
  {
    id: "msg_1",
    from: "Priya Shah",
    email: "priya@acme.com",
    subject: "Launch checklist",
    body: [
      "Final checklist for Thursday. Anything missing before we ship?",
      "I moved the rollback plan to the top so it's the first thing on-call sees.",
    ],
    time: "9:41",
    attachments: ["checklist.pdf", "timeline.png"],
    unread: true,
  },
  {
    id: "msg_2",
    from: "Marcus Chen",
    email: "marcus@acme.com",
    subject: "Re: Q3 numbers",
    body: [
      "Revenue is up 12% on last quarter. The breakdown by region is in the sheet.",
      "Can you check the churn figures before Monday?",
    ],
    time: "8:15",
    attachments: ["q3-numbers.xlsx"],
    unread: true,
  },
  {
    id: "msg_3",
    from: "Lena Fischer",
    email: "lena@acme.com",
    subject: "Design review moved to Friday",
    body: [
      "The review clashes with the all-hands, so it's now Friday at 2pm.",
      "Same room, same agenda.",
    ],
    time: "Yesterday",
  },
  {
    id: "msg_4",
    from: "Omar Farouk",
    email: "omar@acme.com",
    subject: "Offsite venue options",
    body: [
      "Three venues are free the week of the 20th. I've put prices and photos in the doc.",
      "Vote by Wednesday and I'll book the winner.",
    ],
    time: "Mon",
  },
  {
    id: "msg_5",
    from: "Billing",
    email: "billing@acme.com",
    subject: "Your invoice for September",
    body: [
      "Your invoice for September is ready. The total is $1,240.00 and it will be charged on October 1.",
    ],
    time: "Sep 28",
    attachments: ["invoice-2026-09.pdf"],
  },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function Inbox({ initialMessages = sampleMessages, className }: InboxProps) {
  const [messages, setMessages] = React.useState(initialMessages)
  const [openId, setOpenId] = React.useState(initialMessages[0]?.id ?? null)
  const [reading, setReading] = React.useState(false)
  const [leaving, setLeaving] = React.useState<Record<string, Leaving>>({})
  const rows = React.useRef(new Map<string, HTMLButtonElement>())
  const readerRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  const open = messages.find((message) => message.id === openId) ?? null
  const unread = messages.filter((message) => message.unread).length

  function neighbour(id: string) {
    const staying = messages.filter(
      (message) => message.id === id || !leaving[message.id]
    )
    const index = staying.findIndex((message) => message.id === id)
    return (staying[index + 1] ?? staying[index - 1])?.id ?? null
  }

  function focusRow(id: string | null) {
    requestAnimationFrame(() => {
      const reader = readerRef.current
      if (
        reader?.contains(document.activeElement) &&
        reader.checkVisibility?.() !== false
      ) {
        return
      }
      if (id) rows.current.get(id)?.focus()
    })
  }

  function read(id: string) {
    setOpenId(id)
    setReading(true)
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, unread: false } : message
      )
    )
    requestAnimationFrame(() => {
      if (readerRef.current?.checkVisibility?.() === false) return
      if (rows.current.get(id)?.checkVisibility?.() === false) {
        titleRef.current?.focus()
      }
    })
  }

  function back() {
    setReading(false)
    focusRow(openId)
  }

  function startLeaving(id: string, action: Leaving, remove: () => void) {
    setLeaving((prev) => ({ ...prev, [id]: action }))
    if (openId === id) setOpenId(neighbour(id))
    remove()
  }

  function stopLeaving(id: string) {
    setLeaving((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function drop(id: string) {
    stopLeaving(id)
    setMessages((prev) => prev.filter((message) => message.id !== id))
  }

  async function finish(id: string) {
    await request()
    const next = neighbour(id)
    drop(id)
    setOpenId(next)
    setReading(false)
    focusRow(next)
  }

  return (
    <Card
      className={cn("@container/inbox w-full gap-0 py-0 text-sm", className)}
    >
      <div className="grid min-h-112 @2xl/inbox:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section
          aria-label="Inbox"
          className={cn(
            "flex min-w-0 flex-col @2xl/inbox:border-r",
            reading && "hidden @2xl/inbox:flex"
          )}
        >
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <CardTitle>Inbox</CardTitle>
            {unread > 0 && (
              <Badge variant="secondary" className="tabular-nums">
                {unread} unread
              </Badge>
            )}
          </div>
          {messages.length === 0 ? (
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No messages</EmptyTitle>
                <EmptyDescription>
                  New mail shows up here as it arrives.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y">
              {messages.map((message) => (
                <Undoable
                  key={message.id}
                  render={
                    <li
                      data-open={message.id === openId || undefined}
                      className="flex items-stretch has-data-[slot=undoable-strip]:px-4 has-data-[slot=undoable-strip]:py-2 @2xl/inbox:data-open:bg-muted/60"
                    />
                  }
                  label={`${leaving[message.id] === "delete" ? "Deleted" : "Archived"}: ${message.subject}`}
                  onConfirm={() => drop(message.id)}
                  onCancel={() => stopLeaving(message.id)}
                >
                  {({ remove }) => (
                    <>
                      <button
                        ref={(node) => {
                          if (node) rows.current.set(message.id, node)
                          else rows.current.delete(message.id)
                        }}
                        type="button"
                        aria-current={message.id === openId || undefined}
                        className="grid min-w-0 flex-1 gap-0.5 py-3 pl-4 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                        onClick={() => read(message.id)}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "flex min-w-0 items-center gap-2 truncate",
                              message.unread && "font-semibold"
                            )}
                          >
                            {message.unread && (
                              <span
                                aria-hidden
                                className="size-2 shrink-0 rounded-full bg-primary"
                              />
                            )}
                            {message.unread && (
                              <span className="sr-only">Unread, </span>
                            )}
                            <span className="truncate">{message.from}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {message.time}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            message.unread && "font-medium"
                          )}
                        >
                          {message.subject}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {message.body[0]}
                        </span>
                      </button>
                      <span className="flex shrink-0 flex-col justify-center gap-0.5 px-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Archive ${message.subject}`}
                          title="Archive"
                          onClick={() =>
                            startLeaving(message.id, "archive", remove)
                          }
                        >
                          <ArchiveIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${message.subject}`}
                          title="Delete"
                          onClick={() =>
                            startLeaving(message.id, "delete", remove)
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </span>
                    </>
                  )}
                </Undoable>
              ))}
            </ul>
          )}
        </section>
        <div
          ref={readerRef}
          role="region"
          aria-label="Message"
          className={cn(
            "min-w-0 flex-col",
            reading ? "flex" : "hidden @2xl/inbox:flex"
          )}
        >
          <div className="flex h-12 shrink-0 items-center gap-1 border-b px-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to inbox"
              className="@2xl/inbox:hidden"
              onClick={back}
            >
              <ArrowLeftIcon />
            </Button>
            {open && (
              <div className="ml-auto flex gap-1">
                <ConfirmButton
                  gesture="click-again"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Archive"
                  title="Archive"
                  confirmLabel={<CheckIcon />}
                  announcements={{ armed: "Click again to archive" }}
                  onConfirm={() => finish(open.id)}
                >
                  <ArchiveIcon />
                </ConfirmButton>
                <ConfirmButton
                  gesture="hold"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Hold to delete"
                  title="Hold to delete"
                  onConfirm={() => finish(open.id)}
                >
                  <Trash2Icon />
                </ConfirmButton>
              </div>
            )}
          </div>
          {open ? (
            <article className="grid content-start gap-5 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(open.from)}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{open.from}</span>
                  <span className="truncate text-muted-foreground">
                    {open.email}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {open.time}
                </span>
              </div>
              <h3
                ref={titleRef}
                tabIndex={-1}
                className="font-heading text-lg leading-snug font-medium outline-none"
              >
                {open.subject}
              </h3>
              <div className="grid gap-3 leading-relaxed text-pretty">
                {open.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {open.attachments && (
                <div className="flex flex-wrap gap-1.5">
                  {open.attachments.map((name) => (
                    <Badge key={name} variant="outline">
                      <PaperclipIcon data-icon="inline-start" />
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No message open</EmptyTitle>
                <EmptyDescription>
                  Choose a message from the inbox to read it.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </Card>
  )
}

export { Inbox, type InboxProps, type Message }
