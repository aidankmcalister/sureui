import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { families, installCommand } from "@/components/site/families"
import { Code } from "@/components/site/code"
import { Page, Section } from "@/components/site/page"
import { PropsTable } from "@/components/site/props-table"
import { ResultLog } from "@/components/site/result-log"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return families.map((family) => ({ slug: family.slug }))
}

async function getFamily({ params }: Props) {
  const { slug } = await params
  return families.find((family) => family.slug === slug)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: (await getFamily(props))?.name }
}

export default async function FamilyPage(props: Props) {
  const family = await getFamily(props)
  if (!family) notFound()

  return (
    <Page title={family.name} description={family.description}>
      <ResultLog>
        <div className="flex min-h-40 items-center justify-center rounded-xl border p-6">
          <family.Demo />
        </div>
      </ResultLog>
      <Section title="Install">
        <Code>{installCommand(family.item)}</Code>
      </Section>
      <Section title="Usage">
        <Code>{family.usage}</Code>
      </Section>
      <Section title="Props">
        <PropsTable rows={family.props} />
      </Section>
    </Page>
  )
}
