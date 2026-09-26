import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { about } from "@/lib/site/content/about"

export const metadata: Metadata = {
  title: "About | execom",
  description:
    "execom exists to help founders make structural decisions about capital, ownership, and growth deliberately, before the cost of getting them wrong compounds.",
}

export default function About() {
  return <AdvisoryPage data={about} />
}
