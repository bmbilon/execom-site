-- ═══════════════════════════════════════════════════════════════
-- 012 — Extend artifact_type enum for trademark document types
--
-- Migration 011 added trademark_clearance_report_docx and
-- trademark_filing_record_docx. This adds the remaining types
-- needed by the trademark document generator.
-- ═══════════════════════════════════════════════════════════════

alter type artifact_type add value if not exists 'trademark_filing_summary_ca_docx';
alter type artifact_type add value if not exists 'trademark_filing_summary_us_docx';
alter type artifact_type add value if not exists 'trademark_goods_schedule_docx';
alter type artifact_type add value if not exists 'trademark_owner_sheet_docx';
