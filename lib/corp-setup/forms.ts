/**
 * Corp Setup — Form definitions for all 19 templates.
 * Each form maps to a template document. The fields here drive
 * both the UI and the email notification payload.
 */

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'date' | 'number' | 'repeater' | 'heading' | 'note'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  note?: string
  fields?: FormField[] // for repeater type
}

export interface FormDefinition {
  id: string
  number: number
  title: string
  shortTitle: string
  phase: number
  phaseName: string
  description: string
  fields: FormField[]
}

// ─── Phase 1: Corporate Formation ─────────────────────────

export const form01: FormDefinition = {
  id: 'incorporation',
  number: 1,
  title: 'Name Clearance & Incorporation Package',
  shortTitle: 'Incorporation',
  phase: 1,
  phaseName: 'Corporate Formation',
  description: 'Provide your proposed corporate name, office address, and director information.',
  fields: [
    { name: '_h_nuans', label: 'NUANS Name Search', type: 'heading' },
    { name: 'proposed_name', label: 'Proposed Corporate Name', type: 'text', placeholder: 'e.g., Acme Innovations Ltd.', required: true },
    { name: 'alt_name_1', label: 'Alternate Name 1', type: 'text', placeholder: 'Backup name option' },
    { name: 'alt_name_2', label: 'Alternate Name 2', type: 'text', placeholder: 'Second backup' },
    { name: 'reserved_name', label: 'Reserved Corporate Name (if applicable)', type: 'text' },
    { name: '_h_office', label: 'Registered Office Address', type: 'heading' },
    { name: 'street_address', label: 'Street Address', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'province', label: 'Province', type: 'text', placeholder: 'Alberta' },
    { name: 'postal_code', label: 'Postal Code', type: 'text', required: true },
    { name: '_h_directors', label: 'Director(s)', type: 'heading' },
    { name: 'director_name', label: 'Director Full Legal Name', type: 'text', required: true },
    { name: 'director_address', label: 'Director Residential Address', type: 'text', required: true },
    { name: 'director_country', label: 'Director Country of Residence', type: 'text', placeholder: 'Canada' },
    { name: '_h_other', label: 'Additional Details', type: 'heading' },
    { name: 'min_directors', label: 'Minimum Number of Directors', type: 'number', placeholder: '1' },
    { name: 'max_directors', label: 'Maximum Number of Directors', type: 'number', placeholder: '5' },
    { name: 'business_restrictions', label: 'Business Restrictions (if any)', type: 'textarea', placeholder: 'None, or describe any restrictions' },
    { name: 'other_provisions', label: 'Other Provisions', type: 'textarea', placeholder: 'Pre-emptive rights, borrowing powers, etc.' },
    { name: 'fiscal_year_end', label: 'Fiscal Year End', type: 'text', placeholder: 'December 31' },
    { name: '_h_incorporator', label: 'Incorporator', type: 'heading' },
    { name: 'incorporator_name', label: 'Incorporator Full Legal Name', type: 'text', required: true },
    { name: 'incorporator_address', label: 'Incorporator Address', type: 'text', required: true },
  ],
}

export const form02: FormDefinition = {
  id: 'org-resolutions',
  number: 2,
  title: 'Initial Organizational Resolutions',
  shortTitle: 'Org Resolutions',
  phase: 1,
  phaseName: 'Corporate Formation',
  description: 'Banking, officer appointments, and fiscal year details.',
  fields: [
    { name: 'corp_name', label: 'Corporation Name', type: 'text', required: true },
    { name: 'date_of_incorporation', label: 'Date of Incorporation', type: 'date', required: true },
    { name: '_h_bank', label: 'Banking', type: 'heading' },
    { name: 'bank_name', label: 'Bank Name and Branch', type: 'text', required: true },
    { name: 'signatory_1', label: 'Authorized Signatory 1 (Name, Title)', type: 'text', required: true },
    { name: 'signatory_2', label: 'Authorized Signatory 2 (Name, Title)', type: 'text' },
    { name: 'signing_authority', label: 'Signing Authority', type: 'select', options: [
      { label: 'Any one signatory', value: 'any_one' },
      { label: 'Any two signatories', value: 'any_two' },
      { label: 'All signatories', value: 'all' },
    ]},
    { name: '_h_officers', label: 'Officer Appointments', type: 'heading' },
    { name: 'president', label: 'President / CEO', type: 'text', required: true },
    { name: 'secretary', label: 'Secretary', type: 'text' },
    { name: 'treasurer', label: 'Treasurer / CFO', type: 'text' },
    { name: 'fiscal_year_end', label: 'Fiscal Year End', type: 'text', placeholder: 'December 31' },
    { name: 'corporate_seal', label: 'Corporate Seal', type: 'select', options: [
      { label: 'Yes — adopt corporate seal', value: 'yes' },
      { label: 'No — do not adopt', value: 'no' },
    ]},
  ],
}

