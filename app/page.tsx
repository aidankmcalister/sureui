import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Command } from "@/components/site/code"
import { Band, Label } from "@/components/site/frame"
import { GitHubIcon } from "@/components/site/github-icon"
import { SiteLink } from "@/components/site/site-link"
import { Cell } from "@/components/site/home/cell"
import {
  ApiKeys,
  DeleteProject,
  Files,
  Inbox,
  Members,
  MessageToolbar,
  Preferences,
  Workspace,
} from "@/components/site/home/examples"
import { githubUrl, installCommand } from "@/components/site/styles"

const grid =
  "grid grid-cols-1 gap-px bg-(--rule) md:grid-cols-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]"

export default function Home() {
  return (
    <main>
      <Band>
        <div className="grid grid-cols-1 gap-px bg-(--rule) min-[1340px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]">
          <div className="grid gap-6 bg-(--paper) px-3 pt-14 pb-10 min-[1340px]:col-span-2 min-[1340px]:pb-20 sm:px-6 sm:pt-16 lg:pt-20">
            <h1 className="text-4xl leading-10 font-bold tracking-[-0.04em] text-balance sm:text-6xl sm:leading-[64px] lg:text-[64px] lg:leading-[68px]">
              <span className="block text-(--mark)">
                Confirmation components
              </span>
              for shadcn/ui.
            </h1>
            <p className="max-w-[560px] text-[19px] leading-[30px] text-(--ink-muted)">
              Hold, click again, type to confirm and undo. Add them with the
              shadcn CLI. They build on your own shadcn components.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 bg-(--paper) px-3 py-10 min-[1340px]:py-20 sm:px-6">
            <div className="grid w-full max-w-[400px] gap-3">
              <Label>Install</Label>
              <Command>{installCommand("confirm-button")}</Command>
              <div className="flex gap-2">
                <Link href="/docs" className={buttonVariants({ size: "lg" })}>
                  Get started
                </Link>
                <SiteLink
                  href={githubUrl}
                  aria-label="GitHub"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-lg",
                  })}
                >
                  <GitHubIcon />
                </SiteLink>
              </div>
            </div>
          </div>
        </div>
      </Band>
      <Band>
        <h2 className="sr-only">Examples</h2>
        <div className={grid}>
          <Cell
            featured
            figure={1}
            gesture="Type to confirm"
            title="Deleting a production project"
            description="Nothing unlocks until the exact name is typed and the risk is acknowledged."
          >
            <DeleteProject />
          </Cell>
          <Cell
            figure={2}
            gesture="Hold"
            title="Revoking an API key"
            description="Press and hold. Letting go early cancels."
          >
            <ApiKeys />
          </Cell>
          <Cell
            figure={3}
            gesture="Click again"
            title="Archiving from an inbox"
            description="The first click arms it, the second confirms."
          >
            <Inbox />
          </Cell>
          <Cell
            figure={4}
            gesture="Dialog"
            title="Leaving a shared workspace"
            description="A dialog, only when there is something to explain."
          >
            <Workspace />
          </Cell>
          <Cell
            figure={5}
            gesture="Hold"
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
            title="Clearing out shared files"
            description="Moves to trash right away, with five seconds to undo."
            className="md:col-span-2 lg:col-span-1"
          >
            <Files />
          </Cell>
          <Cell
            figure={7}
            gesture="Click again"
            title="Removing a teammate"
            description="Each row confirms in place, styled from data-state."
          >
            <Members />
          </Cell>
          <Cell
            figure={8}
            gesture="Hold · Click again"
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
