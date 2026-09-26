import type { Metadata } from "next"
import { AdvisoryPage } from "@/components/site/advisory/AdvisoryPage"
import { accelerators } from "@/lib/site/content/accelerators"

export const metadata: Metadata = {
  title: "Accelerators & Incubators | execom",
  description:
    "Most startups should not join an accelerator. execom helps founders understand when accelerators make sense, when they do not, and what founders usually need instead: speed, structure, execution, and capital discipline.",
  keywords:
    "startup accelerator, incubator, founder leverage, startup execution, company formation, accelerator alternatives, founder infrastructure | execom",
}

export default function AcceleratorsIncubators() {
  return <AdvisoryPage data={accelerators} />
}
