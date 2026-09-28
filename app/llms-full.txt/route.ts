import { llmsFull, textResponse } from "@/lib/site/llms"

export const dynamic = "force-static"

export function GET() {
  return textResponse(llmsFull(), "text/plain")
}
