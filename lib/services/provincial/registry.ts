/**
 * Province registry — maps province codes to their calculation adapters.
 * Import this to look up any province by code and run its calculation.
 */

import type {
  ProvinceRegistryEntry,
  NoProgram,
} from './types'
import { bcAdapter } from './adapters/bc'
import { skAdapter } from './adapters/sk'
import { mbAdapter } from './adapters/mb'
import { onAdapter } from './adapters/on'
import { qcAdapter } from './adapters/qc'
import { nbAdapter, nsAdapter, nlAdapter, ytAdapter } from './adapters/simple'

// ── No-program gates ──

const peGate: NoProgram = {
  provinceCode: 'PE',
  provinceName: 'Prince Edward Island',
  hasProgram: false,
}

const ntGate: NoProgram = {
  provinceCode: 'NT',
  provinceName: 'Northwest Territories',
  hasProgram: false,
}

const nuGate: NoProgram = {
  provinceCode: 'NU',
  provinceName: 'Nunavut',
  hasProgram: false,
}

// ── Registry ──

export const PROVINCE_REGISTRY: Record<string, ProvinceRegistryEntry> = {
  // Alberta is handled by the existing IEG adapter in provincialCalcService;
  // it's not in this registry because it predates the strategy pattern.
  // It will be migrated in a future pass.
  BC: bcAdapter,
  SK: skAdapter,
  MB: mbAdapter,
  ON: onAdapter,
  QC: qcAdapter,
  NB: nbAdapter,
  NS: nsAdapter,
  NL: nlAdapter,
  YT: ytAdapter,
  PE: peGate,
  NT: ntGate,
  NU: nuGate,
}

/**
 * All province codes that have an active SR&ED program.
 * Includes Alberta (handled separately) for completeness.
 */
export const ACTIVE_PROVINCE_CODES = [
  'AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'NL', 'YT',
] as const

/**
 * Province codes with no SR&ED program.
 */
export const NO_PROGRAM_CODES = ['PE', 'NT', 'NU'] as const
