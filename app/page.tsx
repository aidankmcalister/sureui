import type { Metadata } from "next"

import { Actions } from "@/components/site/layout/actions"
import {
  aboveMark,
  Band,
  PageLead,
  PageTitle,
} from "@/components/site/layout/frame"
import { cn } from "@/lib/utils"
import { Cell } from "@/components/site/home/cell"
import { Agent } from "@/components/site/home/examples/agent"
import { ConfirmByName } from "@/components/site/home/examples/confirm-by-name"
import { Database } from "@/components/site/home/examples/database"
import { Notifications } from "@/components/site/home/examples/notifications"
import { Sessions } from "@/components/site/home/examples/sessions"
import { Variables } from "@/components/site/home/examples/variables"
import { Webhooks } from "@/components/site/home/examples/webhooks"
import { Workspace } from "@/components/site/home/examples/workspace"

const title = "SureUI · Confirmation components for shadcn/ui"
const description =
  "Open source confirmation components for shadcn/ui: undo, hold to confirm, type to confirm and more. Built on Base UI."

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "SureUI",
    type: "website",
  },
}

const grid =
  "grid grid-cols-1 gap-px bg-(--rule) md:grid-cols-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]"

export default function Home() {
  return (
    <main>
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <PageTitle>
          <span className="block text-(--mark)">Confirmation components</span>
          for shadcn/ui.
        </PageTitle>
        <PageLead>
          Undo, hold to confirm, type to confirm and more. Open source and built
          on Base UI. Install them with the shadcn CLI, and they use the shadcn
          components you already have.
        </PageLead>
        <Actions />
      </Band>
      <Band>
        <div className="grid gap-4 border-b border-(--rule) px-3 py-12 sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl leading-9 font-bold tracking-[-0.04em] text-balance sm:text-[40px] sm:leading-11">
            Try it out.
          </h2>
          <p className="max-w-140 text-[17px] leading-7 text-pretty text-(--ink-muted)">
            Each example is a small, working part of a real app.
          </p>
        </div>
        <div className={grid}>
          <Cell
            featured
            gesture="Mixed"
            href="/docs"
            title="Database settings"
            description="Riskier actions ask for more before they run."
          >
            <Database />
          </Cell>
          <Cell
            gesture="Hold"
            href="/docs/confirm-button#hold"
            title="Sign out other devices"
            description="Hold the button to sign out. Let go early to cancel."
          >
            <Sessions />
          </Cell>
          <Cell
            gesture="Type to confirm"
            href="/docs/type-to-confirm"
            title="Delete a repository"
            description="Type the repository name to turn on Delete."
          >
            <ConfirmByName />
          </Cell>
          <Cell
            gesture="Dialog"
            href="/docs/confirm-dialog"
            title="Leave a workspace"
            description="A dialog asks first, since you need an invite to get back in."
          >
            <Workspace />
          </Cell>
          <Cell
            gesture="Tool approval"
            href="/docs/tool-approval"
            title="Approve an AI action"
            description="The AI asks before it deletes a table. Hold to approve."
          >
            <Agent />
          </Cell>
        </div>
      </Band>
      <Band>
        <div className={grid}>
          <Cell
            gesture="Undo"
            href="/docs/confirm-button#undo"
            title="Clear notifications"
            description="Clears right away. You have 5 seconds to undo."
            className="md:col-span-2 lg:col-span-1"
          >
            <Notifications />
          </Cell>
          <Cell
            gesture="Menu item"
            href="/docs/confirm-menu-item"
            title="Delete a variable"
            description="Click Delete in the menu, then click again to confirm."
          >
            <Variables />
          </Cell>
          <Cell
            gesture="Undoable"
            href="/docs/undoable"
            title="Remove a webhook"
            description="The row shows Undo for a few seconds before it goes."
          >
            <Webhooks />
          </Cell>
        </div>
      </Band>
      <Band
        className={cn(
          aboveMark,
          "flex flex-wrap items-center justify-between gap-6 px-3 py-12 sm:px-6"
        )}
      >
        <p className="font-display text-2xl font-bold tracking-tight">
          Free and open source. MIT licensed.
        </p>
        <Actions />
      </Band>
    </main>
  )
}
