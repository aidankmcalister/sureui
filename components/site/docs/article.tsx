import { DocsHeader } from "@/components/site/docs/sections"
import { DocsToc } from "@/components/site/docs/toc"
import { headings, type Page } from "@/lib/site/docs"

export async function DocsArticle({ page }: { page: Page }) {
  const { default: Content } = await import(`@/content/docs/${page.slug}.mdx`)

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <DocsHeader page={page} />
        <div className="docs-body pb-12 lg:pb-14">
          <Content />
        </div>
      </article>
      <aside
        aria-label="Table of contents"
        className="hidden border-l border-(--rule) xl:block"
      >
        <div className="sticky top-0 max-h-svh overflow-y-auto px-5 py-10 lg:py-12">
          <DocsToc headings={headings(page.slug)} />
        </div>
      </aside>
    </div>
  )
}
