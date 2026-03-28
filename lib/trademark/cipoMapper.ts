/**
 * CIPO (Canadian Intellectual Property Office) Application Mapper
 *
 * Transforms an approved TrademarkIntake snapshot into a normalized
 * CIPO filing-ready payload. This payload can later drive:
 *   - PDF form filling for the Canadian TM application
 *   - API integration if CIPO ever offers electronic filing APIs
 *   - Internal filing summary document generation
 *
 * Reference: Canadian Trademarks Act (R.S.C., 1985, c. T-13)
 */

import type { TrademarkIntake, GoodsServicesItem } from '@/lib/corp-setup/schema'
import { deriveFilingBasis } from '@/lib/corp-setup/schema'

// ═══════════════════════════════════════════════════════════════
// CIPO filing payload shape
// ═══════════════════════════════════════════════════════════════

export interface CIPOFilingPayload {
  // Application metadata
  filing_type: 'new_application'
  jurisdiction: 'Canada'

  // Mark information
  mark: {
    text: string
    type: 'standard_character' | 'design' | 'sound' | 'other'
    description?: string
    image_reference?: string
  }

  // Applicant (CIPO terminology)
  applicant: {
    name: string
    entity_type: string
    country_of_incorporation?: string
    address: {
      full: string
      country: string
    }
    correspondence_address?: {
      full: string
      country: string
    }
  }

  // Goods and services — grouped by Nice class
  goods_services: {
    nice_class: string
    items: {
      description: string
      category: 'goods' | 'services'
    }[]
  }[]

  // Filing basis
  filing_basis: {
    type: 'use' | 'proposed_use' | 'priority'
    use_in_canada_date?: string
    priority?: {
      country: string
      filing_date: string
      application_number: string
    }
  }

  // Fees estimate
  fee_estimate: {
    base_fee: number
    per_class_fee: number
    total_classes: number
    estimated_total: number
    currency: 'CAD'
  }
}

// ═══════════════════════════════════════════════════════════════
// Mapper
// ═══════════════════════════════════════════════════════════════

/** Map mark_type from internal → CIPO terminology */
function mapMarkType(markType: string): CIPOFilingPayload['mark']['type'] {
  switch (markType) {
    case 'word':
    case 'slogan':
      return 'standard_character'
    case 'design':
    case 'combined':
      return 'design'
    case 'sound':
      return 'sound'
    default:
      return 'other'
  }
}

/** Group goods/services items by Nice class */
function groupByNiceClass(items: GoodsServicesItem[]): CIPOFilingPayload['goods_services'] {
  const groups: Record<string, { description: string; category: 'goods' | 'services' }[]> = {}

  for (const item of items) {
    const cls = item.nice_class?.trim() || 'TBD'
    if (!groups[cls]) groups[cls] = []
    groups[cls].push({
      description: item.description,
      category: item.category,
    })
  }

  return Object.entries(groups).map(([nice_class, groupItems]) => ({
    nice_class,
    items: groupItems,
  }))
}

/** Build CIPO filing payload from trademark intake */
export function buildCIPOPayload(intake: TrademarkIntake): CIPOFilingPayload {
  const basis = deriveFilingBasis(intake)
  const groupedGS = groupByNiceClass(intake.goods_services_items || [])
  const totalClasses = groupedGS.length

  // CIPO fee schedule (2024 rates — update as needed)
  const BASE_FEE = 347.35  // first class
  const PER_CLASS_FEE = 105.26 // each additional class
  const additionalClasses = Math.max(0, totalClasses - 1)

  const filingBasis: CIPOFilingPayload['filing_basis'] = {
    type: (basis.ca as any) || 'proposed_use',
  }
  if (intake.already_in_use && intake.first_use_date) {
    filingBasis.use_in_canada_date = intake.first_use_date
  }
  if (intake.priority_claim && intake.priority_country && intake.priority_date) {
    filingBasis.type = 'priority'
    filingBasis.priority = {
      country: intake.priority_country,
      filing_date: intake.priority_date,
      application_number: intake.priority_app_number || '',
    }
  }

  return {
    filing_type: 'new_application',
    jurisdiction: 'Canada',

    mark: {
      text: intake.mark_text,
      type: mapMarkType(intake.mark_type),
      description: intake.mark_description || undefined,
      image_reference: intake.mark_image_path || undefined,
    },

    applicant: {
      name: intake.owner_name,
      entity_type: intake.owner_type,
      country_of_incorporation: intake.owner_country,
      address: {
        full: intake.owner_address || '',
        country: intake.owner_country,
      },
    },

    goods_services: groupedGS,

    filing_basis: filingBasis,

    fee_estimate: {
      base_fee: BASE_FEE,
      per_class_fee: PER_CLASS_FEE,
      total_classes: totalClasses,
      estimated_total: Math.round((BASE_FEE + additionalClasses * PER_CLASS_FEE) * 100) / 100,
      currency: 'CAD',
    },
  }
}
