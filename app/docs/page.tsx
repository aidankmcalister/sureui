import type { Metadata } from "next"
import Link from "next/link"

import { Code } from "@/components/site/code"
import {
  DocsHeader,
  DocsSection,
  FramedList,
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
            SureUI gives you more ways to ask: an undo, a second click, a hold,
            a typed name, or a dialog when you want one. Pick whichever fits the
            moment.
          </p>
        </Prose>
      </DocsSection>
      <DocsSection label="Five styles">
        <FramedList>
          {styles.map((style, index) => (
            <Link
              key={style.slug}
              href={`/docs/${style.slug}`}
              className="grid grid-cols-1 items-baseline gap-x-4 gap-y-1 bg-(--paper) px-4 py-4 hover:bg-(--well) sm:grid-cols-[auto_minmax(0,1fr)] sm:px-5"
            >
              <Label className="text-(--mark-text) max-sm:hidden">
                Fig. {String(index + 1).padStart(2, "0")}
              </Label>
              <span className="grid gap-1">
                <span className="font-semibold">{style.name}</span>
                <span className="text-sm text-(--ink-muted)">
                  {style.summary}
                </span>
              </span>
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