export const form03: FormDefinition = {
  id: 'share-subscription',
  number: 3,
  title: 'Founder Share Subscription',
  shortTitle: 'Share Subscription',
  phase: 1,
  phaseName: 'Corporate Formation',
  description: 'Founder equity details — share class, quantity, price, and payment method.',
  fields: [
    { name: 'corp_name', label: 'Corporation Name', type: 'text', required: true },
    { name: 'subscriber_name', label: 'Subscriber Full Legal Name', type: 'text', required: true },
    { name: 'subscriber_address', label: 'Subscriber Address', type: 'text', required: true },
    { name: 'subscriber_email', label: 'Subscriber Email', type: 'email', required: true },
    { name: '_h_shares', label: 'Share Details', type: 'heading' },
    { name: 'num_shares', label: 'Number of Shares', type: 'number', required: true },
    { name: 'price_per_share', label: 'Price Per Share ($)', type: 'text', required: true },
    { name: 'total_price', label: 'Aggregate Subscription Price ($)', type: 'text', required: true },
    { name: 'payment_method', label: 'Payment Method', type: 'select', required: true, options: [
      { label: 'Cash / cheque / wire', value: 'cash' },
      { label: 'Transfer of property (s.85)', value: 'property' },
      { label: 'Promissory note', value: 'note' },
      { label: 'Combination', value: 'combination' },
    ]},
    { name: 'payment_details', label: 'Payment Details (amounts per method if combination)', type: 'textarea' },
  ],
}

// ─── Phase 2: IP Transfer ─────────────────────────────────

export const form04: FormDefinition = {
  id: 'ip-inventory',
  number: 4,
  title: 'IP Inventory Memo',
  shortTitle: 'IP Inventory',
  phase: 2,
  phaseName: 'IP Transfer',
  description: 'List all intellectual property you currently own. This forms the basis for the assignment to your corporation.',
  fields: [
    { name: 'inventor_name', label: 'Inventor / Owner Full Legal Name', type: 'text', required: true },
    { name: 'corp_name', label: 'Corporation Name (assignee)', type: 'text', required: true },
    { name: '_h_patents', label: 'Patents and Patent Applications', type: 'heading' },
    { name: 'patents', label: 'List each patent/application: title, filing date, application number, country, status', type: 'textarea', placeholder: 'One per line:\nWidget Design — 2025-01-15 — CA 3,123,456 — Canada — Pending' },
    { name: '_h_trademarks', label: 'Trademarks (Registered and Unregistered)', type: 'heading' },
    { name: 'trademarks', label: 'List each mark: name/description, application number, status', type: 'textarea', placeholder: 'ACME — Application No. 2,123,456 — Pending\nAcme Logo — Unregistered' },
    { name: '_h_domains', label: 'Domain Names', type: 'heading' },
    { name: 'domains', label: 'List each domain: name, registrar, expiry, registrant', type: 'textarea', placeholder: 'acme.com — GoDaddy — 2026-03-01 — Personal' },
    { name: '_h_copyright', label: 'Copyright Materials', type: 'heading' },
    { name: 'copyrights', label: 'Software, documentation, designs, publications', type: 'textarea', placeholder: 'Widget control software (Python) — GitHub repo\nTechnical whitepaper — "Advances in Widget Design"' },
    { name: '_h_secrets', label: 'Trade Secrets and Know-How', type: 'heading' },
    { name: 'trade_secrets', label: 'Proprietary processes, methods, formulas, datasets', type: 'textarea' },
    { name: '_h_prototypes', label: 'Prototypes, Drawings, Physical Materials', type: 'heading' },
    { name: 'prototypes', label: 'Prototypes, models, CAD files, lab notebooks', type: 'textarea' },
    { name: '_h_software', label: 'Software and Digital Assets', type: 'heading' },
    { name: 'software_assets', label: 'Source code repos, cloud accounts, SaaS, app store accounts, design files', type: 'textarea' },
    { name: '_h_third_party', label: 'Third-Party Contributions and Encumbrances', type: 'heading' },
    { name: 'third_party', label: 'Any IP created with third-party contributions or subject to existing licenses', type: 'textarea', placeholder: 'Contractor name — contribution — assignment status' },
    { name: '_h_prior', label: 'Prior Employer / University Obligations', type: 'heading' },
    { name: 'prior_obligations', label: 'Any agreements that could affect ownership', type: 'textarea', placeholder: 'Employer — agreement type — restrictions' },
  ],
}

