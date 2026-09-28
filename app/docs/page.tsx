import type { Metadata } from "next"

import { DocsArticle } from "@/components/site/docs/article"
import { getPage } from "@/lib/site/docs"

const page = getPage("introduction")!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function Introduction() {
  return <DocsArticle page={page} />
}
