export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/sr\s*&?\s*ed/g, "sred").replace(/[^a-z0-9]+/g, " ").trim()
}
