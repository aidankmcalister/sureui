import { ApiKeys } from "@/components/blocks/api-keys-01/api-keys"
import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"
import { DeleteAccount } from "@/components/blocks/delete-account-01/delete-account"
import { TeamMembers } from "@/components/blocks/team-members-01/team-members"

const demos: Record<string, React.ReactNode> = {
  "danger-zone-01": <DangerZone />,
  "api-keys-01": <ApiKeys />,
  "delete-account-01": <DeleteAccount />,
  "team-members-01": <TeamMembers />,
}

export const blockDemoNames = Object.keys(demos)

export function BlockDemo({ name }: { name: string }) {
  return demos[name] ?? null
}
