"use client"

import * as React from "react"
import { CrownIcon, EllipsisIcon, UserMinusIcon } from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { ConfirmMenuItem } from "@/components/ui/sureui/confirm-menu-item"

type MemberRole = "Owner" | "Admin" | "Member" | "Viewer"

type Member = {
  id: string
  name: string
  email: string
  role: MemberRole
  you?: boolean
}

type TeamMembersProps = {
  team?: string
  initialMembers?: Member[]
  className?: string
}

const sampleMembers: Member[] = [
  {
    id: "mem_1",
    name: "Ada Lovelace",
    email: "ada@acme.com",
    role: "Owner",
    you: true,
  },
  { id: "mem_2", name: "Leo Park", email: "leo@acme.com", role: "Admin" },
  { id: "mem_3", name: "Ava Diaz", email: "ava@acme.com", role: "Member" },
  { id: "mem_4", name: "Sam Lee", email: "sam@acme.com", role: "Member" },
  { id: "mem_5", name: "Noor Haddad", email: "noor@acme.com", role: "Viewer" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Role({ role }: { role: MemberRole }) {
  if (role !== "Owner") return role
  return (
    <span className="flex items-center gap-1 font-medium text-foreground">
      <CrownIcon aria-hidden className="size-3.5" />
      {role}
    </span>
  )
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function TeamMembers({
  team = "Acme",
  initialMembers = sampleMembers,
  className,
}: TeamMembersProps) {
  const [members, setMembers] = React.useState(initialMembers)
  const { confirm, dialog } = useConfirm()
  const triggers = React.useRef(new Map<string, HTMLButtonElement>())
  const listRef = React.useRef<HTMLUListElement>(null)
  const yourRole = members.find((member) => member.you)?.role

  async function removeMember(id: string) {
    await request()
    const index = members.findIndex((member) => member.id === id)
    const neighbour = members.filter((member) => member.id !== id)[index]
    setMembers((prev) => prev.filter((member) => member.id !== id))
    requestAnimationFrame(() => {
      const trigger = neighbour && triggers.current.get(neighbour.id)
      if (trigger) trigger.focus()
      else listRef.current?.focus()
    })
  }

  async function transferOwnership(member: Member) {
    const transferred = await confirm({
      title: `Make ${member.name} the owner of ${team}?`,
      description: `${member.name} gets billing, can delete ${team} and can remove anyone, including you. You become an admin, and only the new owner can give ownership back.`,
      confirmLabel: "Transfer ownership",
      onConfirm: async () => {
        await request()
        setMembers((prev) =>
          prev.map((other) =>
            other.id === member.id
              ? { ...other, role: "Owner" }
              : other.role === "Owner"
                ? { ...other, role: "Admin" }
                : other
          )
        )
      },
    })
    if (transferred) requestAnimationFrame(() => listRef.current?.focus())
  }

  function canRemove(member: Member) {
    if (member.you || member.role === "Owner") return false
    if (yourRole === "Owner") return true
    return yourRole === "Admin" && member.role !== "Admin"
  }

  return (
    <Card className={cn("@container/members w-full", className)}>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {members.length} {members.length === 1 ? "person has" : "people have"}{" "}
          access to {team}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul
          ref={listRef}
          tabIndex={-1}
          aria-label={`Members of ${team}`}
          className="divide-y rounded-lg border outline-none"
        >
          {members.map((member) => {
            const canTransfer = yourRole === "Owner" && !member.you
            return (
              <li
                key={member.id}
                className="flex min-h-15 items-center gap-3 px-3 py-2.5 sm:px-4"
              >
                <Avatar>
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="truncate">{member.name}</span>
                    {member.you && <Badge variant="secondary">You</Badge>}
                  </span>
                  <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
                    <span className="flex shrink-0 items-center gap-1 @md/members:hidden">
                      <Role role={member.role} />
                      <span aria-hidden>·</span>
                    </span>
                    <span className="truncate">{member.email}</span>
                  </span>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground @md/members:flex">
                  <Role role={member.role} />
                </span>
                <div className="flex w-8 shrink-0 justify-end">
                  {canRemove(member) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            ref={(node) => {
                              if (node) triggers.current.set(member.id, node)
                              else triggers.current.delete(member.id)
                            }}
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${member.name}`}
                          />
                        }
                      >
                        <EllipsisIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {canTransfer && (
                          <>
                            <DropdownMenuItem
                              onClick={() => transferOwnership(member)}
                            >
                              <CrownIcon />
                              Make owner
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <ConfirmMenuItem
                          gesture="click-again"
                          variant="destructive"
                          confirmLabel={
                            <>
                              <UserMinusIcon />
                              Click again to remove
                            </>
                          }
                          onConfirm={() => removeMember(member.id)}
                        >
                          <UserMinusIcon />
                          Remove from team
                        </ConfirmMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
      {dialog}
    </Card>
  )
}

export { TeamMembers, type Member, type MemberRole, type TeamMembersProps }
