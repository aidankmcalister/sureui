"use client"

import { CreditCardIcon, DatabaseIcon, UsersIcon } from "lucide-react"

import {
  Consequences,
  ConsequencesItem,
} from "@/components/ui/sureui/consequences"

export default function ConsequencesDestructive() {
  return (
    <Consequences
      variant="destructive"
      title="Closing your account permanently removes"
      className="w-full max-w-sm"
    >
      <ConsequencesItem icon={<DatabaseIcon />} label="databases" count={3} />
      <ConsequencesItem
        icon={<UsersIcon />}
        label="teams you own"
        count={2}
        names={["Platform", "Growth"]}
      />
      <ConsequencesItem
        icon={<CreditCardIcon />}
        label="Billing history"
        description="Download your invoices before you close the account."
      />
    </Consequences>
  )
}
