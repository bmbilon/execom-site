import { SERVICES, SERVICE_CATEGORIES, serviceHref } from "./services"

// Single source of truth for marketing navigation: header mega menu,
// mobile drawer, footer, breadcrumbs, related-page rails and the
// command palette all read from here.

export type NavLink = {
  label: string
  href?: string // omitted when the page is not live yet
  description: string
  soon?: boolean
  keywords?: string[]
}

export type NavGroup = {
  key: string
  label: string
  thesis: string
  items: NavLink[]
  feature: {
    eyebrow: string
    title: string
    text: string
    cta: { label: string; href: string }
  }
}

export const NAV_GROUPS: NavGroup[] = SERVICE_CATEGORIES.map((category) => ({
  key: category.key,
  label: category.label,
  thesis: category.description,
  items: SERVICES.filter((service) => service.category === category.key).map((service) => ({
    label: service.title,
    href: serviceHref(service),
    description: service.summary,
    keywords: service.keywords.split(" "),
  })),
  feature: {
    eyebrow: "Turnkey services",
    title: "Scope your next step.",
    text: "Start with one service or combine them into a single engagement, scoped to your product and stage.",
    cta: { label: "Explore this area", href: `/services?category=${category.key}` },
  },
}))

export const PRIMARY_LINKS: NavLink[] = [
  { label: "Executive AI", href: "/executive-ai", description: "One process, a working AI system, and the skills to operate it." },
  { label: "Case studies", href: "/case-studies", description: "Explore selected project work." },
  { label: "About", href: "/about", description: "Why execom exists and how it works." },
]

export const COMPANY_LINKS: NavLink[] = [
  { label: "Case studies", href: "/case-studies", description: "Selected project work across products, software, and commercialization.", keywords: ["portfolio", "projects", "work"] },
  { label: "Executive AI Practicum", href: "/executive-ai", description: "A ten-week employer-project practicum with Brett Bilon.", keywords: ["executive", "AI", "practicum", "training", "employer"] },
  { label: "About", href: "/about", description: "Why execom exists and how it works." },
  { label: "Engage", href: "/engage", description: "How engagements are scoped." },
  { label: "Contact", href: "/contact", description: "Reach execom directly." },
  { label: "Customer support", href: "/support", description: "Help with payments, orders, and access." },
]

export const ACCOUNT_LINKS: NavLink[] = [
  { label: "Client Portal", href: "/portal/login", description: "Sign in to your matters and filings." },
  { label: "Matters", href: "/portal/matters", description: "Open matters and tasks." },
]

/** Every live marketing page, flattened, for lookups by href. */
export const PAGES: (NavLink & { group?: string })[] = [
  { label: "Home", href: "/", description: "Commercialization from concept to cash flow." },
  { label: "All services", href: "/services", description: "Find services by task, product, or stage." },
  { label: "Prototype readiness", href: "/prototyping", description: "Assess the next physical product decision." },
  ...NAV_GROUPS.flatMap((g) =>
    g.items.filter((i) => i.href).map((i) => ({ ...i, group: g.label })),
  ),
  ...COMPANY_LINKS,
]

export function findPage(href: string) {
  return PAGES.find((p) => p.href === href)
}

export function groupForHref(href: string): NavGroup | undefined {
  return NAV_GROUPS.find((g) => g.items.some((i) => i.href === href))
}

/** Related pages for the "Where to next" rail. */
export const RELATED: Record<string, string[]> = {
  "/sred": ["/non-dilutive-capital", "/grants", "/vc-angel-capital"],
  "/non-dilutive-capital": ["/sred", "/grants", "/vc-angel-capital"],
  "/grants": ["/sred", "/non-dilutive-capital", "/accelerators-incubators"],
  "/vc-angel-capital": ["/non-dilutive-capital", "/accelerators-incubators", "/sred"],
  "/accelerators-incubators": ["/vc-angel-capital", "/non-dilutive-capital", "/engage"],
  "/prototyping": ["/industrial-design", "/market-entry", "/sred"],
  "/industrial-design": ["/prototyping", "/distribution-access", "/sred"],
  "/market-entry": ["/distribution-access", "/vc-angel-capital", "/prototyping"],
  "/distribution-access": ["/market-entry", "/prototyping", "/non-dilutive-capital"],
  "/about": ["/engage", "/sred", "/non-dilutive-capital"],
  "/engage": ["/about", "/sred", "/prototyping"],
  "/contact": ["/engage", "/about", "/support"],
}

export type SearchEntry = {
  title: string
  href: string
  section?: string
  group?: string
  hint?: string
  keywords?: string
}