export const form05: FormDefinition = {
  id: 'ip-assignment',
  number: 5,
  title: 'IP Assignment Details',
  shortTitle: 'IP Assignment',
  phase: 2,
  phaseName: 'IP Transfer',
  description: 'Confirm the assignment terms — who is assigning, what consideration, and Section 85 election.',
  fields: [
    { name: 'assignor_name', label: 'Assignor (Inventor) Full Legal Name', type: 'text', required: true },
    { name: 'assignor_address', label: 'Assignor Address', type: 'text', required: true },
    { name: 'assignee_name', label: 'Assignee (Corporation) Name', type: 'text', required: true },
    { name: 'assignee_address', label: 'Corporation Registered Office Address', type: 'text', required: true },
    { name: 'effective_date', label: 'Effective Date of Assignment', type: 'date', required: true },
    { name: '_h_consideration', label: 'Consideration', type: 'heading' },
    { name: 'consideration_type', label: 'Form of Consideration', type: 'select', required: true, options: [
      { label: 'Cash only', value: 'cash' },
      { label: 'Share issuance only', value: 'shares' },
      { label: 'Promissory note', value: 'note' },
      { label: 'Combination (cash + shares)', value: 'combination' },
      { label: 'Section 85 rollover (shares)', value: 's85' },
    ]},
    { name: 'cash_amount', label: 'Cash Amount ($)', type: 'text' },
    { name: 'share_count', label: 'Number of Shares', type: 'number' },
    { name: 'share_class', label: 'Share Class', type: 'text', placeholder: 'Class A Common' },
    { name: 'share_value', label: 'Deemed Value Per Share ($)', type: 'text' },
    { name: 'note_amount', label: 'Promissory Note Amount ($)', type: 'text' },
    { name: '_h_s85', label: 'Section 85 Election', type: 'heading' },
    { name: 'section_85', label: 'Section 85 Election?', type: 'select', options: [
      { label: 'Yes — will make joint election', value: 'yes' },
      { label: 'No — not applicable', value: 'no' },
      { label: 'To be determined with tax advisor', value: 'tbd' },
    ]},
    { name: 'elected_amount', label: 'Agreed Elected Amount ($) (if s.85)', type: 'text' },
    { name: 'ip_fmv', label: 'Estimated Fair Market Value of IP ($)', type: 'text' },
    { name: 'valuation_basis', label: 'Basis of Valuation', type: 'select', options: [
      { label: 'Nominal / trivial value', value: 'nominal' },
      { label: 'Formal valuation', value: 'formal' },
      { label: 'Cost basis', value: 'cost' },
      { label: 'Comparable transactions', value: 'comparable' },
    ]},
  ],
}

// ─── Phase 3: Brand & IP Protection ──────────────────────

