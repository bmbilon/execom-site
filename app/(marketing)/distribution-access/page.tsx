import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { distributionAccess } from "@/lib/site/content/distributionAccess"

export const metadata: Metadata = {
  title: "Distribution Access | execom",
  description:
    "Distribution is where most companies actually fail. execom helps founders get to market through the right channels, with the right sequencing, economics, and commercial logic.",
}

export default function DistributionAccess() {
  return <AdvisoryPage data={distributionAccess} />
}
