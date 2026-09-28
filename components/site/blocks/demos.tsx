import { DangerZone } from "@/components/blocks/danger-zone-01/danger-zone"

const demos: Record<string, React.ReactNode> = {
  "danger-zone-01": <DangerZone />,
}

export const blockDemoNames = Object.keys(demos)

export function BlockDemo({ name }: { name: string }) {
  return demos[name] ?? null
}