export const form10: FormDefinition = {
  id: 'trademark-clearance',
  number: 10,
  title: 'Trademark Clearance',
  shortTitle: 'Trademark Search',
  phase: 3,
  phaseName: 'Brand & IP Protection',
  description: 'Proposed marks and brand details for clearance search and filing.',
  fields: [
    { name: 'corp_name', label: 'Corporation (Applicant) Name', type: 'text', required: true },
    { name: '_h_marks', label: 'Proposed Marks', type: 'heading' },
    { name: 'mark_1_name', label: 'Mark 1 — Name or Description', type: 'text', required: true },
    { name: 'mark_1_type', label: 'Mark 1 — Type', type: 'select', options: [
      { label: 'Word mark', value: 'word' },
      { label: 'Design mark (logo)', value: 'design' },
      { label: 'Combination (word + design)', value: 'combo' },
    ]},
    { name: 'mark_1_goods', label: 'Mark 1 — Goods / Services', type: 'textarea', placeholder: 'Describe the goods or services this mark will cover', required: true },
    { name: 'mark_2_name', label: 'Mark 2 — Name or Description (if applicable)', type: 'text' },
    { name: 'mark_2_type', label: 'Mark 2 — Type', type: 'select', options: [
      { label: 'Word mark', value: 'word' },
      { label: 'Design mark (logo)', value: 'design' },
      { label: 'Combination', value: 'combo' },
    ]},
    { name: 'mark_2_goods', label: 'Mark 2 — Goods / Services', type: 'textarea' },
    { name: '_h_domains', label: 'Domain & Social Handles', type: 'heading' },
    { name: 'desired_domains', label: 'Desired Domain Names', type: 'textarea', placeholder: 'acme.com, acme.ca' },
    { name: 'desired_handles', label: 'Desired Social Media Handles', type: 'textarea', placeholder: '@acme on Instagram, LinkedIn, X' },
  ],
}

export const form12: FormDefinition = {
  id: 'digital-assets',
  number: 12,
  title: 'Digital Assets Transfer',
  shortTitle: 'Digital Assets',
  phase: 3,
  phaseName: 'Brand & IP Protection',
  description: 'Inventory of domains, cloud accounts, repos, and social accounts to transfer.',
  fields: [
    { name: 'corp_name', label: 'Corporation Name', type: 'text', required: true },
    { name: '_h_domains', label: 'Domain Names', type: 'heading' },
    { name: 'domains', label: 'List each domain: name, registrar, expiry, current registrant (personal/corp)', type: 'textarea', required: true },
    { name: '_h_hosting', label: 'Hosting & Cloud', type: 'heading' },
    { name: 'cloud_accounts', label: 'Cloud accounts (AWS, GCP, Azure, etc.) — provider, current owner', type: 'textarea' },
    { name: 'hosting', label: 'Web hosting — provider, current account holder', type: 'textarea' },
    { name: '_h_repos', label: 'Source Code', type: 'heading' },
    { name: 'repos', label: 'Git repos (GitHub, GitLab, etc.) — URLs, org name, owner', type: 'textarea' },
    { name: '_h_appstores', label: 'App Store Accounts', type: 'heading' },
    { name: 'app_stores', label: 'Apple Developer, Google Play, etc. — current account holder', type: 'textarea' },
    { name: '_h_saas', label: 'SaaS & Productivity', type: 'heading' },
    { name: 'saas_accounts', label: 'Email, CRM, accounting, project management, design tools — current holder', type: 'textarea' },
    { name: '_h_social', label: 'Social Media', type: 'heading' },
    { name: 'social_accounts', label: 'LinkedIn, Instagram, X, YouTube, etc. — handles and current owner', type: 'textarea' },
  ],
}

// ─── Phase 4: Operations ─────────────────────────────────

