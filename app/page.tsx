import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Band } from "@/components/site/frame"
import { GitHubIcon } from "@/components/site/github-icon"
import { SiteLink } from "@/components/site/site-link"
import { Cell } from "@/components/site/home/cell"
import {
  ApiKeys,
  ConfirmByName,
  DangerZone,
  Files,
  Members,
  MessageToolbar,
  Preferences,
  Workspace,
} from "@/components/site/home/examples"
import { githubUrl } from "@/components/site/styles"

const grid =
  "grid grid-cols-1 gap-px bg-(--rule) md:grid-cols-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]"

export default function Home() {
  return (
    <main>
      <Band className="grid gap-6 px-3 py-14 sm:px-6 sm:py-16 lg:py-20">
        <h1 className="font-display text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-6xl sm:leading-[64px] lg:text-[64px] lg:leading-[68px]">
          <span className="block text-(--mark)">Confirmation components</span>
          for shadcn/ui.
        </h1>
        <p className="max-w-[560px] text-[19px] leading-[30px] text-(--ink-muted)">
          Hold, click again, type to confirm and undo. Add them with the shadcn
          CLI. They build on your own shadcn components.
        </p>
        <div className="flex gap-2">
          <Link
            href="/docs/installation"
            className={buttonVariants({ size: "lg" })}
          >
            Get started
          </Link>
          <SiteLink
            href={githubUrl}
            aria-label="GitHub"
            className={buttonVariants({ variant: "outline", size: "icon-lg" })}
          >
            <GitHubIcon />
          </SiteLink>
        </div>
      </Band>
      <Band>
        <h2 className="sr-only">Examples</h2>
        <div className={grid}>
          <Cell
            featured
            figure={1}
            gesture="Which one"
            href="/docs/which-one"
            title="A project danger zone"
            description="Three actions, three levels of risk, three ways to ask."
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
            description="Nothing unlocks until the exact name is typed."
          >
            <ConfirmByName />
          </Cell>
          <Cell
            figure={4}
            gesture="Dialog"
            href="/docs/dialogs"
            title="Leaving a shared workspace"
            description="A dialog, only when there is something to explain."
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
            description="Each row asks again in place before removing."
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
    </main>
  )
}
