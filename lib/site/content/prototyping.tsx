import type { AdvisoryPageData } from "@/components/site/advisory/types"

export const prototyping: AdvisoryPageData = {
  href: "/prototyping",
  crumb: "Prototyping",
  hero: {
    eyebrow: "Prototyping",
    title: "Your product might be failing *before you've made it*.",
    lede: "Sometimes the most expensive prototype is the one you build before you know who buys it and why. execom offers founders an alternative to the conventional design-build path.",
    primary: { label: "Start readiness assessment", href: "/portal/prototype-readiness" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  chapters: [
    {
      id: "who-its-for",
      nav: "Who it's for",
      title: "Founders with a physical product and real intent to *commercialize*.",
      summary:
        "You have sketches, maybe a rough prototype, and friends who like it. The next step feels obvious: hire a designer, build it, tool it up. It almost never is.",
      blocks: [
        { kind: "lead", text: "What gets answered before anything is built:" },
        {
          kind: "list",
          numbered: true,
          items: [
            "Would anyone outside your immediate circle pay for it?",
            "What would they pay?",
            "Where would they buy it?",
            "Do the unit economics hold up when the freight bills arrive?",
          ],
        },
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "You have sketches, maybe a rough prototype, possibly some friends and family who say it's a great idea. The next step feels obvious: hire a designer, get a real prototype, tool it up.",
                "It almost never is. The next step is figuring out whether anyone outside your immediate circle would pay for it, what they'd pay, where they'd buy it, and whether the unit economics hold up when the freight bills arrive. That's what we do before anything gets built.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "paths",
      nav: "Three paths",
      title: "One assessment. Three honest paths forward.",
      summary:
        "You complete a short readiness assessment. We review it and recommend one of three engagements based on where the concept actually is.",
      blocks: [
        {
          kind: "steps",
          items: [
            {
              title: "Validation Sprint",
              text: "Customer interviews, willingness-to-pay tests, competitor teardowns, and a go / no-go memo. Use this when the buyer and price are still hypotheses.",
              meta: "Typical timeline: 2–4 weeks",
            },
            {
              title: "Prototype Blueprint",
              text: "Industrial design, material selection, supplier shortlist, BOM, and a packaging / freight strategy. Use this once demand is real.",
              meta: "Typical timeline: 4–8 weeks",
            },
            {
              title: "Build & Launch Plan",
              text: "Tooling, first production run, brand and content for launch, retail and DTC channel strategy. Use this once the blueprint is locked.",
              meta: "Typical timeline: 3–6 months",
            },
          ],
        },
        {
          kind: "callout",
          title: "Not ready for any of the three?",
          text: "That's the most useful thing we can tell you. In those cases we recommend a short Product Reality Review instead of selling you work you shouldn't do.",
        },
      ],
    },
    {
      id: "the-assessment",
      nav: "The assessment",
      title: "Six short sections. Plain language, *honest answers*.",
      summary:
        "It takes most people 20–30 minutes. Drafts auto-save, so you can step away and come back. Your answers decide the recommended next step.",
      blocks: [
        {
          kind: "accordion",
          numbered: true,
          items: [
            { title: "The product", body: ["What it is, why someone would want it, and what makes your version different."] },
            {
              title: "The buyer",
              body: ["Who is most likely to pay for it, what they have already told you, and what you think they would pay."],
            },
            { title: "How it works", body: ["The parts, materials, size, weight, and how someone would store it."] },
            {
              title: "Packaging & shipping",
              body: ["How the finished product moves through the box, the truck, and onto a shelf or doorstep."],
            },
            { title: "Where people buy", body: ["The channels you imagine selling through, and why those channels would actually work."] },
            {
              title: "Working with execom",
              body: ["The kind of help you are looking for, what is realistic for budget right now, and how to reach you."],
            },
          ],
        },
      ],
    },
  ],
  closing: {
    title: "Find out where you actually stand, *before you spend*.",
    body: "Take the Prototype Readiness Assessment. We'll review your answers and respond within two business days with the recommended next step.",
    primary: { label: "Start readiness assessment", href: "/portal/prototype-readiness" },
    secondary: { label: "See industrial design", href: "/industrial-design" },
  },
}
