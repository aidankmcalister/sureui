"use client"

import { AgentApproval } from "@/components/blocks/agent-approval-01/agent-approval"
import { ApiKeys } from "@/components/blocks/api-keys-01/api-keys"
import { BulkActions } from "@/components/blocks/bulk-actions-01/bulk-actions"
import { CancelSubscription } from "@/components/blocks/cancel-subscription-01/cancel-subscription"
import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"
import { DeleteAccount } from "@/components/blocks/delete-account-01/delete-account"
import { FileManager } from "@/components/blocks/file-manager-01/file-manager"
import { Inbox } from "@/components/blocks/inbox-01/inbox"
import { Reauth } from "@/components/blocks/reauth-01/reauth"
import { ScheduledDeletion } from "@/components/blocks/scheduled-deletion-01/scheduled-deletion"
import { SettingsSaveBar } from "@/components/blocks/settings-save-bar-01/settings-save-bar"
import { TeamMembers } from "@/components/blocks/team-members-01/team-members"
import { TransferOwnership } from "@/components/blocks/transfer-ownership-01/transfer-ownership"

const previews: Record<string, React.ComponentType> = {
  "danger-zone-01": DangerZone,
  "api-keys-01": ApiKeys,
  "delete-account-01": DeleteAccount,
  "team-members-01": TeamMembers,
  "file-manager-01": FileManager,
  "inbox-01": Inbox,
  "agent-approval-01": AgentApproval,
  "bulk-actions-01": BulkActions,
  "scheduled-deletion-01": ScheduledDeletion,
  "reauth-01": Reauth,
  "settings-save-bar-01": SettingsSaveBar,
  "transfer-ownership-01": TransferOwnership,
  "cancel-subscription-01": CancelSubscription,
}

export const blockPreviewNames = Object.keys(previews)

export function BlockPreview({ name }: { name: string }) {
  const Component = previews[name]
  return Component ? <Component /> : null
}
