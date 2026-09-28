import type { Metadata } from "next"

import { DocsArticle } from "@/components/site/docs/article"
import { pageAt } from "@/lib/site/docs"

const page = pageAt("/docs")!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function Introduction() {
  return <DocsArticle page={page} />
}
