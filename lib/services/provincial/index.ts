/**
 * Provincial calculation module — public API.
 */

export type {
  ProvinceCalcStrategy,
  ProvinceExpenditures,
  ProvinceCreditResult,
  ProvinceCreditLine,
  NoProgram,
  ProvinceRegistryEntry,
} from './types'

export { hasProgram, validateCreditResult } from './types'

export {
  PROVINCE_REGISTRY,
  ACTIVE_PROVINCE_CODES,
  NO_PROGRAM_CODES,
} from './registry'

// Individual adapters (for testing or direct use)
export { bcAdapter } from './adapters/bc'
export { skAdapter } from './adapters/sk'
export { mbAdapter } from './adapters/mb'
export { onAdapter } from './adapters/on'
export { qcAdapter } from './adapters/qc'
export { nbAdapter, nsAdapter, nlAdapter, ytAdapter } from './adapters/simple'
