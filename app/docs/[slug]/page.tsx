import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code } from "@/components/site/code"
import { DocsSection, DocsTitle } from "@/components/site/docs"
import { families, installCommand } from "@/components/site/families"
import { Preview } from "@/components/site/preview"
import { PropsTable } from "@/components/site/props-table"

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

export default async function ComponentPage(props: Props) {
  const family = await getFamily(props)
  if (!family) notFound()

  return (
    <>
      <DocsTitle
        title={family.name}
        badge={family.friction}
        description={family.description}
      />
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <Preview>
            <family.Demo />
          </Preview>
        </TabsContent>
        <TabsContent value="code">
          <Code>{family.usage}</Code>
        </TabsContent>
      </Tabs>
      <DocsSection title="Installation">
        <Code>{installCommand(family.item)}</Code>
      </DocsSection>
      <DocsSection title="Props">
        <PropsTable rows={family.props} />
      </DocsSection>
    </>
  )
}
