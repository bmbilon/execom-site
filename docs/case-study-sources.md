# Case-study source notes

Reviewed October 6, 2026. Brett requested public mini case studies from the Clients Drive folder, plus homepage tiles for Fystro, AVCM.io, and VMCard. He subsequently excluded Shoe Pockets, Curly Q, and Can Cooler and requested Patch instead.

These notes record provenance, not a copy of private project documents. Public summaries omit client contact details, contract prices, supplier identities, signatures, and proprietary engineering details. An engagement scope does not establish completed delivery, and an application does not establish a patent grant.

## Fystro

- Sources: the Fystro application repository (`Ledger`), `ARCHITECTURE.md`, `CONVERGENCE.md`, welcome-page implementation, and the public welcome page and read-only demonstration at https://fystro.ca/welcome.
- Supported: Operations and Insights, receiving, inventory ledger, purchasing, forecasting, production planning, and a shared workspace.
- Limit: do not imply every listed third-party connector is live.
- Authentic mark: `apps/web/public/icons/icon-512.png`, copied without alteration to `public/showcase/fystro/fystro-icon.png`.

## AVCM.io

- Sources: `avcm_blueprint_premium.html` in the existing AVCM/Ownly project archive; published site assets archived in `assets/avcm-site/`.
- Supported: fingerprint-enabled age-verification card concept; market research, business planning, branding, Canadian and U.S. company records, and segmented partner outreach.
- Limit: no confirmed pilot, commercial launch, revenue, patent grant, or signed partnership is claimed. The public root website returned 404 during review, so the study does not link to it.
- Authentic assets: `avcm-logo-live.png` copied to `avcm-mark.png`; `avcm-card-hero.png` converted to WebP without changing the design.

## VMCard

- Sources: the PCI VM Project README and application code; public walkthrough at https://vmcard-app.vercel.app/preview.
- Supported: professional sender identity, written context, optional voice/video, Inbox/Compose/Sent, recipient detail, prior-card history, review before sending, and contact actions.
- Limit: MVP and interactive walkthrough, not an app-store release or proven integration with carrier voicemail.
- Authentic mark: `apps/web/public/brand/vmcard-app-icon.png`, copied without alteration to `public/showcase/vmcard/vmcard-icon.png`.

## TABEM by BUQUOR

- Sources: Clients Drive BUQUOR folder (`1Fdk9kA4HV0Nnl-ogSYtWEYh1bGmiDfUo`), lint-roller engineering and manufacturing proposal; local `BUQUOR_TABEM_Phase_III_Close-Out_Package_Execom_Branded.docx`, September 1, 2026.
- Supported: handle, paperboard core, adhesive refill; supplier sourcing and qualification, confidentiality workflows, quote comparison, shipping terms, completed sourcing handover.
- Limit: sourcing completion does not establish a complete assembled sample, factory audit, production order, or retail launch.

## Sturdy Screens

- Sources: Clients Drive project folder (`1vj1dX092vUqoFNDYn_hy1T-fNIHCGMKG`); `Notes - Sturdy Screens: Next Steps` (`1Y66hqjpFU7Uo0HmFYp-2X1UxZBIMkzODRVstKyv36QI`).
- Supported: camper screen-door storefront, related-product and recently viewed features, concept/prototype/manufacturing planning.
- Limit: no completed manufacturing run or shipment claimed.

## WeatherShield

- Sources: Clients Drive project folder (`1oWRqRWjr5NZshIj9pVdkw0_w3j9CEm2Z`), brand files, `Weathershield design approach and quote` (`1TiJY6R8YF56oNrlZviJDZFUIYtuG2ycDPJi18owV_p4`), `Weather Shield - Website Notes` (`1Pp1avrshIFuxXv08lblEnkgVG-kP3QTE5T9WAme0e-8`).
- Supported: brand and website direction; a phased plan for concepts, parametric CAD, bill of materials, structural analysis, scaled prototype, and manufacturing package.
- Limit: engineering phases are planned scope, not verified completed testing or certification.

## Patch

- Sources: Clients Drive Patch folder (`1QniXQCDfmgGqNq5ihN4vNENBZDwp6YlZ`); May 11, 2026 `execom Patch Foundation Build Engagement (eSign Ready).docx` (`10M-jeczruTt9nHApCQ4XdVPSP5tm1fFX`); `Patch Cigarette Notes` (`1hz8kAoFTfSM06uFoIjRG_GlZxpStWgbzvv7WrO5FvqM`).
- Supported: e-cigarette concept; scope for 3D product and packaging visualization, brand application, seven-page website, password gate, and infrastructure.
- Limit: the study describes a scoped engagement. It does not claim delivered hardware, a public launch, regulatory approval, completed investor outreach, or a patent grant. It contains no product-purchase links or consumer sales claims.

## Publication structure

`lib/site/caseStudies.ts` contains the seven public summaries and their detail-page content. Only the three entries marked `homepage` render as homepage tiles. Additional cases stay one click deeper in the library. Technical project drawings already on the homepage remain collapsed by default. Brand names in headings are ordinary editorial labels; supplied marks are used wherever a logo is shown.

## Imagery added October 6, 2026

All seven studies have an image in the library and on the detail page. The three homepage tiles use the same assets. Detail-page captions distinguish screenshots, project renders, brand imagery, and concepts; visitors can open the full image. No marks were redrawn or generated.

- Fystro: two screenshots supplied by Brett in this thread for publication. Photo 1 is the dashboard; Photo 2 shows navigation across Insights and Operations. Converted to WebP, preserving the supplied content. The navigation view is available under “More product views.”
- AVCM: existing published card concept remains the source; it now also appears on the tile.
- VMCard: existing project QA capture, `docs/qc-assets/iphone-readiness/01-recipient-card.jpg`. Reviewed visually: Maya Chen is the demo identity and the visible address uses example.com. Converted to WebP.
- TABEM: `Lint Roller Tech Pack/Renders/3.png` from the existing BUQUOR project archive. Converted to WebP without changing the design.
- Sturdy Screens: published homepage hero asset, `https://sturdyscreens.com/cdn/shop/t/17/assets/sturdy-hero-rv-door.png?v=107146464560872923841786999762`. Captioned as storefront brand imagery, not documentary evidence of a delivered manufacturing run.
- WeatherShield: page 11 of `WeatherShield Brand Identity 2024.pdf`, Drive file `163jDWzIuvZHA2IfL9LwFPvKJBOIh_XxU`. Rendered as a complete page with the two supplied enclosure concepts, then converted to WebP. The caption explicitly identifies a concept visualization. The draft website screenshots containing placeholder text were not used.
- Patch: existing project asset `patch-neon/landing/public/explorer/patch-studio.png`. Converted to a 1600-pixel-wide WebP. Captioned as a product concept render; no purchase link or consumer sales claim is added.
