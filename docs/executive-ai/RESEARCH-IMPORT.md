# Private research import contract

Staff can upload a JSON array in `/portal/admin/executive-ai/prospects`. Keep research outside the repository and outside `public/`. Import batches smaller than 30 KB (maximum 50 records per request). Stable `sourceKey` values provide idempotent imports. Re-importing updates research fields, preserving operator introduction notes and stage.

```json
[
  {
    "sourceKey": "source-sheet-stable-row-id",
    "recordType": "employer",
    "name": "Employer name from the source",
    "region": "Calgary / Alberta",
    "contactName": "Publicly researched contact",
    "contactRole": "Role as recorded in the source",
    "contactRoute": "Public business contact route",
    "sourceUrl": "https://example.com/official-source",
    "processHypothesis": "Clearly labelled discovery hypothesis",
    "evidence": [
      { "url": "https://example.com/official-source", "note": "Dated evidence and any title inconsistency" }
    ],
    "researchNotes": "Source date, qualification uncertainty and source-specific notes"
  }
]
```

`recordType` is `employer` or `channel`. Required fields are `sourceKey`, `recordType`, `name`, and an HTTP(S) `sourceUrl`. Evidence and hypothesis fields must retain uncertainty. No automatic conversion into an applicant, marketing subscriber, booking or government eligibility decision occurs.

The complete 30-employer / eight-channel research appendix was not included in the message received for this build. No seed research data is shipped. Importing should preserve original row IDs, evidence URLs and distinctions between sponsors, participants and referral channels. Research is held only in the private server-side schema and staff API.
