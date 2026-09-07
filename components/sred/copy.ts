// Page copy for /sred. Kept in one place so legal wording is reviewed in one
// place. Lowercase "execom" throughout, per the brand rule in CLAUDE.md.
//
// Do not soften the purchase/service distinction anywhere in this file. A
// purchase is selective and conditional; the 5% preparation service is a
// separate, optional agreement and is never described as a purchase.

import type { Lane } from '@/lib/sred/engine'

export const HERO = {
  eyebrow: 'SR&ED',
  headline: 'We buy qualifying SR&ED claims.',
  sub: 'Your company may already be sitting on a valuable SR&ED tax credit.',
  sub2: 'Find out what your claim could be worth, and whether execom will buy it.',
  promise: 'Free estimate. No obligation.',
  primaryCta: 'Estimate my SR&ED claim',
  secondaryCta: 'Existing client? Sign in',
  disclosure:
    'Purchase offers are available only for qualifying claims and are subject to eligibility, documentation verification, underwriting, available funding and final agreement.',
}

export const ASSESSOR_INTRO = {
  heading: 'What could your SR&ED claim be worth?',
  body: 'Answer a few quick questions about the technical work your company performed and the people and money involved.',
  body2:
    'We will estimate whether the work appears potentially eligible, the approximate claim opportunity, and whether it may fit our purchase criteria.',
  note: 'No technical report or tax return required to start.',
  cta: 'Start my free estimate',
}

export const TWO_PATHS = [
  {
    index: '01',
    title: 'We may buy your claim.',
    body: 'For qualifying claims that meet our purchase criteria, execom may make a cash purchase offer. We handle the assessment, documentation and claim administration required under the transaction.',
    fine: 'Purchase eligibility depends on factors including claim stage, documentation, claim size, filing timeline, collection risk, available funding and underwriting.',
  },
  {
    index: '02',
    title: 'Or keep your claim and pay only when you get paid.',
    body: 'If your claim does not meet our purchase criteria, or you would rather keep it, execom can prepare and administer the claim for 5% of the SR&ED cash refund actually received, under a separate agreement.',
    fine: 'Nothing payable until your refund arrives. No hourly billing. No large consulting retainer.',
  },
]

export const ELIGIBILITY = {
  heading: 'You may qualify without realizing it.',
  body: 'SR&ED is not limited to laboratories or companies with dedicated R&D departments.',
  body2:
    'Companies may have qualifying work when they attempted to overcome technological uncertainty through systematic investigation or experimentation.',
  body3:
    'That can occur in software, manufacturing, engineering, biotechnology, materials, clean technology, hardware, industrial processes and other technical fields.',
  body4: 'The assessor is designed to identify the underlying work first.',
  cta: 'Check my company',
}

export const RESULT_INTRO = {
  heading: 'Your preliminary result',
  disclaimer:
    'This is an indicative screening result based on the information you entered. It is not a CRA determination, tax opinion, purchase approval or guaranteed refund amount.',
}

export const LANE_COPY: Record<Lane, { title: string; body: string; cta: string }> = {
  purchase_review: {
    title: 'Your claim looks worth a purchase review.',
    body: 'Based on what you entered, this claim appears to fit our initial screening range. We still need to verify the claim stage, records, collection risks and economics before making any offer.',
    cta: 'Request my review',
  },
  preparation_offer: {
    title: 'This looks better suited to our pay-after-refund service.',
    body: 'Your claim does not currently fit our purchase criteria, but it may still be suitable for SR&ED preparation. Under a separate agreement, execom can prepare and administer the claim for 5% of the SR&ED cash refund actually received, payable after receipt.',
    cta: 'Have execom review it',
  },
  technical_review: {
    title: 'There may be an opportunity here, but the technical eligibility needs a closer look.',
    body: 'We need a specialist to understand the uncertainty, experimentation and evidence before estimating this confidently.',
    cta: 'Request a technical review',
  },
  already_filed_review: {
    title: 'You have already filed. Let us assess the claim you have.',
    body: 'We will not route you into a duplicate preparation process. We can review the filed claim, expected cash, documentation and timing to determine whether there is an appropriate next step.',
    cta: 'Review my filed claim',
  },
  not_ready: {
    title: 'There may not be enough here yet for a useful SR&ED review.',
    body: 'Below is what is missing. You are welcome to come back once those pieces exist. Nothing here commits you to a service.',
    cta: 'Ask about next steps',
  },
}

export const CONTACT = {
  heading: 'Where should we send your review?',
  serviceConsent:
    'I am asking execom to contact me about this SR&ED assessment and the review I requested.',
  marketingConsent:
    'Optional: send me occasional execom updates about SR&ED and non-dilutive capital.',
  submit: 'Send my request',
  privacy:
    'We use these details to carry out the review you asked for. We do not send your figures, technical description or tax details to advertising platforms.',
}

export const FOOTER_DISCLOSURE = [
  'Purchase offers are subject to eligibility, underwriting, documentation verification, available funding and final agreement. Preliminary estimates are not CRA determinations or guarantees of SR&ED eligibility, refund amount or payment timing.',
  'execom’s claim-preparation service is separate from its claim-purchase program. Companies not offered a purchase may choose whether or not to engage execom for claim preparation.',
]

export const FAQ = [
  {
    q: 'Is the estimate a CRA determination?',
    a: 'No. It is an indicative screening figure built from the numbers you enter and disclosed assumptions. Only the CRA determines eligibility and the amount, and only after a claim is filed and processed.',
  },
  {
    q: 'Does a purchase review mean you will buy my claim?',
    a: 'No. A purchase review means the file is worth verifying. Any offer depends on documentation verification, underwriting, collection risk, available funding and a final agreement, and execom may decline for any of those reasons.',
  },
  {
    q: 'What does the 5% preparation service cost me if the refund never arrives?',
    a: 'Nothing. The fee is 5% of the SR&ED cash refund actually received, payable after receipt, under a separate agreement. It is not a purchase and it involves no assignment of your claim.',
  },
  {
    q: 'I have already filed. Will you sell me preparation I do not need?',
    a: 'No. A filed claim is never routed into a duplicate preparation engagement. We review the claim you already have and tell you whether there is a sensible next step.',
  },
]
