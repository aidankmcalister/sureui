"use client"

import { ApiKeys } from "@/components/blocks/api-keys-01/api-keys"
import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"
import { DeleteAccount } from "@/components/blocks/delete-account-01/delete-account"
import { FileManager } from "@/components/blocks/file-manager-01/file-manager"
import { Inbox } from "@/components/blocks/inbox-01/inbox"
import { TeamMembers } from "@/components/blocks/team-members-01/team-members"

const previews: Record<string, React.ComponentType> = {
  "danger-zone-01": DangerZone,
  "api-keys-01": ApiKeys,
  "delete-account-01": DeleteAccount,
  "team-members-01": TeamMembers,
  "file-manager-01": FileManager,
  "inbox-01": Inbox,
}

export const blockPreviewNames = Object.keys(previews)

export function BlockPreview({ name }: { name: string }) {
  const Component = previews[name]
  return Component ? <Component /> : null
}
