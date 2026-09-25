"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"

export function DangerZone() {
  const [deleted, setDeleted] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete project</CardTitle>
        <CardDescription>
          Permanently removes acme-prod, its deployments and its data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deleted ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground">acme-prod was deleted.</p>
            <Button variant="ghost" size="sm" onClick={() => setDeleted(false)}>
              Reset
            </Button>
          </div>
        ) : (
          <TypeToConfirm
            phrase="acme-prod"
            acknowledgements={[
              "I understand active deployments will go offline.",
            ]}
            confirmLabel="Delete project"
            onConfirm={() => setDeleted(true)}
          />
        )}
      </CardContent>
    </Card>
  )
}
