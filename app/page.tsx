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
      <Band className="grid grid-cols-1 items-center gap-10 px-3 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,640px)_340px] lg:px-10 lg:py-24">
        <div className="grid gap-6">
          <Label>SureUI · Confirmation components · Sheet 01</Label>
          <h1 className="text-4xl leading-10 font-bold tracking-[-0.045em] sm:text-6xl sm:leading-[64px] lg:text-[72px] lg:leading-[76px]">
            Ask the right way.
            <span className="block text-(--mark)">Are you sure?</span>
          </h1>
          <p className="max-w-[600px] text-[19px] leading-[30px] text-(--ink-muted)">
            Hold, click again, type to confirm and undo, all behind one
            promise-based API. They build on your own shadcn components, and
            dialogs are optional.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Label>Install</Label>
          <Command>{installCommand("confirm-button")}</Command>
          <div className="flex flex-wrap gap-2">
            <Link href="/docs" className={buttonVariants()}>
              Read the docs
            </Link>
            <SiteLink
              href={githubUrl}
              aria-label="GitHub"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <GitHubIcon />
            </SiteLink>
          </div>
        </div>
      </Band>
      <Band>
        <div className={grid}>
          <Cell
            featured
            figure={1}
            gesture="Type to confirm"
            friction="high"
            title="Deleting a production project"
            description="Nothing unlocks until the exact name is typed and the risk is acknowledged."
          >
            <DeleteProject />
          </Cell>
          <Cell
            figure={2}
            gesture="Hold"
            friction="low"
            title="Revoking an API key"
            description="Press and hold. Letting go early cancels."
          >
            <ApiKeys />
          </Cell>
          <Cell
            figure={3}
            gesture="Click again"
            friction="low"
            title="Archiving from an inbox"
            description="The first click arms it, the second confirms."
          >
            <Inbox />
          </Cell>
          <Cell
            figure={4}
            gesture="Dialog"
            friction="optional"
            title="Leaving a shared workspace"
            description="A dialog, only when there is something to explain."
          >
            <Workspace />
          </Cell>
          <Cell
            figure={5}
            gesture="Hold"
            friction="low"
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
            friction="none"
            title="Clearing out shared files"
            description="Moves to trash right away, with five seconds to undo."
            className="md:col-span-2 lg:col-span-1"
          >
            <Files />
          </Cell>
          <Cell
            figure={7}
            gesture="Click again"
            friction="low"
            title="Removing a teammate"
            description="Each row confirms in place, styled from data-state."
          >
            <Members />
          </Cell>
          <Cell
            figure={8}
            gesture="Hold · Click again"
            friction="low"
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
