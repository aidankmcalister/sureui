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
    label: "projects",
    count: 12,
    names: [
      "acme-web",
      "acme-api",
      "acme-docs",
      "marketing-site",
      "status-page",
      "billing-service",
      "auth-proxy",
      "image-cdn",
      "blog",
      "changelog",
      "design-system",
      "playground",
    ],
    description: "Their deployments and domains.",
  },
  {
    label: "invoices",
    count: 38,
    description: "Billing history and payment methods.",
  },
  {
    label: "Membership in 3 teams",
    names: ["Design", "Platform", "Growth"],
    description: "The teams and their projects stay.",
  },
  {
    label: "API keys",
    count: 4,
    names: ["Production", "Staging", "CI", "Local"],
    description: "Requests that use them start failing.",
  },
]

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
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
              className="sm:*:data-[slot=consequences-list]:grid-cols-2 sm:*:data-[slot=consequences-list]:gap-x-6"
              items={deletes}
            />
          }
          caseSensitive={false}
          trim
          acknowledgements={[
            "I can't get any of this back.",
            "My subscription ends today.",
          ]}
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
