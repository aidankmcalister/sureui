"use client"

import { Consequences } from "@/components/ui/sureui/consequences"

export default function ConsequencesSubject() {
  return (
    <Consequences
      subject="acme/web-app"
      subjectDescription="48 stars · 6 watchers · updated 3 days ago"
      title="This permanently deletes"
      items={[
        { label: "Issues", count: 12 },
        { label: "Workflow runs", count: 340 },
        { label: "Packages", names: ["acme-ui", "acme-config"] },
      ]}
      className="w-full max-w-sm"
    />
  )
}
