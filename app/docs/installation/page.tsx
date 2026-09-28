import type { Metadata } from "next"

import { Code } from "@/components/site/code"
import { DocsHeader, DocsSection } from "@/components/site/docs"
import { Label } from "@/components/site/frame"
import { InstallCommand } from "@/components/site/install-command"
import { addArgs, items, siteUrl } from "@/components/site/styles"

export const metadata: Metadata = { title: "Installation" }

const registry = `{
  "registries": {
    "@sureui": "${siteUrl}/r/{name}.json"
  }
}`

const layout = `import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`

const steps = [
  {
    title: "Set up shadcn/ui",
    body: "SureUI adds to a shadcn/ui project built on Base UI, the shadcn default. If your project doesn't use shadcn yet, start with:",
    content: <InstallCommand args="init" />,
  },
  {
    title: "Add the SureUI registry",
    body: (
      <>
        Add <code>@sureui</code> to the registries in your{" "}
        <code>components.json</code>:
      </>
    ),
    content: <Code highlight={[3]}>{registry}</Code>,
  },
  {
    title: "Add the items you need",
    body: (
      <>
        Each item brings the confirmation core with it, so install only the ones
        you use:{" "}
        {items.map((item, index) => (
          <span key={item}>
            {index > 0 && (index === items.length - 1 ? " or " : ", ")}
            <code>{item}</code>
          </span>
        ))}
        .
      </>
    ),
    content: <InstallCommand args={addArgs(["confirm-button"])} />,
  },
  {
    title: "Mount the Toaster, for undo toasts only",
    body: "undoToast shows a shadcn toast. Everything else needs no setup.",
    content: <Code highlight={[1, 8]}>{layout}</Code>,
  },
]

export default function Installation() {
  return (
    <>
      <DocsHeader
        href="/docs/installation"
        lead="Add SureUI to a shadcn/ui project with the shadcn CLI."
      />
      <DocsSection label="Steps">
        <ol className="divide-y divide-(--rule) border border-(--rule)">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-[48px_minmax(0,1fr)] sm:px-5"
            >
              <Label className="pt-1 text-(--mark-text)">
                {String(index + 1).padStart(2, "0")}
              </Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-1">
                  <h2 className="font-semibold">{step.title}</h2>
                  <p className="text-sm text-pretty text-(--ink-muted) [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-(--ink)">
                    {step.body}
                  </p>
                </div>
                {step.content}
              </div>
            </li>
          ))}
        </ol>
      </DocsSection>
    </>
  )
}
