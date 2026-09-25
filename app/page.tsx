import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { ApiKeys } from "@/components/site/blocks/api-keys"
import { DangerZone } from "@/components/site/blocks/danger-zone"
import { Files } from "@/components/site/blocks/files"
import { Inbox } from "@/components/site/blocks/inbox"
import { githubUrl } from "@/components/site/families"

export default function Home() {
  return (
    <main className="mx-auto grid max-w-6xl gap-16 px-4 py-20">
      <section className="grid justify-items-center gap-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Confirmation components for shadcn/ui
        </h1>
        <p className="max-w-xl text-lg text-balance text-muted-foreground">
          Hold, click again, type to confirm and undo. Built on your own shadcn
          components. Dialogs optional.
        </p>
        <div className="flex gap-3">
          <Link href="/docs" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
          <a
            href={githubUrl}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            GitHub
          </a>
        </div>
      </section>
      <section className="grid items-start gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <ApiKeys />
          <Files />
        </div>
        <div className="grid gap-4">
          <DangerZone />
          <Inbox />
        </div>
      </section>
    </main>
  )
}
