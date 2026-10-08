// Public summaries distilled from project material reviewed with Brett's
// authorization. Source notes live in docs/case-study-sources.md.
// Keep commercial outcomes distinct from concepts, plans, and prototypes.
export type CaseStudyVisual = {
  src: string
  alt: string
  width: number
  height: number
  caption: string
  presentation?: "screen"
  previewOffset?: number
  fit?: "contain" | "cover"
  position?: string
  background?: string
}

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
  visual?: CaseStudyVisual
  gallery?: CaseStudyVisual[]
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
    visual: { src: "/showcase/fystro/fystro-dashboard.webp", alt: "Fystro dashboard showing inventory, sales, stock coverage, and committed allocations", width: 670, height: 1280, caption: "Fystro Insights dashboard. Supplied product screenshot.", presentation: "screen", previewOffset: -80, background: "#172324" },
    gallery: [{ src: "/showcase/fystro/fystro-navigation.webp", alt: "Fystro navigation connecting Insights, planning, forecasting, inventory, and Operations", width: 834, height: 1280, caption: "Insights and Operations in one workspace. Supplied product screenshot.", presentation: "screen" }],
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
    visual: { src: "/showcase/avcm/avcm-card.webp", alt: "AVCM's published fingerprint-enabled card concept", width: 1781, height: 2048, caption: "AVCM card concept. Published product visualization.", fit: "contain", background: "#142234" },
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
    visual: { src: "/showcase/vmcard/vmcard-voicemail-media.webp", alt: "VMCard product concept showing a phone voicemail inbox connected to a message with photo and video attachments", width: 1513, height: 1040, caption: "VMCard product concept: photo and video content connected to a phone voicemail. Illustrative interface with example content.", background: "#09223e" },
    gallery: [{ src: "/showcase/vmcard/vmcard-recipient.webp", alt: "VMCard demo recipient screen with sender identity, message context, voice playback, and contact actions", width: 390, height: 844, caption: "VMCard recipient experience, shown with a demo identity and example data.", presentation: "screen", background: "#11332f" }],
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
    visual: { src: "/showcase/tabem/tabem-render.webp", alt: "TABEM lint roller product render showing the handle and refill assembly", width: 1402, height: 874, caption: "Product render from the TABEM manufacturing package.", fit: "contain", background: "#f5f5f4" },
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
    visual: { src: "/showcase/sturdy-screens/sturdy-rv-door.webp", alt: "Sturdy Screens published RV doorway image with a dog looking through the screen toward a lake", width: 1254, height: 1254, caption: "Published brand imagery from the Sturdy Screens storefront.", position: "center 60%" },
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
    visual: { src: "/showcase/weathershield/weathershield-concept.webp", alt: "WeatherShield brand concepts showing the exterior and interior of a modular weather enclosure", width: 1800, height: 1013, caption: "Concept visualization from the WeatherShield brand presentation.", fit: "contain", background: "#eef0ee" },
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
    visual: { src: "/showcase/patch/patch-concept.webp", alt: "Patch concept render showing the branded case and product design", width: 1600, height: 1245, caption: "Product concept render from the Patch project asset library.", fit: "contain", background: "#9a9994" },
  },
]

export const HOME_CASE_STUDIES = CASE_STUDIES.filter((study) => study.homepage)

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug)
}
