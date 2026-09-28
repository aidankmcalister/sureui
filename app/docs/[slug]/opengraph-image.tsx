import { card, ogSize } from "@/components/site/og/card"
import { getPage, pages } from "@/lib/site/docs"

export const alt = "A SureUI docs page."
export const size = ogSize
export const contentType = "image/png"
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return pages
    .filter((page) => page.slug !== "introduction")
    .map((page) => ({ slug: page.slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const page = getPage((await params).slug)

  return card({
    lead: page?.title ?? "SureUI",
    detail: page?.description ?? "Confirmation components for shadcn/ui.",
  })
}
