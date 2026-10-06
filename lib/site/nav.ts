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

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "funding",
    label: "Funding & SR&ED",
    thesis: "Put non-dilutive capital first. Raise equity when the math supports it.",
    items: [
      {
        label: "SR&ED",
        href: "/sred",
        description: "Claims prepared in the portal for 5% of the credit, not 15–30%.",
        keywords: ["tax credit", "cra", "t661", "research", "claim"],
      },
      {
        label: "Non-Dilutive Capital",
        href: "/non-dilutive-capital",
        description: "Build the first layer of the capital stack without giving up equity.",
        keywords: ["funding", "capital stack", "equity", "dilution"],
      },
      {
        label: "Grants",
        href: "/grants",
        description: "Separate useful funding from slow, distracting grant-chasing.",
        keywords: ["irap", "government funding", "programs"],
      },
      {
        label: "VC / Angel Capital",
        href: "/vc-angel-capital",
        description: "Understand the math and the terms before you raise.",
        keywords: ["venture", "investors", "raise", "term sheet", "angel"],
      },
      {
        label: "Accelerators & Incubators",
        href: "/accelerators-incubators",
        description: "Judge whether a program is worth the equity it asks for.",
        keywords: ["accelerator", "incubator", "cohort", "program"],
      },
    ],
    feature: {
      eyebrow: "In the portal",
      title: "SR&ED at 5%",
      text: "Prepare claims in the format CRA expects, directly in the execom portal.",
      cta: { label: "Explore SR&ED", href: "/sred" },
    },
  },
  {
    key: "product",
    label: "Product Development",
    thesis: "Pressure-test the product before you pay to build it.",
    items: [
      {
        label: "Prototyping",
        href: "/prototyping",
        description: "A readiness assessment before you spend on prototypes and tooling.",
        keywords: ["prototype", "product", "manufacturing", "assessment"],
      },
      {
        label: "Industrial Design",
        href: "/industrial-design",
        description: "Production-ready design, BOMs, and CAD packages.",
        keywords: ["cad", "design", "patent figures", "bom"],
      },
      { label: "Software Development", description: "Product builds scoped to the business case.", soon: true },
      { label: "Web Development", description: "Sites and storefronts that support the sale.", soon: true },
      { label: "Manufacturer Sourcing", description: "Supplier shortlists, quotes, and qualification.", soon: true },
    ],
    feature: {
      eyebrow: "Assessment",
      title: "Prototype readiness",
      text: "Six short sections, about 20–30 minutes. Reviewed within two business days.",
      cta: { label: "Start the assessment", href: "/portal/prototype-readiness" },
    },
  },
  {
    key: "market",
    label: "Market Entry",
    thesis: "Sequence markets and positioning before you spend on them.",
    items: [
      {
        label: "Market Entry",
        href: "/market-entry",
        description: "Enter Canada or the US with sharper sequencing and channel strategy.",
        keywords: ["expansion", "canada", "united states", "us market"],
      },
      { label: "Business Planning", description: "Operating plans built around the numbers.", soon: true },
      { label: "Go To Market Strategy", description: "Positioning, pricing, and launch sequencing.", soon: true },
      { label: "Branding & Identity", description: "Names, marks, and systems that hold up.", soon: true },
      { label: "Trademarks", description: "Canadian and US applications through a guided workflow.", soon: true },
    ],
    feature: {
      eyebrow: "In the portal",
      title: "Company setup",
      text: "Incorporation, trademark filing, and corporate records through one structured intake.",
      cta: { label: "Access the portal", href: "/portal/login" },
    },
  },
  {
    key: "distribution",
    label: "Distribution",
    thesis: "Channels, sequencing, and economics that hold up in market.",
    items: [
      {
        label: "Distribution Access",
        href: "/distribution-access",
        description: "Reach market through the right channels, in the right order.",
        keywords: ["channels", "retail", "wholesale", "partners", "sales"],
      },
      { label: "Customer Acquisition", description: "Acquisition economics before spend.", soon: true },
      { label: "B2B Selling", description: "Enterprise and channel sales motions.", soon: true },
    ],
    feature: {
      eyebrow: "Analysis",
      title: "Where most companies fail",
      text: "Channel choice, sequencing, and margin structure decide more outcomes than product.",
      cta: { label: "Read the analysis", href: "/distribution-access" },
    },
  },
]

export const PRIMARY_LINKS: NavLink[] = [
  { label: "Executive AI", href: "/executive-ai", description: "One process, a working AI system, and the skills to operate it." },
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
