import { families, installCommand } from "@/components/site/families"
import { Code } from "@/components/site/code"
import { FamilyCard } from "@/components/site/family-card"
import { Page } from "@/components/site/page"
import { ResultLog } from "@/components/site/result-log"

export default function Home() {
  return (
    <Page
      title="Confirmation components for shadcn/ui"
      description="Five ways to ask “are you sure?” behind one awaitable API. Match the friction to the risk."
    >
      <Code>{installCommand("sure")}</Code>
      <ResultLog>
        <div className="grid gap-4 sm:grid-cols-2">
          {families.map((family) => (
            <FamilyCard key={family.slug} family={family}>
              <div>
                <family.Demo />
              </div>
            </FamilyCard>
          ))}
        </div>
      </ResultLog>
    </Page>
  )
}
