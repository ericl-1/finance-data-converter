# Changelog

All notable changes to Finance Data Converter are recorded here.

## Unreleased

### Added

- Installable Progressive Web App packaging with branded icons and offline launch after the first online visit.
- A browser-supported **Install app** action and a soft notice when an update is ready for the next relaunch.
- Non-blocking review guidance for zero amounts, ambiguous comma interpretation, extra source columns, and ambiguous generic header mappings.
- Possible-duplicate review across Budget Tracker, Savings, and Expense Calculator using date, direction, amount, and normalized description.
- Conservative merchant normalization with visible original descriptions when output changes.
- Optional browser-local storage for the two Shared Expenses Paid By names, with an independent forget action.

### Changed

- App updates wait for all converter windows to close instead of forcing a refresh during an active session.
- The hosted app always exposes installation guidance, including when a browser does not provide a native installation prompt event.
- Online page launches check for the newest deployed interface while retaining a cached fallback for offline launches.
- Comma-only amounts now distinguish common decimal-comma values from thousands-separated values.
- Possible duplicates remain selected and exportable until the user chooses to exclude them.

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
