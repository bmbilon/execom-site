// Selected work shown on the home page.
// Rule: every line of copy here must trace to material already published on
// execom.ca or supplied by the client. Entries with `published: false` are
// placeholders waiting on approved copy and assets, and never render.

export type WorkVisual =
  | { type: "image"; src: string; alt: string; fit?: "cover" | "contain"; position?: string; background?: string; multiply?: boolean }
  | { type: "hex" }

export type WorkItem = {
  key: string
  name: string
  kind: string
  summary: string
  detail?: string
  tags: string[]
  visual?: WorkVisual
  logo?: { src: string; alt: string; width: number; height: number; background?: string }
  featured?: boolean
  layout?: "portrait" | "landscape"
  link?: { label: string; href: string }
  evidence?: { label: string; href: string }[]
  published: boolean
}

export const WORK: WorkItem[] = [
  {
    key: "plume",
    name: "Plume",
    kind: "Turnkey services",
    summary:
      "Built and launched by execom's founder, Plume brings patented formulation and novel peptides, including proprietary OGP-251, to a global beauty business. Its C² Complex is covered by U.S. Patent 11,045,444.",
    detail:
      "Commercialization spans a complex regulatory and international business landscape: product claims, cosmetic regulation, IP protection, cross-border distribution, and retail partnerships with Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws.",
    tags: ["Patented formulation", "Novel peptides", "International scale"],
    visual: {
      type: "image",
      src: "/showcase/plume/plume-elite-hero.jpg",
      alt: "Plume Elite lash and brow serum, official Plume homepage photography",
      fit: "cover",
      position: "50% 50%",
    },
    logo: { src: "/showcase/plume/plume-logo-white.png", alt: "Plume Hair & Lash Science", width: 200, height: 60 },
    featured: true,
    layout: "portrait",
    link: { label: "Explore Plume", href: "https://www.plumescience.com/" },
    evidence: [
      { label: "Formula & science", href: "https://www.plumescience.com/pages/plume-elite-evidence-center" },
      { label: "U.S. Patent 11,045,444", href: "https://patents.google.com/patent/US11045444B2/en" },
    ],
    published: true,
  },
  {
    key: "see-hear",
    name: "See-Hear",
    kind: "Turnkey services",
    summary:
      "Prescription-ready audio eyewear in development, with directional microphones, open-ear speakers, and phone-based controls for calls and audio. A consumer technology concept designed around everyday conversation.",
    tags: ["Audio eyewear", "Connected product", "In development"],
    visual: {
      type: "image",
      src: "/showcase/see-hear/conversation-concept.jpg",
      alt: "Restaurant scene from See-Hear's pre-launch conversation concept film",
      fit: "cover",
      position: "50% 50%",
    },
    logo: { src: "/showcase/see-hear/see-hear-logo.png", alt: "See-Hear", width: 190, height: 72, background: "#f8f8f5" },
    featured: true,
    link: { label: "Explore See-Hear", href: "https://see-hear.ca/" },
    published: true,
  },
  {
    key: "neuma",
    name: "Neuma",
    kind: "Turnkey services",
    summary:
      "A wearable breathing coach that pairs real-time breath detection with gentle haptic cues and app-based guidance. The NeumaBand brings sensing hardware and a connected software experience into a discreet daily wearable.",
    tags: ["Wearable technology", "Haptic feedback", "Connected software"],
    visual: {
      type: "image",
      src: "/showcase/neuma/neuma-band.jpg",
      alt: "NeumaBand breathing wearable shown on a person, from Neuma's official website",
      fit: "cover",
      position: "50% 50%",
    },
    logo: { src: "/showcase/neuma/neuma-logo.svg", alt: "Neuma", width: 176, height: 81 },
    featured: true,
    link: { label: "Explore Neuma", href: "https://neumatech.co/" },
    published: true,
  },
  {
    key: "neat",
    name: "NEAT, wearable haptic system",
    kind: "Wearable medical device",
    summary:
      "Industrial design and patent figure drafting for a wearable haptic stimulation system. Provisional patent application, November 2025.",
    tags: ["Industrial design", "Patent figures", "Provisional application"],
    visual: {
      type: "image",
      src: "/showcase/neat/figure-2.webp",
      alt: "NEAT wearable haptic device, enclosure isometric",
      fit: "contain",
      background: "#f4f1e8",
      multiply: true,
    },
    link: { label: "See the design work", href: "/industrial-design#selected-work" },
    published: true,
  },
  {
    key: "hex-100",
    name: "Self-Cleaning HEX-100",
    kind: "Precision mechanical assembly",
    summary:
      "A 25-page production-ready drawing set for a precision hex-driver assembly. Multi-part BOM with vendor specifications, weld callouts, and dimensioned isometric views.",
    tags: ["25 drawing sheets", "Multi-part BOM", "Vendor specifications"],
    visual: { type: "hex" },
    link: { label: "See the CAD package", href: "/industrial-design#selected-work" },
    published: true,
  },
  {
    key: "fan-brush",
    name: "Silicone fan brush",
    kind: "Beauty tool, pre-launch",
    summary:
      "A nine-part silicone fan brush taken from source CAD to an interactive 3D preview ahead of launch.",
    tags: ["Source CAD", "Interactive 3D viewer", "Pre-launch preview"],
    visual: {
      type: "image",
      src: "/fanbrush/brush-studio.png",
      alt: "Silicone fan brush, studio render",
      fit: "cover",
      position: "50% 16%",
    },
    link: { label: "Open the 3D viewer", href: "/fanbrush" },
    published: true,
  },

  // Waiting on approved copy and assets. Fill in kind, summary, tags and a
  // visual, then set published to true.
  { key: "avcm", name: "AVCM", kind: "", summary: "", tags: [], published: false },
  { key: "patch", name: "Patch", kind: "", summary: "", tags: [], published: false },
  { key: "luxe-beauty-company", name: "Luxe Beauty Company", kind: "", summary: "", tags: [], published: false },
]

export const PUBLISHED_WORK = WORK.filter((w) => w.published && w.kind && w.summary && w.visual)
