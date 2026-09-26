import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { SredFeeEstimator } from "@/components/site/sred/SredFeeEstimator"
import { sred } from "@/lib/site/content/sred"

export const metadata: Metadata = {
  title: "SR&ED | execom",
  description:
    "Prepare SR&ED claims in the execom portal for 5% of the credit, not the 15–30% most consultants charge. Projects in the format CRA reviewers expect, costs organized as you go.",
}

export default function SRED() {
  return <AdvisoryPage data={sred} heroAside={<SredFeeEstimator />} />
}
