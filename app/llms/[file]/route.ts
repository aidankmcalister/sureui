import { pageMarkdown, textResponse } from "@/components/site/llms"
import { pages } from "@/components/site/styles"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return pages.map((page) => ({ file: `${page.slug}.md` }))
}

export async function GET(
  _: Request,
  { params }: RouteContext<"/llms/[file]">
) {
  const { file } = await params
  const page = pages.find((item) => `${item.slug}.md` === file)
  if (!page) return new Response("Not found", { status: 404 })
  return textResponse(pageMarkdown(page), "text/markdown")
}
