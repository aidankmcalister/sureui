"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Consequences } from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type DeleteAccountProps = {
  email?: string
  className?: string
}

const deletes = [
  {
    label: "Projects",
    names: [
      "acme-web",
      "acme-api",
      "acme-docs",
      "marketing-site",
      "status-page",
      "billing-service",
    ],
  },
  { label: "Invoices", count: 38 },
  { label: "Team memberships", names: ["Design", "Platform", "Growth"] },
  { label: "API keys", count: 4 },
]

function request() {
  return Promise.resolve()
}

function DeleteAccount({
  email = "ada@example.com",
  className,
}: DeleteAccountProps) {
  const [exportState, setExportState] = React.useState<
    "idle" | "pending" | "sent"
  >("idle")
  const [deleted, setDeleted] = React.useState(false)

  async function exportData() {
    setExportState("pending")
    await request()
    setExportState("sent")
  }

  if (deleted) {
    return (
      <Card role="status" className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Your account was deleted</CardTitle>
          <CardDescription>We sent a confirmation to {email}.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={cn("@container/account w-full", className)}>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col items-start gap-3 @sm/account:flex-row @sm/account:items-center @sm/account:justify-between @sm/account:gap-4">
          <p aria-live="polite">
            {exportState === "sent"
              ? `We'll email a download link to ${email}.`
              : "Export your data first."}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={exportState !== "idle"}
            onClick={exportData}
          >
            {exportState === "idle"
              ? "Export data"
              : exportState === "pending"
                ? "Exporting…"
                : "Export requested"}
          </Button>
        </div>
        <TypeToConfirm
          className="border-t pt-4"
          phrase={email}
          consequences={
            <Consequences
              title="What gets deleted"
              variant="destructive"
              items={deletes}
            />
          }
          caseSensitive={false}
          trim
          acknowledgements={[
            "I can't get any of this back.",
            "My subscription ends today.",
          ]}
          variant="destructive"
          confirmLabel="Delete account"
          onConfirm={async () => {
            await request()
            setDeleted(true)
          }}
        />
      </CardContent>
    </Card>
  )
}

export { DeleteAccount, type DeleteAccountProps }
