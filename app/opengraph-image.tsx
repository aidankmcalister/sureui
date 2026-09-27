import { card, ogSize } from "@/components/site/og-card"

export const alt = "SureUI. Confirmation components for shadcn/ui."
export const size = ogSize
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return card({
    lead: "Confirmation components",
    rest: "for shadcn/ui.",
    detail: "Hold, click again, type to confirm, undo and dialogs.",
  })
}
