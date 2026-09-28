"use client"

import * as React from "react"
import { EllipsisIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  { id: "mem_4", name: "Sam Lee", email: "sam@acme.com", role: "Viewer" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function request() {
  return Promise.resolve()
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
      </CardHeader>
      <CardContent>
        <ul
          ref={listRef}
          tabIndex={-1}
          aria-label={`Members of ${team}`}
          className="divide-y outline-none"
        >
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar>
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1">
                <span className="truncate font-medium">
                  {member.name}
                  {member.you && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      (you)
                    </span>
                  )}
                </span>
                <span className="truncate text-muted-foreground">
                  <span className="@sm/members:hidden">{member.role} · </span>
                  {member.email}
                </span>
              </div>
              <span className="hidden shrink-0 text-muted-foreground @sm/members:inline">
                {member.role}
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
                          size="icon"
                          aria-label={`Actions for ${member.name}`}
                        />
                      }
                    >
                      <EllipsisIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {yourRole === "Owner" && (
                        <DropdownMenuItem
                          onClick={() => transferOwnership(member)}
                        >
                          Make owner
                        </DropdownMenuItem>
                      )}
                      <ConfirmMenuItem
                        gesture="click-again"
                        variant="destructive"
                        confirmLabel={`Remove ${member.name.split(" ")[0]}?`}
                        onConfirm={() => removeMember(member.id)}
                      >
                        Remove from team
                      </ConfirmMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      {dialog}
    </Card>
  )
}

export { TeamMembers, type Member, type MemberRole, type TeamMembersProps }
