import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DocsArticle } from "@/components/site/docs/article"
import { getPage, pages } from "@/lib/site/docs"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return pages
    .filter((page) => page.slug !== "introduction")
    .map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug)
  return { title: page?.title, description: page?.description }
}

export default async function DocsPage({ params }: Props) {
  const page = getPage((await params).slug)
  if (!page || page.slug === "introduction") notFound()

  return <DocsArticle page={page} />
}
