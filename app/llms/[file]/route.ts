import { pageMarkdown, textResponse } from "@/lib/site/llms"
import { pages } from "@/lib/site/docs"

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
  const page = pages.find((item) => `${item.slug}.md` === file)!
  return textResponse(pageMarkdown(page), "text/markdown")
}
