"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

import { CreateKeyDialog } from "./create-key-dialog"

type ApiKey = {
  id: string
  name: string
  prefix: string
  last4: string
  lastUsed: string
  revoked?: boolean
}

type ApiKeysProps = {
  initialKeys?: ApiKey[]
  className?: string
}

const sampleKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Production",
    prefix: "sk_live_",
    last4: "4f2a",
    lastUsed: "2 minutes ago",
  },
  {
    id: "key_2",
    name: "Billing worker",
    prefix: "sk_live_",
    last4: "9c1e",
    lastUsed: "1 hour ago",
  },
  {
    id: "key_3",
    name: "Staging",
    prefix: "sk_test_",
    last4: "71b3",
    lastUsed: "3 days ago",
  },
  {
    id: "key_4",
    name: "Old CI runner",
    prefix: "sk_test_",
    last4: "0d88",
    lastUsed: "4 months ago",
  },
]

const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

function randomSecret(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function ApiKeys({ initialKeys = sampleKeys, className }: ApiKeysProps) {
  const [keys, setKeys] = React.useState(initialKeys)

  async function createKey(name: string) {
    await request()
    const prefix = "sk_live_"
    const secret = `${prefix}${randomSecret(32)}`
    setKeys((prev) => [
      {
        id: `key_${Date.now()}`,
        name,
        prefix,
        last4: secret.slice(-4),
        lastUsed: "Never",
      },
      ...prev,
    ])
    return { name, secret }
  }

  async function revokeKey(id: string) {
    await request()
    setKeys((prev) =>
      prev.map((key) => (key.id === id ? { ...key, revoked: true } : key))
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          A revoked key stops working right away.
        </CardDescription>
        <CardAction>
          <CreateKeyDialog onCreate={createKey} />
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead className="hidden sm:table-cell">Last used</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow
                key={key.id}
                data-state={key.revoked ? "revoked" : "active"}
                className={cn(
                  "hover:bg-transparent",
                  key.revoked && "text-muted-foreground"
                )}
              >
                <TableCell className="py-3 pl-4">
                  <div className="grid gap-0.5">
                    <span className="font-medium">{key.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {key.prefix}••••{key.last4}
                    </span>
                    <span className="text-xs text-muted-foreground sm:hidden">
                      Last used {key.lastUsed.toLowerCase()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {key.lastUsed}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  {key.revoked ? (
                    "Revoked"
                  ) : (
                    <ConfirmButton
                      gesture="hold"
                      variant="destructive"
                      size="sm"
                      aria-label={`Hold to revoke ${key.name}`}
                      onConfirm={() => revokeKey(key.id)}
                    >
                      Hold to revoke
                    </ConfirmButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { ApiKeys, type ApiKey, type ApiKeysProps }
