import { card, ogSize } from "@/components/site/og-card"
import { getStyle, styles } from "@/components/site/styles"

export const alt = "A SureUI confirmation component for shadcn/ui."
export const size = ogSize
export const contentType = "image/png"
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return styles.map((style) => ({ slug: style.slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const style = getStyle((await params).slug)

  return card({
    lead: style?.name ?? "SureUI",
    detail: style?.lead ?? "Confirmation components for shadcn/ui.",
  })
}
