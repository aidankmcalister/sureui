"use client"

import * as React from "react"
import { ArchiveIcon, ArrowLeftIcon, CheckIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { Undoable } from "@/components/ui/sureui/undoable"

type Message = {
  id: string
  from: string
  subject: string
  body: string
  time: string
  unread?: boolean
}

type InboxProps = {
  initialMessages?: Message[]
  className?: string
}

const sampleMessages: Message[] = [
  {
    id: "msg_1",
    from: "Priya Shah",
    subject: "Launch checklist",
    body: "Final checklist for Thursday. Anything missing before we ship?",
    time: "9:41",
    unread: true,
  },
  {
    id: "msg_2",
    from: "Marcus Chen",
    subject: "Re: Q3 numbers",
    body: "Can you check the churn figures before Monday?",
    time: "8:15",
    unread: true,
  },
  {
    id: "msg_3",
    from: "Lena Fischer",
    subject: "Design review moved to Friday",
    body: "It clashes with the all-hands, so it's now Friday at 2pm.",
    time: "Yesterday",
  },
  {
    id: "msg_4",
    from: "Omar Farouk",
    subject: "Offsite venue options",
    body: "Three venues are free the week of the 20th. Vote by Wednesday.",
    time: "Mon",
  },
]

function request() {
  return Promise.resolve()
}

function Inbox({ initialMessages = sampleMessages, className }: InboxProps) {
  const [messages, setMessages] = React.useState(initialMessages)
  const [openId, setOpenId] = React.useState(initialMessages[0]?.id ?? null)
  const [reading, setReading] = React.useState(false)
  const [leaving, setLeaving] = React.useState<Record<string, string>>({})
  const rows = React.useRef(new Map<string, HTMLButtonElement>())
  const readerRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  const open = messages.find((message) => message.id === openId)

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
      const inReader = reader?.contains(document.activeElement)
      if (inReader && reader?.checkVisibility?.() !== false) return
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

  function leave(id: string, action = "") {
    setLeaving((prev) => ({ ...prev, [id]: action }))
    if (action && openId === id) setOpenId(neighbour(id))
  }

  function drop(id: string) {
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
    <Card className={cn("@container/inbox w-full py-0 text-sm", className)}>
      <div className="grid min-h-80 @2xl/inbox:grid-cols-[2fr_3fr]">
        <section
          aria-label="Inbox"
          className={cn(
            "min-w-0 @2xl/inbox:border-r",
            reading && "hidden @2xl/inbox:block"
          )}
        >
          <div className="flex h-12 items-center border-b px-4">
            <CardTitle>Inbox</CardTitle>
          </div>
          {messages.length === 0 && (
            <p className="p-4 text-muted-foreground">No messages</p>
          )}
          <ul className="divide-y">
            {messages.map((message) => (
              <Undoable
                key={message.id}
                render={
                  <li
                    data-open={message.id === openId || undefined}
                    className="group/row relative has-data-[slot=undoable-strip]:flex has-data-[slot=undoable-strip]:items-center has-data-[slot=undoable-strip]:gap-2 has-data-[slot=undoable-strip]:px-4 has-data-[slot=undoable-strip]:py-2 @2xl/inbox:data-open:bg-muted/60"
                  />
                }
                label={`${leaving[message.id]}: ${message.subject}`}
                onConfirm={() => drop(message.id)}
                onCancel={() => leave(message.id)}
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
                      className="grid w-full gap-1 px-4 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                      onClick={() => read(message.id)}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span
                          className={cn(
                            "truncate",
                            message.unread && "font-semibold"
                          )}
                        >
                          {message.unread && (
                            <span className="sr-only">Unread, </span>
                          )}
                          {message.from}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {message.time}
                        </span>
                      </span>
                      <span className="truncate pr-16 text-muted-foreground">
                        {message.subject}
                      </span>
                    </button>
                    <div className="absolute right-2.5 bottom-2 flex gap-1 opacity-0 group-hover/row:opacity-100 group-has-[:focus-visible]/row:opacity-100 pointer-coarse:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Archive ${message.subject}`}
                        title="Archive"
                        onClick={() => {
                          leave(message.id, "Archived")
                          remove()
                        }}
                      >
                        <ArchiveIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${message.subject}`}
                        title="Delete"
                        onClick={() => {
                          leave(message.id, "Deleted")
                          remove()
                        }}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </>
                )}
              </Undoable>
            ))}
          </ul>
        </section>
        <div
          ref={readerRef}
          role="region"
          aria-label="Message"
          className={cn("min-w-0", !reading && "hidden @2xl/inbox:block")}
        >
          <div className="flex h-12 items-center gap-1 border-b px-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to inbox"
              className="@2xl/inbox:hidden"
              onClick={() => {
                setReading(false)
                focusRow(openId)
              }}
            >
              <ArrowLeftIcon />
            </Button>
            {open && (
              <>
                <span className="hidden px-2 text-xs text-muted-foreground @2xl/inbox:inline">
                  {messages.indexOf(open) + 1} of {messages.length}
                </span>
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
                    confirmLabel={<CheckIcon />}
                    onConfirm={() => finish(open.id)}
                  >
                    <Trash2Icon />
                  </ConfirmButton>
                </div>
              </>
            )}
          </div>
          {open ? (
            <article className="grid gap-4 p-4 sm:p-6">
              <div className="grid gap-1">
                <h3
                  ref={titleRef}
                  tabIndex={-1}
                  className="font-heading text-lg font-medium outline-none"
                >
                  {open.subject}
                </h3>
                <p className="text-muted-foreground">
                  {open.from} · {open.time}
                </p>
              </div>
              <p className="leading-relaxed text-pretty">{open.body}</p>
            </article>
          ) : (
            <p className="p-4 text-muted-foreground">No message open</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export { Inbox, type InboxProps, type Message }
