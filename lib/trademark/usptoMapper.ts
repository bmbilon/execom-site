/**
 * USPTO (United States Patent and Trademark Office) Application Mapper
 *
 * Transforms an approved TrademarkIntake snapshot into a normalized
 * USPTO filing-ready payload. This payload can later drive:
 *   - TEAS (Trademark Electronic Application System) form filling
 *   - Internal filing summary document generation
 *   - API integration with USPTO systems
 *
 * Reference: 15 U.S.C. §§ 1051-1072 (Lanham Act)
 */

import type { TrademarkIntake, GoodsServicesItem } from '@/lib/corp-setup/schema'
import { deriveFilingBasis } from '@/lib/corp-setup/schema'

// ═══════════════════════════════════════════════════════════════
// USPTO filing payload shape
// ═══════════════════════════════════════════════════════════════

export type USPTOFilingBasisCode = '1(a)' | '1(b)' | '44(d)' | '44(e)'

export interface USPTOFilingPayload {
  // Application metadata
  filing_type: 'new_application'
  form: 'TEAS_Plus' | 'TEAS_Standard'
  jurisdiction: 'United States'

  // Mark information
  mark: {
    text: string
    type: 'standard_character' | 'special_form' | 'sound'
    description?: string
    color_claim?: string
    design_search_codes?: string[]
    image_reference?: string
    literal_elements?: string
  }

  // Owner (USPTO terminology)
  owner: {
    name: string
    entity_type: 'corporation' | 'individual' | 'partnership' | 'llc' | 'other'
    state_or_country_of_incorporation?: string
    citizenship?: string
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    email?: string
  }

  // Goods and services — per class
  classes: {
    class_number: string
    goods_or_services: 'goods' | 'services'
    identification: string
    filing_basis: USPTOFilingBasisCode
    // Section 1(a) — use in commerce
    first_use_anywhere?: string
    first_use_in_commerce?: string
    specimen_description?: string
    // Section 1(b) — intent to use
    // (no additional fields needed at filing)
    // Section 44(d) — foreign priority
    foreign_application?: {
      country: string
      filing_date: string
      application_number: string
    }
  }[]

  // Attorney info (placeholder)
  attorney?: {
    name?: string
    bar_membership?: string
    firm?: string
    email?: string
  }

  // Fee estimate
  fee_estimate: {
    per_class_fee: number
    total_classes: number
    estimated_total: number
    currency: 'USD'
  }
}

// ═══════════════════════════════════════════════════════════════
// Mapper
// ═══════════════════════════════════════════════════════════════

/** Map internal mark_type → USPTO terminology */
function mapMarkType(markType: string): USPTOFilingPayload['mark']['type'] {
  switch (markType) {
    case 'word':
    case 'slogan':
      return 'standard_character'
    case 'design':
    case 'combined':
      return 'special_form'
    case 'sound':
      return 'sound'
    default:
      return 'standard_character'
  }
}

/** Map entity type to USPTO format */
function mapEntityType(ownerType: string): USPTOFilingPayload['owner']['entity_type'] {
  switch (ownerType) {
    case 'corporation': return 'corporation'
    case 'individual': return 'individual'
    case 'partnership': return 'partnership'
    default: return 'other'
  }
}

/** Determine filing basis code per the Lanham Act */
function determineFilingBasis(intake: TrademarkIntake): USPTOFilingBasisCode {
  if (intake.priority_claim && intake.priority_country && intake.priority_date) {
    return '44(d)' // Foreign priority
  }
  if (intake.already_in_use && intake.first_use_commerce) {
    return '1(a)' // Use in commerce
  }
  return '1(b)' // Intent to use
}

/** Parse a simple address string into structured parts (best-effort) */
function parseAddress(full: string): USPTOFilingPayload['owner']['address'] {
  // Best-effort parsing — admin can clean up during review
  const parts = full.split(',').map((p) => p.trim())
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    zip: parts[3] || '',
    country: 'US',
  }
}

/** Group items by Nice class and build per-class entries */
function buildClasses(
  items: GoodsServicesItem[],
  filingBasis: USPTOFilingBasisCode,
  intake: TrademarkIntake
): USPTOFilingPayload['classes'] {
  const groups: Record<string, GoodsServicesItem[]> = {}

  for (const item of items) {
    const cls = item.nice_class?.trim() || 'TBD'
    if (!groups[cls]) groups[cls] = []
    groups[cls].push(item)
  }

  return Object.entries(groups).map(([classNumber, groupItems]) => {
    const entry: USPTOFilingPayload['classes'][0] = {
      class_number: classNumber,
      goods_or_services: groupItems[0]?.category || 'goods',
      identification: groupItems.map((g) => g.description).join('; '),
      filing_basis: filingBasis,
    }

    // Section 1(a) fields
    if (filingBasis === '1(a)') {
      entry.first_use_anywhere = intake.first_use_date || undefined
      entry.first_use_in_commerce = intake.first_use_commerce || undefined
      entry.specimen_description = 'Specimen to be provided'
    }

    // Section 44(d) fields
    if (filingBasis === '44(d)' && intake.priority_claim) {
      entry.foreign_application = {
        country: intake.priority_country || '',
        filing_date: intake.priority_date || '',
        application_number: intake.priority_app_number || '',
      }
    }

    return entry
  })
}

/** Build USPTO filing payload from trademark intake */
export function buildUSPTOPayload(intake: TrademarkIntake): USPTOFilingPayload {
  const filingBasis = determineFilingBasis(intake)
  const classes = buildClasses(intake.goods_services_items || [], filingBasis, intake)
  const totalClasses = classes.length

  // USPTO TEAS Plus fee (2024 rates — update as needed)
  const PER_CLASS_FEE = 250 // TEAS Plus
  const form: USPTOFilingPayload['form'] = 'TEAS_Plus'

  const ownerAddress = parseAddress(intake.owner_address || '')
  if (intake.owner_country === 'Canada' || intake.owner_country !== 'United States') {
    ownerAddress.country = intake.owner_country
  }

  return {
    filing_type: 'new_application',
    form,
    jurisdiction: 'United States',

    mark: {
      text: intake.mark_text,
      type: mapMarkType(intake.mark_type),
      description: intake.mark_description || undefined,
      image_reference: intake.mark_image_path || undefined,
      literal_elements: intake.mark_type === 'combined' ? intake.mark_text : undefined,
    },

    owner: {
      name: intake.owner_name,
      entity_type: mapEntityType(intake.owner_type),
      state_or_country_of_incorporation: intake.owner_country,
      address: ownerAddress,
    },

    classes,

    fee_estimate: {
      per_class_fee: PER_CLASS_FEE,
      total_classes: totalClasses,
      estimated_total: PER_CLASS_FEE * totalClasses,
      currency: 'USD',
    },
  }
}
