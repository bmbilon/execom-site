import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { nonDilutive } from "@/lib/site/content/nonDilutive"

export const metadata: Metadata = {
  title: "Non-Dilutive Capital | execom",
  description:
    "Non-dilutive capital is not a niche alternative. For many founders it is the smarter first layer of the capital stack. execom helps founders build capital strategies that preserve ownership, control, and leverage.",
}

export default function NonDilutiveCapital() {
  return <AdvisoryPage data={nonDilutive} />
}
