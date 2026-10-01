"use client"

import * as React from "react"
import { EllipsisIcon, KeyRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"
import { Outcome } from "@/components/site/home/examples/outcome"

const initialVariables = [
  { name: "DATABASE_URL", scope: "Production" },
  { name: "SENTRY_DSN", scope: "All environments" },
  { name: "MAPS_API_KEY", scope: "Preview" },
]

export function Variables() {
  const [variables, setVariables] = React.useState(initialVariables)

  return (
    <Outcome
      done={variables.length === 0}
      icon={<KeyRoundIcon />}
      title="No variables left"
    >
      <ul className="grid w-full divide-y text-sm">
        {variables.map((variable) => (
          <li
            key={variable.name}
            className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
          >
            <div className="grid gap-0.5">
              <code className="font-mono text-xs font-medium">
                {variable.name}
              </code>
              <span className="text-xs text-muted-foreground">
                {variable.scope}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${variable.name}`}
                  />
                }
              >
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem>Edit value</DropdownMenuItem>
                <ConfirmMenuItem
                  gesture="click-again"
                  variant="destructive"
                  confirmLabel="Click again"
                  onConfirm={() =>
                    setVariables((prev) =>
                      prev.filter((item) => item.name !== variable.name)
                    )
                  }
                >
                  Delete
                </ConfirmMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </Outcome>
  )
}
