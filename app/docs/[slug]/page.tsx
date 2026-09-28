import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DocsArticle } from "@/components/site/docs/article"
import { pageAt, staticParams } from "@/lib/site/docs"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export const generateStaticParams = staticParams

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = pageAt(`/docs/${(await params).slug}`)
  return { title: page?.title, description: page?.description }
}

export default async function DocsPage({ params }: Props) {
  const page = pageAt(`/docs/${(await params).slug}`)
  if (!page) notFound()

  return <DocsArticle page={page} />
}
