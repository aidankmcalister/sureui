import { Toaster } from "@/components/ui/sonner"
import { DocsBar, DocsPager, DocsSidebar } from "@/components/site/docs-nav"
import { Band } from "@/components/site/frame"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="lg:hidden">
        <Band>
          <DocsBar />
        </Band>
      </div>
      <Band grow className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <DocsSidebar />
        <main className="flex min-w-0 flex-col">
          <div className="flex-1">{children}</div>
          <DocsPager />
        </main>
      </Band>
      <Toaster />
    </>
  )
}
