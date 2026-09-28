import { card, ogSize } from "@/components/site/og/card"
import { pageAt, staticParams } from "@/lib/site/docs"

export const alt = "A SureUI docs page."
export const size = ogSize
export const contentType = "image/png"
export const dynamic = "force-static"
export const dynamicParams = false

export const generateStaticParams = staticParams

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const page = pageAt(`/docs/${(await params).slug}`)!

  return card({ lead: page.title, detail: page.description })
}
