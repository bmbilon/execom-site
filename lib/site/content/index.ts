import type { AdvisoryPageData } from "@/components/site/advisory/types"
import { about } from "./about"
import { accelerators } from "./accelerators"
import { distributionAccess } from "./distributionAccess"
import { grants } from "./grants"
import { marketEntry } from "./marketEntry"
import { nonDilutive } from "./nonDilutive"
import { prototyping } from "./prototyping"
import { sred } from "./sred"
import { vcAngel } from "./vcAngel"

export const ADVISORY_PAGES: AdvisoryPageData[] = [
  sred,
  nonDilutive,
  grants,
  vcAngel,
  accelerators,
  marketEntry,
  distributionAccess,
  prototyping,
  about,
]
