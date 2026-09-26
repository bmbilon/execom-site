import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { marketEntry } from "@/lib/site/content/marketEntry"

export const metadata: Metadata = {
  title: "Market Entry | execom",
  description:
    "Entering a new market is harder than most founders think. execom helps companies enter Canada and the United States with sharper sequencing, better channel strategy, and fewer expensive mistakes.",
}

export default function MarketEntry() {
  return <AdvisoryPage data={marketEntry} />
}
