import type { Metadata } from "next"

import { Code, Command } from "@/components/site/code"
import { DocsHeader, DocsSection } from "@/components/site/docs"
import { Label } from "@/components/site/frame"
import { installCommand } from "@/components/site/styles"

export const metadata: Metadata = { title: "Installation" }

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
    title: "Add the confirm button",
    body: "It brings the confirmation core that every style shares.",
    content: <Command>{installCommand("confirm-button")}</Command>,
  },
  {
    title: "Add the others you need",
    body: "Each is its own item. Skip the dialog and it never lands in your app.",
    content: (
      <div className="grid grid-cols-1 gap-2">
        {["type-to-confirm", "confirm-dialog", "undo-toast"].map((item) => (
          <Command key={item}>{installCommand(item)}</Command>
        ))}
      </div>
    ),
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
        lead="Add only the pieces you use with the shadcn CLI."
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
                  <p className="text-sm text-(--ink-muted)">{step.body}</p>
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
