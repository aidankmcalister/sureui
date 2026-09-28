import { DocsPager, DocsSidebar } from "@/components/site/docs/nav"
import { Band } from "@/components/site/layout/frame"
import { pages } from "@/lib/site/docs"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Band grow className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <DocsSidebar pages={pages} />
      <main className="flex min-w-0 flex-col">
        <div className="flex-1">{children}</div>
        <DocsPager pages={pages} />
      </main>
    </Band>
  )
}
