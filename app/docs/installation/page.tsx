import type { Metadata } from "next"

import { Code } from "@/components/site/code"
import { DocsSection, DocsTitle } from "@/components/site/docs"
import { families, installCommand } from "@/components/site/families"

export const metadata: Metadata = { title: "Installation" }

export default function Installation() {
  return (
    <>
      <DocsTitle
        title="Installation"
        description="Each component is its own registry item. Install only what you use."
      />
      <DocsSection title="Components">
        {families.map((family) => (
          <div key={family.slug} className="grid gap-2">
            <p className="text-sm font-medium">{family.name}</p>
            <Code>{installCommand(family.item)}</Code>
          </div>
        ))}
      </DocsSection>
      <DocsSection title="Undo toast setup">
        <p className="leading-7">
          undoToast uses the shadcn Toaster. Add it once to your root layout if
          you haven&apos;t already.
        </p>
        <Code>{`import { Toaster } from "@/components/ui/sonner"

<body>
  {children}
  <Toaster />
</body>`}</Code>
      </DocsSection>
    </>
  )
}
