import { llmsFull, textResponse } from "@/components/site/llms"

export const dynamic = "force-static"

export function GET() {
  return textResponse(llmsFull(), "text/plain")
}
