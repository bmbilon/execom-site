import { normalizeSearch } from "./searchText"

export type ServiceCategory = { key: string; label: string; description: string }
export type Service = {
  slug: string
  title: string
  category: string
  summary: string
  scope: string
  deliverables: string[]
  inputs: string
  keywords: string
  href?: string
  cases?: string[]
  links?: { label: string; href: string }[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: "prototyping", label: "Concept & prototyping", description: "Validate the idea, make it tangible, and test the next important assumption." },
  { key: "physical", label: "Design & manufacturing", description: "Connect product design, engineering documentation, and the supply chain." },
  { key: "digital", label: "Websites & apps", description: "Build the customer experience and the software behind the business." },
  { key: "creative", label: "Brand & content", description: "Give the product a clear identity and the assets to explain it." },
  { key: "compliance", label: "Company & compliance", description: "Coordinate company setup, IP workflows, and market requirements." },
  { key: "funding", label: "Funding & SR&ED", description: "Connect eligible work with funding, evidence, and the right capital sequence." },
  { key: "growth", label: "Marketing & sales", description: "Plan market entry, reach buyers, and measure what produces a sale." },
]

export const SERVICES: Service[] = [
  {
    slug: "concept-validation", title: "Concept validation", category: "prototyping",
    summary: "Test the buyer, the problem, and the commercial case before committing to a build.",
    scope: "We turn an idea into a set of testable assumptions about demand, pricing, channels, and delivery. Research and buyer feedback inform a defined next step and the conditions for moving forward.",
    deliverables: ["Buyer and problem definition", "Market and competitor review", "Assumptions, evidence, and next-step recommendation"], inputs: "Bring the concept, any existing research, and the buyer you have in mind.", keywords: "idea validation feasibility market research customer discovery demand", cases: ["avcm"],
  },
  {
    slug: "physical-prototyping", title: "Physical prototyping", category: "prototyping",
    summary: "Turn a physical product concept into something you can inspect, handle, and test.",
    scope: "The prototype is scoped around the question it needs to answer: fit, form, function, assembly, or user experience. Design files, material choices, fabrication, and iteration are coordinated before committing to production tooling.",
    deliverables: ["Prototype brief and readiness assessment", "CAD and fabrication specifications", "Prototype iteration and evaluation plan"], inputs: "Bring sketches, dimensions, reference products, and what the prototype must demonstrate.", keywords: "prototype prototypes physical hardware product 3d printing fabrication proof model", cases: ["tabem", "sturdy-screens", "weathershield"], links: [{ label: "Prototype readiness", href: "/prototyping" }],
  },
  {
    slug: "digital-prototyping", title: "Digital prototyping", category: "prototyping",
    summary: "Make an app, website, or workflow testable before building the full product.",
    scope: "We map the core journey, design the screens, and connect the interactions needed to evaluate it. The result can be a clickable prototype or a working software slice, depending on whether the next question concerns usability or technical feasibility.",
    deliverables: ["User journeys and screen flows", "Clickable interface or working software prototype", "Feedback, priorities, and MVP build scope"], inputs: "Bring the intended users, the task they need to complete, and any existing screens or requirements.", keywords: "prototype prototypes digital software interactive clickable UX UI wireframe MVP mockup figma", cases: ["vmcard", "fystro"],
  },
  {
    slug: "proof-of-concept", title: "Proof of concept", category: "prototyping",
    summary: "Isolate the technical or commercial assumption that needs to work first.",
    scope: "A proof of concept answers a bounded question. We define the test, the evidence required, and a focused implementation so the next investment decision rests on an observed result.",
    deliverables: ["Test question and acceptance criteria", "Focused technical or commercial experiment", "Findings and next-build recommendation"], inputs: "Bring the uncertain assumption, relevant constraints, and the decision the evidence must support.", keywords: "poc proof of concept feasibility test experiment validation prototype", cases: ["avcm", "vmcard"],
  },
  {
    slug: "pilots", title: "Pilots & field trials", category: "prototyping",
    summary: "Scope a limited deployment with real users, partners, or operating conditions.",
    scope: "We connect the pilot's users, operating process, measurement, and responsibilities. The scope defines what will be learned, how issues will be handled, and which results justify the next phase.",
    deliverables: ["Pilot scope, participants, and operating plan", "Success measures and feedback process", "Evaluation and rollout decision framework"], inputs: "Bring the current product, intended pilot partner, and the outcomes you need to test.", keywords: "pilot pilots field trial trials beta user testing test deployment validation", cases: ["avcm"],
  },
  {
    slug: "industrial-design", title: "Industrial design", category: "physical", href: "/industrial-design",
    summary: "Product form, CAD, materials, and production documentation developed together.", scope: "Develop the product around use, assembly, and manufacturing requirements.", deliverables: ["CAD and product design", "Material and assembly decisions", "Production documentation"], inputs: "Bring the product brief and existing design files.", keywords: "cad engineering design physical product industrial materials", cases: ["tabem", "weathershield"],
  },
  {
    slug: "hardware-development", title: "Hardware & connected products", category: "physical",
    summary: "Coordinate the enclosure, electronics, sensing, and software experience of a connected product.",
    scope: "Connected products need their physical and digital decisions to agree. We scope the system, interfaces, prototype stages, and specialist engineering work around the user experience and manufacturing constraints.",
    deliverables: ["System and component requirements", "Hardware, enclosure, and app coordination", "Integration and prototype test plan"], inputs: "Bring the intended function, sensing or connectivity needs, and size or power constraints.", keywords: "hardware electronics firmware iot wearable sensors connected device bluetooth enclosure", links: [{label:"Connected product examples",href:"/#work"}],
  },
  {
    slug: "manufacturer-sourcing", title: "Manufacturer sourcing", category: "physical",
    summary: "Find and qualify suppliers against the product, assembly, and delivery requirements.",
    scope: "We organize the specifications, identify relevant manufacturers, and compare responses on a consistent basis. Component capabilities, assembly responsibility, quantities, samples, and shipping terms are considered together.",
    deliverables: ["Supplier brief and sourcing shortlist", "Technical qualification and quote comparison", "Sampling and supplier handover plan"], inputs: "Bring the design package, target quantities, market, and unit-cost goals.", keywords: "manufacturing sourcing supplier suppliers factory factories procurement international supply chain quotes", cases: ["tabem"],
  },
  {
    slug: "manufacturing-packages", title: "Technical & manufacturing packages", category: "physical",
    summary: "Give suppliers the shared specifications they need to evaluate, quote, and build.",
    scope: "We bring drawings, part geometry, materials, tolerances, and assembly information into a coherent handover. The package is tailored to the product's maturity and the next manufacturing decision.",
    deliverables: ["Technical drawings and CAD handover", "Bill of materials and component specifications", "Assembly notes and revision control"], inputs: "Bring the latest design files, prototype findings, and known supplier requirements.", keywords: "tech pack techpack technical drawings bom bill materials production specifications CAD STEP", cases: ["tabem"],
  },
  {
    slug: "websites-ecommerce", title: "Websites & e-commerce", category: "digital",
    summary: "Marketing sites, landing pages, and storefronts built around a clear customer action.",
    scope: "We connect page structure, content, brand assets, and site implementation. Projects can include Shopify storefronts, lead-generation pages, product showcases, gated previews, and the analytics needed to understand the visitor journey.",
    deliverables: ["Site architecture, page design, and content integration", "Responsive website or e-commerce storefront", "Domain, launch, and measurement setup"], inputs: "Bring the audience, primary conversion goal, current site, and available brand material.", keywords: "website websites web development design ecommerce e commerce shopify online store storefront landing page checkout CMS", cases: ["sturdy-screens", "patch"],
  },
  {
    slug: "apps", title: "Mobile & web apps", category: "digital",
    summary: "Design and build the core product journey across mobile and browser experiences.",
    scope: "From enrollment and account access to the main user task, we scope a build around a useful first release. Interface design, application logic, data, permissions, and testing are developed as one product.",
    deliverables: ["Product requirements and interaction design", "Mobile app, web app, or coordinated MVP", "Release preparation and device testing plan"], inputs: "Bring the user journey, target platforms, and the smallest useful version of the product.", keywords: "app apps application applications ios android mobile web saas MVP software development", cases: ["vmcard", "fystro"],
  },
  {
    slug: "business-software", title: "Business software & portals", category: "digital",
    summary: "Custom operating tools that connect records, people, and repeatable work.",
    scope: "We map the operating process and build a workspace around the records and decisions that matter. Projects can include client portals, intake, inventory, purchasing, reporting, and role-based access.",
    deliverables: ["Workflow and data model", "Operating workspace or client portal", "Reporting, access controls, and handover"], inputs: "Bring the current workflow, source systems, and the steps that consume the most time.", keywords: "software portal portals dashboard dashboards ERP CRM inventory operations internal tools database", cases: ["fystro"],
  },
  {
    slug: "ai-automation", title: "AI & workflow automation", category: "digital",
    summary: "Apply AI and automation to a defined business task with review and measurable outputs.",
    scope: "We start with the task and the source material, then define where automation helps and where human judgment remains necessary. Implementation includes the workflow, access boundaries, output checks, and an operating handover.",
    deliverables: ["Use-case assessment and workflow design", "AI-assisted process or automated workflow", "Evaluation criteria and review controls"], inputs: "Bring the repetitive task, representative inputs, and what a correct output looks like.", keywords: "AI artificial intelligence automation agent agents LLM workflow productivity integration", cases: ["fystro"],
  },
  {
    slug: "integrations", title: "Systems & API integrations", category: "digital",
    summary: "Connect business systems so records move through a usable, traceable workflow.",
    scope: "We define the source of truth, field mapping, access requirements, and failure handling before connecting systems. The scope can cover storefronts, business databases, payment workflows, communications, and reporting.",
    deliverables: ["Integration map and data contract", "API connection or synchronization workflow", "Error handling and operational checks"], inputs: "Bring the systems involved, available access, and the records that need to move between them.", keywords: "API APIs integrations integration sync connector connectors data migration payment stripe shopify", cases: ["fystro", "vmcard"],
  },
  {
    slug: "branding", title: "Brand strategy & identity", category: "creative",
    summary: "Positioning, naming, and a coherent visual identity for the business and product.",
    scope: "We connect the audience and commercial positioning with the brand's name, marks, visual system, and applications. Existing approved identities are preserved when extending a brand into new formats.",
    deliverables: ["Positioning and brand direction", "Logo assets and visual system", "Brand guidelines and practical applications"], inputs: "Bring the target customer, positioning, existing identity, and any required brand constraints.", keywords: "brand branding identity logo naming positioning guidelines packaging", cases: ["avcm", "weathershield", "patch"],
  },
  {
    slug: "marketing-assets", title: "Marketing assets & sales collateral", category: "creative",
    summary: "The graphics, copy, and presentation materials needed to explain and sell the offer.",
    scope: "We adapt the message to the channel and the buying decision. Work can include landing-page assets, campaign creative, product sheets, sales presentations, launch materials, and packaging content.",
    deliverables: ["Creative brief and message hierarchy", "Channel-ready graphics and copy", "Sales or launch collateral and export files"], inputs: "Bring the offer, audience, channels, and approved brand or product assets.", keywords: "marketing assets collateral creative graphics copy copywriting sales deck pitch deck brochure product sheet packaging ads social", cases: ["avcm", "weathershield"],
  },
  {
    slug: "concept-explainer-videos", title: "Concept & explainer videos", category: "creative",
    summary: "Show how the product works and why it matters through a clear visual story.",
    scope: "We develop the message, script, storyboard, and visual approach around the audience's questions. Concept films, product explainers, demonstrations, and launch edits can combine existing assets, product renders, motion, and audio.",
    deliverables: ["Script and storyboard", "Concept film or product explainer", "Channel-specific edits, captions, and delivery files"], inputs: "Bring the product story, audience, intended channels, and any footage or renders already available.", keywords: "video videos concept explainer explainers film animation animated motion graphics demo demonstration storyboard script", links: [{label:"See-Hear concept example",href:"/#work"}],
  },
  {
    slug: "product-visualization", title: "3D renders & product visualization", category: "creative",
    summary: "Make the design understandable before a finished physical product is available.",
    scope: "Product models are translated into views that support design discussion, product presentation, and launch preparation. The visual brief distinguishes concept imagery from photographs of manufactured products.",
    deliverables: ["Product, packaging, or environment renders", "Detail, assembly, and exploded views", "Image library for web and presentation use"], inputs: "Bring CAD files or design references, finishes, approved marks, and intended uses.", keywords: "3d render renders rendering visualization CGI product images photography mockups exploded views", cases: ["tabem", "patch", "weathershield"],
  },
  {
    slug: "company-setup", title: "Incorporation & corporate records", category: "compliance",
    summary: "Coordinate company setup, structured intake, and the records needed to operate.",
    scope: "The company-building workflow organizes entity information, ownership details, filing inputs, and supporting records. Scope is matched to the jurisdiction and the decisions that need specialist review.",
    deliverables: ["Structured incorporation intake", "Company setup and filing workflow", "Corporate records and next-step checklist"], inputs: "Bring the operating jurisdiction, proposed ownership, company name, and business activities.", keywords: "incorporation incorporate company setup corporation government registration corporate records minute book filings", cases: ["avcm"], links: [{label:"Company setup in the portal",href:"/portal/login"}],
  },
  {
    slug: "trademarks-ip", title: "Trademarks & IP coordination", category: "compliance",
    summary: "Organize brand protection, ownership records, and the information required for IP work.",
    scope: "We connect names, marks, ownership, and commercialization plans with structured trademark and IP workflows. Patent strategy, registrability, and other regulated advice are coordinated with qualified specialists where required.",
    deliverables: ["Trademark and IP intake", "Ownership and assignment documentation workflow", "Filing coordination and specialist handover"], inputs: "Bring the mark or invention, ownership history, target markets, and any existing filings.", keywords: "trademark trademarks patent patents IP intellectual property assignment ownership licensing", cases: ["avcm"], links: [{label:"IP workflows in the portal",href:"/portal/login"}],
  },
  {
    slug: "government-regulatory", title: "Government & regulatory compliance", category: "compliance",
    summary: "Map requirements, organize evidence, and coordinate the work needed for the intended market.",
    scope: "Requirements depend on the product, claims, jurisdiction, and sales channel. We organize the compliance pathway and supporting documentation, with specialist testing, certification, and regulated advice scoped through qualified providers.",
    deliverables: ["Product and jurisdiction requirements map", "Documentation and evidence checklist", "Specialist review and submission coordination"], inputs: "Bring the product category, target countries, intended claims, and existing technical or test records.", keywords: "government regulatory regulation compliance certification approvals testing market access international cross border import export", links: [{label:"Plume commercialization example",href:"/#work"}],
  },
  {
    slug: "claims-labels", title: "Product claims & labelling", category: "compliance",
    summary: "Connect product messaging, packaging, and supporting evidence before market entry.",
    scope: "We organize the claims inventory and review needs across packaging, websites, and sales materials. Evidence gaps, market differences, and required specialist decisions are surfaced before those materials are finalized.",
    deliverables: ["Claims and label-content inventory", "Evidence and review requirements", "Coordinated packaging and digital content updates"], inputs: "Bring the formula or product specification, labels, intended claims, and target markets.", keywords: "claims labeling labelling labels packaging cosmetic cosmetics product evidence regulatory compliance", links: [{label:"Plume commercialization example",href:"/#work"}],
  },
  {
    slug: "sred", title: "SR&ED", category: "funding", href: "/sred", summary: "Organize eligible R&D work, supporting records, and claim preparation.", scope: "Connect technical evidence with project and cost records.", deliverables: ["Project and expenditure intake", "Technical evidence and cost organization", "Claim preparation workflow"], inputs: "Bring the work history and supporting cost records.", keywords: "sred sr&ed sr ed research development tax credits CRA t661 scientific experimental claim funding",
  },
  {
    slug: "grants", title: "Grants", category: "funding", href: "/grants", summary: "Assess fit, effort, timing, and evidence before pursuing a funding program.", scope: "Focus on programs that match the company and the planned work.", deliverables: ["Program fit assessment", "Application planning", "Evidence and reporting requirements"], inputs: "Bring the project, budget, location, and timeline.", keywords: "grants grant government funding application IRAP subsidies programs training",
  },
  {
    slug: "non-dilutive-capital", title: "Non-dilutive capital", category: "funding", href: "/non-dilutive-capital", summary: "Build the funding sequence around incentives and capital that preserve ownership.", scope: "Connect funding options to the operating plan and cash needs.", deliverables: ["Capital needs and timing", "Funding sequence", "Program and evidence priorities"], inputs: "Bring the operating plan and capital requirements.", keywords: "non dilutive nondilutive capital stack funding incentives equity ownership",
  },
  {
    slug: "investor-readiness", title: "VC, angels & investor readiness", category: "funding", href: "/vc-angel-capital", summary: "Prepare the commercial story, financing case, and ownership decisions before a raise.", scope: "Assess the capital requirement and implications of investor terms.", deliverables: ["Financing case", "Investor readiness priorities", "Capital and ownership considerations"], inputs: "Bring the financial model, traction, ownership, and proposed raise.", keywords: "vc venture angel angels investors investment raise fundraising pitch deck financial model cap table",
  },
  {
    slug: "accelerators", title: "Accelerators & incubators", category: "funding", href: "/accelerators-incubators", summary: "Evaluate whether a program's access, support, and terms fit the business.", scope: "Compare the program against the company's current priorities.", deliverables: ["Program fit review", "Term and opportunity-cost assessment", "Application priorities"], inputs: "Bring the program details and the business outcomes you need.", keywords: "accelerator accelerators incubator incubators program cohort startup",
  },
  {
    slug: "business-planning", title: "Business planning & unit economics", category: "growth",
    summary: "Connect the offer, operating model, pricing, costs, and cash requirements.",
    scope: "We build the plan around how the business will actually operate and earn revenue. Assumptions are made explicit so changes in price, volume, margin, and timing can inform the next decision.",
    deliverables: ["Business and operating plan", "Pricing, margin, and unit economics", "Milestones and capital requirements"], inputs: "Bring the offer, cost assumptions, intended channels, and current financial information.", keywords: "business plan planning financial model strategy unit economics pricing margin cash flow forecast", cases: ["avcm"],
  },
  {
    slug: "market-entry", title: "Go-to-market & international entry", category: "growth", href: "/market-entry", summary: "Sequence the audience, offer, channels, and markets before launch spend.", scope: "Connect market selection and positioning with practical entry requirements.", deliverables: ["Market and buyer priorities", "Positioning and channel sequence", "Launch requirements"], inputs: "Bring the product, target countries, and commercial constraints.", keywords: "go to market gtm market entry launch international expansion canada US cross border positioning",
  },
  {
    slug: "distribution-sales", title: "Distribution & B2B sales", category: "growth", href: "/distribution-access", summary: "Develop the channel and partner approach around the buyer and the economics.", scope: "Identify viable routes to buyers and the requirements to participate in them.", deliverables: ["Channel priorities", "Partner and buyer approach", "Margin and sequencing analysis"], inputs: "Bring the product, pricing, capacity, and desired channels.", keywords: "distribution distributor distributors B2B sales selling retail wholesale licensing partners export",
  },
  {
    slug: "customer-acquisition", title: "Campaigns & customer acquisition", category: "growth",
    summary: "Connect campaign creative, targeting, landing pages, and measurement to a buying journey.",
    scope: "We organize acquisition around the offer and the next measurable customer action. Creative, channel selection, tracking, and conversion review work together so campaign decisions can be tied to evidence.",
    deliverables: ["Channel and campaign plan", "Creative and landing-page coordination", "Conversion tracking and performance review"], inputs: "Bring the offer, audience, channel history, available budget, and conversion goal.", keywords: "marketing campaigns advertising paid media ads meta google customer acquisition growth lead generation social", links: [{label:"Selected brand work",href:"/#work"}],
  },
  {
    slug: "search-discovery", title: "SEO & AI search visibility", category: "growth",
    summary: "Make product and business information easier to find, understand, and cite.",
    scope: "We review site structure, product content, structured information, and the evidence supporting key claims. Work can cover search-engine optimization and answer-engine visibility, with changes assessed against discoverability and useful traffic.",
    deliverables: ["Search and content assessment", "Page, product-data, and structured-content improvements", "Visibility and measurement priorities"], inputs: "Bring the site, target queries, important products, and existing search data.", keywords: "seo aeo geo search optimization optimisation AI answer engine discovery visibility content schema structured data", links: [{label:"Selected brand work",href:"/#work"}],
  },
  {
    slug: "analytics", title: "Analytics & conversion improvement", category: "growth",
    summary: "Understand where people arrive, what they do, and where the buying journey breaks down.",
    scope: "We connect event definitions, source data, and reporting to specific business questions. The work identifies measurement gaps and prioritizes changes to the website, campaign, or operating process.",
    deliverables: ["Measurement and event plan", "Funnel and performance analysis", "Prioritized conversion improvements"], inputs: "Bring the site or app, analytics access, current reports, and the decision you need to make.", keywords: "analytics reporting tracking attribution conversion CRO funnel performance dashboard data measurement", cases: ["fystro"],
  },
]

export const serviceHref = (service: Service) => service.href ?? `/services/${service.slug}`
export const serviceCategory = (key: string) => SERVICE_CATEGORIES.find((category) => category.key === key)
export const getService = (slug: string) => SERVICES.find((service) => service.slug === slug)

export function filterServices(query: string, category = "all") {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return SERVICES.filter((service) => {
    if (category !== "all" && service.category !== category) return false
    const text = normalizeSearch(`${service.title} ${service.summary} ${service.keywords} ${serviceCategory(service.category)?.label ?? ""}`)
    return tokens.every((token) => text.includes(token))
  })
}
