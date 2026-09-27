import { Actions } from "@/components/site/actions"
import { Band } from "@/components/site/frame"
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
        <Actions />
      </Band>
      <Band>
        <div className="grid gap-4 border-b border-(--rule) px-3 py-12 sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl leading-9 font-bold tracking-[-0.04em] text-balance sm:text-[40px] sm:leading-[44px]">
            <span className="block text-(--mark)">Eight real screens.</span>
            Try every one.
          </h2>
          <p className="max-w-[560px] text-[17px] leading-7 text-pretty text-(--ink-muted)">
            Each asks in its own way, from a quick undo to a typed name. They
            all work, and each one resets when you&apos;re done.
          </p>
        </div>
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
      <Band className="flex flex-wrap items-center justify-between gap-6 px-3 py-12 sm:px-6">
        <p className="font-display text-2xl font-bold tracking-tight">
          Start with the one you need.
        </p>
        <Actions />
      </Band>
    </main>
  )
}
