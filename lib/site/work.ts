// Selected work shown on the home page.
// Rule: every line of copy here must trace to material already published on
// execom.ca or supplied by the client. Entries with `published: false` are
// placeholders waiting on approved copy and assets, and never render.

export type WorkVisual =
  | { type: "image"; src: string; alt: string; fit?: "cover" | "contain"; position?: string; background?: string; multiply?: boolean }
  | { type: "hex" }
  | { type: "wordmark"; text: string; lines: string[] }

export type WorkItem = {
  key: string
  name: string
  kind: string
  summary: string
  tags: string[]
  visual?: WorkVisual
  link?: { label: string; href: string }
  published: boolean
}

export const WORK: WorkItem[] = [
  {
    key: "plume",
    name: "Plume",
    kind: "Consumer brand, founder-built",
    summary:
      "Built and launched by execom's founder. A global beauty brand carried by Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws.",
    tags: ["Concept to retail", "Physical product", "International scale"],
    visual: { type: "wordmark", text: "Plume", lines: ["Nordstrom", "Sephora", "Anthropologie", "REVOLVE", "Loblaws"] },
    link: { label: "Meet the founder", href: "/about#founder" },
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
  { key: "see-hear", name: "See-Hear", kind: "", summary: "", tags: [], published: false },
  { key: "avcm", name: "AVCM", kind: "", summary: "", tags: [], published: false },
  { key: "patch", name: "Patch", kind: "", summary: "", tags: [], published: false },
  { key: "neuma", name: "Neuma", kind: "", summary: "", tags: [], published: false },
  { key: "luxe-beauty-company", name: "Luxe Beauty Company", kind: "", summary: "", tags: [], published: false },
]

export const PUBLISHED_WORK = WORK.filter((w) => w.published && w.kind && w.summary)
