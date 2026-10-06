// Public summaries distilled from project material reviewed with Brett's
// authorization. Source notes live in docs/case-study-sources.md.
// Keep commercial outcomes distinct from concepts, plans, and prototypes.
export type CaseStudy = {
  slug: string
  name: string
  sector: string
  summary: string
  stage: string
  context: string
  work: string
  deliverable: string
  capabilities: string[]
  logo?: { src: string; alt: string }
  visual?: { src: string; alt: string }
  website?: { href: string; label: string }
  homepage?: boolean
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "fystro",
    name: "Fystro",
    sector: "Business operating software",
    summary: "A connected business workspace bringing receiving, inventory, purchasing, production planning, and communications into one operating system.",
    stage: "Software product development",
    context: "Stock, purchasing, production decisions, and business conversations often sit in separate systems. Fystro connects that work around a shared record, from the receiving table to the ledger.",
    work: "The product combines Fystro Operations and Fystro Insights with a common sign-in, an inventory ledger, planning tools, and search across authorized business records. Mobile receiving and the desktop workspace support different parts of the same operation.",
    deliverable: "An integrated software product with an operating workspace, inventory and purchasing flows, forecasting and production planning, and a read-only demonstration environment.",
    capabilities: ["Product architecture", "Software development", "Inventory & operations"],
    logo: { src: "/showcase/fystro/fystro-icon.png", alt: "Fystro app mark" },
    website: { href: "https://fystro.ca/welcome", label: "Explore Fystro" },
    homepage: true,
  },
  {
    slug: "avcm",
    name: "AVCM.io",
    sector: "Identity & age verification",
    summary: "A fingerprint-enabled age-verification card concept, supported by market research, company structure, brand development, and a partner-led route to market.",
    stage: "Commercialization planning",
    context: "AVCM began with a fingerprint-enabled card for age-restricted purchases. Commercializing the idea required a clear first buyer, a trusted source of age information, and a workable relationship between card issuers, retailers, and technology partners.",
    work: "execom brought together market research, business planning, brand materials, Canadian and U.S. company records, and outreach organized by buyer group. The commercialization work examined privacy, integration, pricing, and the requirements for a focused partner trial.",
    deliverable: "A body of research, company-building materials, and partner-testing tools that makes the next investment decision concrete. Buyer validation and pilot development remain the next stage.",
    capabilities: ["Concept validation", "Company structure", "Partner strategy"],
    logo: { src: "/showcase/avcm/avcm-mark.png", alt: "AVCM brand mark" },
    visual: { src: "/showcase/avcm/avcm-card.webp", alt: "AVCM's published fingerprint-enabled card concept" },
    homepage: true,
  },
  {
    slug: "vmcard",
    name: "VMCard",
    sector: "Professional communications",
    summary: "A professional voice-card app combining sender identity, written context, optional voice or video, and clear follow-up actions. Useful context before playback.",
    stage: "MVP development",
    context: "A voice message becomes more useful when the recipient can see who sent it, why it matters, and how to respond. VMCard brings that context into an app-owned professional message card.",
    work: "Development covers the product experience from enrollment and professional profiles through Inbox, Compose, Sent, and recipient detail. The flow pairs sender-authored context with optional recordings, a review-before-send step, prior-card history, and contact actions.",
    deliverable: "A working MVP codebase and an interactive product walkthrough for reviewing the sender and recipient journeys. Hosted release and device validation continue as part of the development process.",
    capabilities: ["Product design", "Mobile & web development", "MVP delivery"],
    logo: { src: "/showcase/vmcard/vmcard-icon.png", alt: "VMCard app mark" },
    website: { href: "https://vmcard-app.vercel.app/preview", label: "Explore the product preview" },
    homepage: true,
  },
  {
    slug: "tabem",
    name: "TABEM by BUQUOR",
    sector: "Consumer product sourcing",
    summary: "A reusable lint roller sourcing programme connecting an injection-moulded handle, paperboard refill core, and adhesive roll with an international supplier network.",
    stage: "Supplier-sourcing handover",
    context: "A simple consumer product can depend on several different manufacturing capabilities. TABEM needed its handle, refill core, and adhesive roll considered together, including assembly, packaging, and delivery requirements.",
    work: "The sourcing programme covered supplier identification, technical qualification, confidentiality workflows, quote collection, and comparison of shipping terms. Component specialists and potential assembly partners were assessed against the same product requirements.",
    deliverable: "A completed sourcing handover containing supplier options, pricing records, specifications, recommendations, and the remaining assembly and packaging questions for the client to resolve with manufacturers.",
    capabilities: ["Manufacturer sourcing", "Supplier qualification", "Production planning"],
  },
  {
    slug: "sturdy-screens",
    name: "Sturdy Screens",
    sector: "Camper screen doors",
    summary: "A camper screen-door project connecting product development with an online storefront, product merchandising, and the next steps toward manufacturing.",
    stage: "Storefront & product development",
    context: "A physical product needs a clear buying experience as well as a path through prototyping and manufacturing. Sturdy Screens brought those two sides of commercialization into the same programme.",
    work: "The work included storefront development and product merchandising, with related-product and recently viewed features documented on the site. Project planning connected that customer experience with concept validation, prototype work, and manufacturing preparation.",
    deliverable: "A developed storefront and a coordinated product-development record, with the remaining business setup, prototype, and manufacturing decisions identified for the next phase.",
    capabilities: ["E-commerce", "Product merchandising", "Development planning"],
  },
  {
    slug: "weathershield",
    name: "WeatherShield",
    sector: "Modular weather protection",
    summary: "A weather-protection concept supported by brand identity, website direction, and a phased plan for engineering, prototyping, and manufacturing documentation.",
    stage: "Brand & engineering plan",
    context: "WeatherShield needed its customer-facing identity and physical product direction to develop together. Modularity, fastening, material choices, and performance in harsh weather all shape the engineering brief.",
    work: "Brand and website materials established the presentation of the concept. The engineering plan set out concept alternatives, parametric CAD, a bill of materials, structural analysis, a scaled prototype, and a final manufacturing package.",
    deliverable: "Brand and website direction alongside a defined development sequence, with clear deliverables for each engineering and prototype stage.",
    capabilities: ["Brand development", "Engineering scoping", "Prototype planning"],
  },
  {
    slug: "patch",
    name: "Patch",
    sector: "E-cigarette product development",
    summary: "Product visualization and digital foundations for an e-cigarette concept, connecting a 3D asset library, an existing brand identity, and a gated website build.",
    stage: "Foundation build scoped",
    context: "Patch needed a coherent way to present an early product concept while its physical design and digital presence developed. The assignment connected product visualization, brand application, and website architecture in a single foundation-build scope.",
    work: "The agreed scope brings together detailed 3D product views, packaging visualization, a seven-page website, and the supporting domain and hosting setup. A password-gated opening page separates development and review from a public release.",
    deliverable: "A foundation-build plan that coordinates the visual asset library, site structure, brand system, and infrastructure, with review behind a password gate before public release.",
    capabilities: ["3D product visualization", "Brand application", "Web development"],
  },
]

export const HOME_CASE_STUDIES = CASE_STUDIES.filter((study) => study.homepage)

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug)
}
