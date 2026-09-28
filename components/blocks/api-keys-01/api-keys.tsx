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
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

import { CreateKeyDialog } from "./create-key-dialog"

type ApiKey = {
  id: string
  name: string
  prefix: string
  last4: string
  lastUsed?: string
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
    lastUsed: "2 min ago",
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
  return Promise.resolve()
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
      <CardContent>
        <ul aria-label="API keys" className="divide-y">
          {keys.map((key) => (
            <li
              key={key.id}
              data-state={key.revoked ? "revoked" : "active"}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="grid min-w-0 flex-1 gap-0.5">
                <span
                  className={cn(
                    "truncate font-medium",
                    key.revoked && "text-muted-foreground"
                  )}
                >
                  {key.name}
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {key.prefix}••••{key.last4}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {key.revoked
                    ? "Revoked"
                    : key.lastUsed
                      ? `Used ${key.lastUsed}`
                      : "Never used"}
                </span>
              </div>
              {!key.revoked && (
                <ConfirmButton
                  gesture="hold"
                  variant="destructive"
                  size="sm"
                  aria-label={`Hold to revoke ${key.name}`}
                  className="shrink-0"
                  onConfirm={() => revokeKey(key.id)}
                >
                  Hold to revoke
                </ConfirmButton>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { ApiKeys, type ApiKey, type ApiKeysProps }
