"use client"

import * as React from "react"
import { CreditCardIcon, ShieldIcon, UserMinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"

type Member = { id: string; name: string; email: string }

type TransferOwnershipProps = {
  project?: string
  className?: string
}

const you: Member = { id: "mem_1", name: "John Doe", email: "john@acme.com" }

const members: Member[] = [
  you,
  { id: "mem_2", name: "Leo Park", email: "leo@acme.com" },
  { id: "mem_3", name: "Ava Diaz", email: "ava@acme.com" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function request() {
  return new Promise((resolve) => setTimeout(resolve, 600))
}

function TransferOwnership({
  project = "acme-prod",
  className,
}: TransferOwnershipProps) {
  const [ownerId, setOwnerId] = React.useState(you.id)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Transfer ownership</CardTitle>
        <CardDescription>
          The owner controls billing and can delete {project}. There is one
          owner at a time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {members.map((member) => {
            const owner = member.id === ownerId
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar>
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {member.name}
                    {member.id === you.id && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                {owner ? (
                  <Badge variant="secondary">Owner</Badge>
                ) : ownerId === you.id ? (
                  <ConfirmDialog
                    title={`Transfer ${project} to ${member.name}?`}
                    description="You can't take it back. Only the new owner can transfer it again."
                    consequences={
                      <Consequences
                        title="What changes"
                        items={[
                          {
                            label: "You become an admin",
                            icon: <ShieldIcon />,
                          },
                          {
                            label: `${member.name} can remove you`,
                            icon: <UserMinusIcon />,
                          },
                          {
                            label: `Billing moves to ${member.name}`,
                            description: `Invoices go to ${member.email} from the next billing period.`,
                            icon: <CreditCardIcon />,
                          },
                        ]}
                      />
                    }
                    phrase={project}
                    confirmLabel="Transfer ownership"
                    variant="destructive"
                    onConfirm={async () => {
                      await request()
                      setOwnerId(member.id)
                    }}
                  >
                    <Button variant="outline" size="sm">
                      Make owner
                    </Button>
                  </ConfirmDialog>
                ) : member.id === you.id ? (
                  <Badge variant="outline">Admin</Badge>
                ) : null}
              </li>
            )
          })}
        </ul>
        {ownerId !== you.id && (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {`${members.find((member) => member.id === ownerId)?.name} owns ${project} now. You're an admin.`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { TransferOwnership, type TransferOwnershipProps }
