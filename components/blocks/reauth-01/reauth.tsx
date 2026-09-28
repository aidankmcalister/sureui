"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

import { useReauth, type Verify } from "./reauth-dialog"

type ReauthProps = {
  email?: string
  cardLast4?: string
  verify?: Verify
  rememberFor?: number
  className?: string
}

const demoCode = "123456"

function demoVerify(code: string) {
  return Promise.resolve(code === demoCode)
}

function request() {
  return Promise.resolve()
}

function Reauth({
  email: initialEmail = "billing@example.com",
  cardLast4 = "4242",
  verify,
  rememberFor = 2 * 60 * 60 * 1000,
  className,
}: ReauthProps) {
  const [email, setEmail] = React.useState(initialEmail)
  const [draft, setDraft] = React.useState(initialEmail)
  const [saving, setSaving] = React.useState(false)
  const [hasCard, setHasCard] = React.useState(true)
  const emailId = React.useId()
  const { reauthenticate, dialog } = useReauth({
    verify: verify ?? demoVerify,
    rememberFor,
    hint: verify ? undefined : `This demo accepts ${demoCode}.`,
  })

  const next = draft.trim()

  async function saveEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!next || next === email || saving) return
    setSaving(true)
    try {
      if (!(await reauthenticate())) return
      await request()
      setEmail(next)
    } finally {
      setSaving(false)
    }
  }

  async function removeCard() {
    if (!(await reauthenticate())) return
    await request()
    setHasCard(false)
  }

  return (
    <Card className={cn("@container/billing w-full", className)}>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={saveEmail} className="grid gap-2">
          <Label htmlFor={emailId}>Billing email</Label>
          <div className="flex gap-2">
            <Input
              id={emailId}
              type="email"
              value={draft}
              autoComplete="email"
              readOnly={saving}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!next || next === email || saving}
            >
              Save
            </Button>
          </div>
          <p aria-live="polite" className="text-muted-foreground">
            Invoices go to {email}.
          </p>
        </form>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
          <div className="grid min-w-0 flex-1 basis-40 gap-1">
            <p className="font-medium">Payment method</p>
            <p aria-live="polite" className="text-muted-foreground">
              {hasCard ? `Card ending ${cardLast4}` : "No card on file"}
            </p>
          </div>
          {hasCard && (
            <ConfirmButton
              gesture="click-again"
              variant="outline"
              size="sm"
              confirmLabel="Remove card?"
              onConfirm={removeCard}
            >
              Remove
            </ConfirmButton>
          )}
        </div>
      </CardContent>
      {dialog}
    </Card>
  )
}

export { Reauth, type ReauthProps }
