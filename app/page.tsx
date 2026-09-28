import type { Metadata } from "next"

import { Actions } from "@/components/site/layout/actions"
import { Band } from "@/components/site/layout/frame"
import { Cell } from "@/components/site/home/cell"
import { ApiKeys } from "@/components/site/home/examples/api-keys"
import { ConfirmByName } from "@/components/site/home/examples/confirm-by-name"
import { DangerZone } from "@/components/site/home/examples/danger-zone"
import { Files } from "@/components/site/home/examples/files"
import { Members } from "@/components/site/home/examples/members"
import { MessageToolbar } from "@/components/site/home/examples/message-toolbar"
import { Preferences } from "@/components/site/home/examples/preferences"
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
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-[44px] sm:leading-12 lg:text-[64px] lg:leading-17">
          <span className="block text-(--mark)">Confirmation components</span>
          for shadcn/ui.
        </h1>
        <p className="max-w-140 text-[19px] leading-7.5 text-pretty text-(--ink-muted)">
          Hold, click again, type to confirm, undo and dialogs. You add them
          with the shadcn CLI, and they build on the shadcn components already
          in your app.
        </p>
        <Actions />
      </Band>
      <Band>
        <div className="grid gap-4 border-b border-(--rule) px-3 py-12 sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl leading-9 font-bold tracking-[-0.04em] text-balance sm:text-[40px] sm:leading-11">
            Try it out.
          </h2>
          <p className="max-w-140 text-[17px] leading-7 text-pretty text-(--ink-muted)">
            Each example is a working screen from an everyday app, like project
            settings or a message inbox.
          </p>
        </div>
        <div className={grid}>
          <Cell
            featured
            figure={1}
            gesture="Several styles"
            href="/docs"
            title="A project danger zone"
            description="Pause, transfer and delete each ask for a different amount of confirmation."
          >
            <DangerZone />
          </Cell>
          <Cell
            figure={2}
            gesture="Hold"
            href="/docs/hold"
            title="Revoking an API key"
            description="Press and hold. Letting go early cancels."
          >
            <ApiKeys />
          </Cell>
          <Cell
            figure={3}
            gesture="Type to confirm"
            href="/docs/type-to-confirm"
            title="Deleting by name"
            description="Delete stays disabled until you type the exact name."
          >
            <ConfirmByName />
          </Cell>
          <Cell
            figure={4}
            gesture="Dialog"
            href="/docs/dialogs"
            title="Leaving a shared workspace"
            description="A dialog, because leaving affects everyone else in the workspace."
          >
            <Workspace />
          </Cell>
          <Cell
            figure={5}
            gesture="Hold"
            href="/docs/hold"
            title="Resetting preferences"
            description="A longer hold for a bigger reset."
          >
            <Preferences />
          </Cell>
        </div>
      </Band>
      <Band>
        <div className={grid}>
          <Cell
            figure={6}
            gesture="Undo"
            href="/docs/undo"
            title="Clearing out shared files"
            description="Moves to trash right away, with five seconds to undo."
            className="md:col-span-2 lg:col-span-1"
          >
            <Files />
          </Cell>
          <Cell
            figure={7}
            gesture="Click again"
            href="/docs/click-again"
            title="Removing a teammate"
            description="Each row asks for a second click before it removes anyone."
          >
            <Members />
          </Cell>
          <Cell
            figure={8}
            gesture="Hold · Click again"
            href="/docs/hold"
            title="Tidying a message"
            description="Icon buttons: click again to archive, hold to delete."
          >
            <MessageToolbar />
          </Cell>
        </div>
      </Band>
      <Band className="flex flex-wrap items-center justify-between gap-6 px-3 py-12 sm:px-6">
        <p className="font-display text-2xl font-bold tracking-tight">
          Free and open source. MIT licensed.
        </p>
        <Actions />
      </Band>
    </main>
  )
}
