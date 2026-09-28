"use client"

import * as React from "react"
import {
  CheckIcon,
  DownloadIcon,
  FolderIcon,
  KeyRoundIcon,
  ReceiptTextIcon,
  UserXIcon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Consequences } from "@/components/ui/sureui/consequences"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

type DeleteAccountProps = {
  email?: string
  className?: string
}

const deletes = [
  {
    icon: <FolderIcon />,
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
    description: "Their deployments, domains and environment variables.",
  },
  {
    icon: <ReceiptTextIcon />,
    label: "invoices",
    count: 38,
    description: "Your billing history and saved payment methods.",
  },
  {
    icon: <UsersIcon />,
    label: "Membership in 3 teams",
    names: ["Design", "Platform", "Growth"],
    description: "You leave each team. The teams and their projects stay.",
  },
  {
    icon: <KeyRoundIcon />,
    label: "API keys",
    count: 4,
    names: ["Production", "Staging", "CI", "Local"],
    description: "Requests that use them start failing right away.",
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
      <Card className={cn("w-full", className)}>
        <Empty role="status" className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserXIcon />
            </EmptyMedia>
            <EmptyTitle>Your account was deleted</EmptyTitle>
            <EmptyDescription>
              We sent a confirmation to {email}.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Deletes the account for {email} and everything in it. This can&apos;t
          be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
              {exportState === "sent" ? (
                <CheckIcon className="size-4" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
            </div>
            <div className="grid gap-0.5">
              <p className="font-medium">Export your data first</p>
              <p
                aria-live="polite"
                className="text-pretty text-muted-foreground"
              >
                {exportState === "sent"
                  ? `Export started. We'll email a download link to ${email} when it's ready.`
                  : "Download your projects, invoices and settings as a ZIP before they're gone."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 self-start sm:self-center"
            disabled={exportState !== "idle"}
            onClick={exportData}
          >
            <DownloadIcon data-icon="inline-start" />
            {exportState === "idle"
              ? "Export data"
              : exportState === "pending"
                ? "Starting export…"
                : "Export requested"}
          </Button>
        </div>
        <div className="border-t pt-6">
          <TypeToConfirm
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
            label={
              <>
                Type your email, <span className="font-mono">{email}</span>, to
                confirm
              </>
            }
            acknowledgements={[
              "My projects, invoices and data can't be recovered.",
              "My subscription ends today and I won't be billed again.",
            ]}
            confirmLabel="Delete account"
            onConfirm={async () => {
              await request()
              setDeleted(true)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export { DeleteAccount, type DeleteAccountProps }
