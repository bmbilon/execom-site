import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { ReadinessCard } from "@/components/site/design/ReadinessCard"
import { prototyping } from "@/lib/site/content/prototyping"

export const metadata: Metadata = {
  title: "Prototyping | execom",
  description:
    "Most products fail before they're tooled, not after. execom pressure-tests your concept before you spend money on prototyping, manufacturing, and packaging, so you build the right thing once.",
}

export default function PrototypingPage() {
  return <AdvisoryPage data={prototyping} heroAside={<ReadinessCard />} />
}
