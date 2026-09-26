import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { vcAngel } from "@/lib/site/content/vcAngel"

export const metadata: Metadata = {
  title: "VC / Angel Capital | execom",
  description:
    "Before you raise venture capital or take angel financing, understand the math, the terms, and the structural realities. execom helps founders evaluate capital strategy before decisions become irreversible.",
}

export default function VCAngelCapital() {
  return <AdvisoryPage data={vcAngel} />
}
