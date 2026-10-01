import { DocsPager, DocsSidebar } from "@/components/site/docs/nav"
import { Band } from "@/components/site/layout/frame"
import { pages, sections } from "@/lib/site/docs"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Band grow className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <DocsSidebar sections={sections} />
      <main
        id="content"
        tabIndex={-1}
        className="flex min-w-0 flex-col outline-none"
      >
        <div className="flex-1">{children}</div>
        <DocsPager pages={pages} />
      </main>
    </Band>
  )
}