export const form17: FormDefinition = {
  id: 'banking-ops',
  number: 17,
  title: 'Banking, CRA & Operations',
  shortTitle: 'Banking & Ops',
  phase: 4,
  phaseName: 'Operationalization',
  description: 'Bank account, CRA registrations, and operational setup details.',
  fields: [
    { name: 'corp_name', label: 'Corporation Name', type: 'text', required: true },
    { name: 'corp_access_number', label: 'Corporate Access Number', type: 'text' },
    { name: 'date_of_incorporation', label: 'Date of Incorporation', type: 'date' },
    { name: '_h_bank', label: 'Business Bank Account', type: 'heading' },
    { name: 'bank_name', label: 'Bank / Institution', type: 'text' },
    { name: 'bank_branch', label: 'Branch Location', type: 'text' },
    { name: 'account_type', label: 'Account Type', type: 'select', options: [
      { label: 'Business chequing', value: 'chequing' },
      { label: 'Business savings', value: 'savings' },
      { label: 'Both', value: 'both' },
    ]},
    { name: '_h_cra', label: 'CRA Registrations', type: 'heading' },
    { name: 'business_number', label: 'Business Number (BN) — if already assigned', type: 'text' },
    { name: 'gst_needed', label: 'GST/HST Registration Needed?', type: 'select', options: [
      { label: 'Yes — expect revenue over $30,000', value: 'yes' },
      { label: 'No — under threshold', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ]},
    { name: 'payroll_needed', label: 'Payroll Account Needed?', type: 'select', options: [
      { label: 'Yes — will have employees', value: 'yes' },
      { label: 'No — contractor-only for now', value: 'no' },
    ]},
    { name: '_h_accounting', label: 'Bookkeeping', type: 'heading' },
    { name: 'accounting_software', label: 'Preferred Accounting Software', type: 'select', options: [
      { label: 'QuickBooks', value: 'quickbooks' },
      { label: 'Xero', value: 'xero' },
      { label: 'FreshBooks', value: 'freshbooks' },
      { label: 'Other', value: 'other' },
      { label: 'No preference', value: 'none' },
    ]},
    { name: 'accountant_name', label: 'Bookkeeper / Accountant (if any)', type: 'text' },
    { name: '_h_payment', label: 'Payment Processing', type: 'heading' },
    { name: 'payment_processor', label: 'Payment Processor (Stripe, Square, etc.)', type: 'text' },
    { name: '_h_insurance', label: 'Insurance', type: 'heading' },
    { name: 'insurance_notes', label: 'Insurance needs or existing coverage', type: 'textarea', placeholder: 'General liability, D&O, professional liability, etc.' },
  ],
}

export const form18: FormDefinition = {
  id: 'founders-agreement',
  number: 18,
  title: 'Founders / Shareholders Agreement',
  shortTitle: 'Founders Agreement',
  phase: 4,
  phaseName: 'Operationalization',
  description: 'Equity split, vesting, governance, and founder departure terms.',
  fields: [
    { name: 'corp_name', label: 'Corporation Name', type: 'text', required: true },
    { name: '_h_f1', label: 'Founder 1', type: 'heading' },
    { name: 'founder_1_name', label: 'Founder 1 Full Legal Name', type: 'text', required: true },
    { name: 'founder_1_shares', label: 'Number of Shares', type: 'number', required: true },
    { name: 'founder_1_class', label: 'Share Class', type: 'text', placeholder: 'Class A Common' },
    { name: 'founder_1_pct', label: 'Ownership %', type: 'text', required: true },
    { name: '_h_f2', label: 'Founder 2', type: 'heading' },
    { name: 'founder_2_name', label: 'Founder 2 Full Legal Name', type: 'text', required: true },
    { name: 'founder_2_shares', label: 'Number of Shares', type: 'number', required: true },
    { name: 'founder_2_class', label: 'Share Class', type: 'text', placeholder: 'Class A Common' },
    { name: 'founder_2_pct', label: 'Ownership %', type: 'text', required: true },
    { name: '_h_vesting', label: 'Vesting', type: 'heading' },
    { name: 'vesting_period', label: 'Vesting Period', type: 'select', options: [
      { label: '4 years with 1-year cliff', value: '4y_1c' },
      { label: '3 years with 1-year cliff', value: '3y_1c' },
      { label: 'No vesting', value: 'none' },
      { label: 'Custom', value: 'custom' },
    ]},
    { name: 'vesting_notes', label: 'Vesting Notes / Custom Terms', type: 'textarea' },
    { name: '_h_governance', label: 'Governance', type: 'heading' },
    { name: 'board_size', label: 'Number of Directors', type: 'number' },
    { name: 'reserved_matters', label: 'Reserved Matters (require unanimous approval)', type: 'textarea', placeholder: 'New share issuance, debt over $X, sale of assets, etc.' },
    { name: '_h_noncompete', label: 'Non-Competition', type: 'heading' },
    { name: 'noncompete_period', label: 'Non-Compete Period After Departure', type: 'select', options: [
      { label: '12 months', value: '12m' },
      { label: '24 months', value: '24m' },
      { label: 'None', value: 'none' },
    ]},
    { name: 'noncompete_territory', label: 'Geographic Territory', type: 'text', placeholder: 'Alberta / Canada / North America' },
  ],
}

// ─── Phase 5: Licensing ──────────────────────────────────

export const form19: FormDefinition = {
  id: 'licensing-term-sheet',
  number: 19,
  title: 'Licensing Term Sheet',
  shortTitle: 'Term Sheet',
  phase: 5,
  phaseName: 'Licensing',
  description: 'Key terms for a proposed licensing deal.',
  fields: [
    { name: 'licensor_name', label: 'Licensor (Corporation) Name', type: 'text', required: true },
    { name: 'licensee_name', label: 'Licensee Name', type: 'text', required: true },
    { name: '_h_ip', label: 'Licensed IP', type: 'heading' },
    { name: 'licensed_ip', label: 'Describe the IP to be licensed (patents, trademarks, know-how, etc.)', type: 'textarea', required: true },
    { name: 'field_of_use', label: 'Field of Use', type: 'textarea', placeholder: 'Permitted industry, application, or market segment' },
    { name: 'territory', label: 'Territory', type: 'text', placeholder: 'Canada / North America / Worldwide' },
    { name: 'exclusivity', label: 'Exclusivity', type: 'select', required: true, options: [
      { label: 'Exclusive', value: 'exclusive' },
      { label: 'Sole (licensor retains rights)', value: 'sole' },
      { label: 'Non-exclusive', value: 'non_exclusive' },
    ]},
    { name: '_h_financial', label: 'Financial Terms', type: 'heading' },
    { name: 'upfront_fee', label: 'Upfront License Fee ($)', type: 'text' },
    { name: 'royalty_rate', label: 'Running Royalty Rate (%)', type: 'text' },
    { name: 'minimum_royalty', label: 'Minimum Annual Royalty ($)', type: 'text' },
    { name: 'milestone_payments', label: 'Milestone Payments (describe events and amounts)', type: 'textarea' },
    { name: '_h_term', label: 'Term & Termination', type: 'heading' },
    { name: 'initial_term', label: 'Initial Term (years)', type: 'text' },
    { name: 'renewal', label: 'Renewal Terms', type: 'text', placeholder: 'Automatic renewal for X-year periods / No renewal' },
    { name: 'sublicensing', label: 'Sublicensing', type: 'select', options: [
      { label: 'Permitted with prior written consent', value: 'consent' },
      { label: 'Permitted', value: 'yes' },
      { label: 'Not permitted', value: 'no' },
    ]},
    { name: 'performance_obligations', label: 'Performance Obligations / Diligence Milestones', type: 'textarea' },
    { name: '_h_improvements', label: 'Improvements', type: 'heading' },
    { name: 'improvement_ownership', label: 'Improvement Ownership', type: 'select', options: [
      { label: 'Owned by Licensee with grant-back to Licensor', value: 'licensee_grantback' },
      { label: 'Owned by Licensor', value: 'licensor' },
      { label: 'Joint ownership', value: 'joint' },
    ]},
    { name: 'additional_notes', label: 'Additional Notes or Requirements', type: 'textarea' },
  ],
}

// ─── All forms in workflow order ─────────────────────────

export const ALL_FORMS: FormDefinition[] = [
  form01, form02, form03,          // Phase 1
  form04, form05,                   // Phase 2
  form10, form12,                   // Phase 3
  form17, form18,                   // Phase 4
  form19,                           // Phase 5
]

export const PHASES = [
  { number: 1, name: 'Corporate Formation', forms: [form01, form02, form03] },
  { number: 2, name: 'IP Transfer', forms: [form04, form05] },
  { number: 3, name: 'Brand & IP Protection', forms: [form10, form12] },
  { number: 4, name: 'Operationalization', forms: [form17, form18] },
  { number: 5, name: 'Licensing', forms: [form19] },
]

export function getFormById(id: string): FormDefinition | undefined {
  return ALL_FORMS.find(f => f.id === id)
}
