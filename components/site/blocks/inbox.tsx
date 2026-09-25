"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

const messages = [
  { from: "Maya Chen", subject: "Q3 planning" },
  { from: "Leo Park", subject: "Design review notes" },
  { from: "Ava Diaz", subject: "Invoice #1042" },
]

export function Inbox() {
  const [archived, setArchived] = React.useState<string[]>([])
  const inbox = messages.filter(
    (message) => !archived.includes(message.subject)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
        <CardDescription>{inbox.length} unread</CardDescription>
        {archived.length > 0 && (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => setArchived([])}>
              Reset
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {inbox.map((message) => (
          <div
            key={message.subject}
            className="flex items-center justify-between gap-4"
          >
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate font-medium">{message.subject}</span>
              <span className="text-xs text-muted-foreground">
                {message.from}
              </span>
            </div>
            <ConfirmButton
              gesture="click-again"
              variant="outline"
              size="sm"
              confirmLabel="Archive?"
              onConfirm={() =>
                setArchived((prev) => [...prev, message.subject])
              }
            >
              Archive
            </ConfirmButton>
          </div>
        ))}
        {inbox.length === 0 && (
          <p className="text-muted-foreground">All caught up.</p>
        )}
      </CardContent>
    </Card>
  )
}
