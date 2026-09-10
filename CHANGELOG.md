# Changelog

All notable changes to Finance Data Converter are recorded here.

## v0.11.0 Beta — 2026-09-10

### Added

- Shared Expenses conversion from either or both supported paste-block formats.
- Per-block Paid By assignment, row selection, possible-duplicate review, and per-person selected totals.
- Session-only review editing with visibly marked rows and preserved original values.
- Canonical transaction records with source provenance and destination-independent conversion logic.
- Source-row reconciliation across converted, source-excluded, skipped, and deduplicated rows.
- Soft validation findings that distinguish review notes, skipped rows, and unsupported sources.
- Automated regression tests and GitHub checks for pushes and pull requests.
- Maintained product-direction, Shared Expenses, and delivery-backlog documentation.

### Changed

- Expense Calculator multi-file combination now removes exact duplicates found across files while retaining repeated rows within the same file.
- Conversion receipts provide a more detailed accounting and reconciliation breakdown.
- Missing or invalid dates produce non-blocking review guidance when usable rows remain.

### Privacy

- Imported financial data and session edits remain in browser memory only.
- No server, account, analytics, remote storage, or transaction persistence was added.

## v0.10.2 Beta

- Previous public beta baseline.
