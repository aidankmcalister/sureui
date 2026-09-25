"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"

const keys = [
  { name: "Production", value: "sk_live_••••4f2a" },
  { name: "Staging", value: "sk_test_••••9c1e" },
]

export function ApiKeys() {
  const [revoked, setRevoked] = React.useState<string[]>([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          Revoked keys stop working immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {keys.map((key) => (
          <div
            key={key.name}
            className="flex items-center justify-between gap-4"
          >
            <div className="grid gap-0.5">
              <span className="flex items-center gap-2 font-medium">
                {key.name}
                {revoked.includes(key.name) && (
                  <Badge variant="outline">Revoked</Badge>
                )}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {key.value}
              </span>
            </div>
            {revoked.includes(key.name) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setRevoked((prev) => prev.filter((name) => name !== key.name))
                }
              >
                Restore
              </Button>
            ) : (
              <ConfirmButton
                gesture="hold"
                variant="destructive"
                size="sm"
                onConfirm={() => setRevoked((prev) => [...prev, key.name])}
              >
                Hold to revoke
              </ConfirmButton>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
