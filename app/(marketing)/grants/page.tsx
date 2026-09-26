import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { grants } from "@/lib/site/content/grants"

export const metadata: Metadata = {
  title: "Grants | execom",
  description:
    "Most founders should not build their funding strategy around grants. execom helps founders separate useful non-dilutive funding from slow, distracting grant-chasing, and prioritize SR&ED first.",
}

export default function Grants() {
  return <AdvisoryPage data={grants} />
}
