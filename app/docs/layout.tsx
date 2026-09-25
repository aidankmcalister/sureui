import { DocsNav, DocsPager } from "@/components/site/docs-nav"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[12rem_1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-10">
          <DocsNav />
        </div>
      </aside>
      <details className="rounded-lg border px-4 py-3 md:hidden">
        <summary className="text-sm font-medium">Menu</summary>
        <div className="pt-4">
          <DocsNav />
        </div>
      </details>
      <main className="grid max-w-3xl min-w-0 content-start gap-10">
        {children}
        <DocsPager />
      </main>
    </div>
  )
}
