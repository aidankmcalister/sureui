import type { Metadata } from "next"
import Link from "next/link"

import { Code } from "@/components/site/code"
import {
  DocsHeader,
  DocsSection,
  FramedList,
  Friction,
  Prose,
} from "@/components/site/docs"
import { Label } from "@/components/site/frame"
import { styles } from "@/components/site/styles"

export const metadata: Metadata = { title: "Introduction" }

const contract = `async function deleteProject() {
  await api.projects.delete(id)
}

<ConfirmButton undo onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="click-again" onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="hold" onConfirm={deleteProject}>Delete</ConfirmButton>
<TypeToConfirm phrase="acme-prod" onConfirm={deleteProject} />
<ConfirmDialog title="Delete acme-prod?" onConfirm={deleteProject}>
  <Button>Delete</Button>
</ConfirmDialog>`

export default function Introduction() {
  return (
    <>
      <DocsHeader
        href="/docs"
        lead="What SureUI is, and how it decides how much to ask of people."
      />
      <DocsSection label="The idea">
        <Prose>
          <p>
            When every action opens an “Are you sure?” dialog, people stop
            reading and confirm on reflex. The one dialog that matters gets the
            same click as the fifty that didn&apos;t.
          </p>
          <p>
            SureUI matches friction to risk. Reversible actions happen right
            away with an undo. Small ones take a second click or a hold. Only
            permanent actions, or ones that affect other people, ask for more.
          </p>
        </Prose>
      </DocsSection>
      <DocsSection label="Five styles">
        <FramedList>
          {styles.map((style, index) => (
            <Link
              key={style.slug}
              href={`/docs/${style.slug}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 bg-(--paper) px-4 py-4 hover:bg-background sm:px-5"
            >
              <Label className="text-(--mark-text)">
                Fig. {String(index + 1).padStart(2, "0")}
              </Label>
              <span className="grid gap-1">
                <span className="font-semibold">{style.name}</span>
                <span className="text-sm text-(--ink-muted)">
                  {style.summary}
                </span>
              </span>
              <Friction value={style.friction} />
            </Link>
          ))}
        </FramedList>
      </DocsSection>
      <DocsSection label="One contract">
        <Prose>
          <p>
            Every style takes the same <code>onConfirm</code>. Return a promise
            and the control stays pending until it settles.
          </p>
        </Prose>
        <Code>{contract}</Code>
      </DocsSection>
    </>
  )
}
