# Finance Data Converter — Backlog

Status values: **Next**, **Planned**, **Explore**, **UAT**, **Done**

This is the working delivery backlog. Product boundaries and strategy remain in [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md).

## Next

### UAT-SE-001 — Complete Shared Expenses monthly UAT

Run representative monthly pastes through the enabled destination and log any real-world headers, notes, dates, payer-entry friction, duplicate behavior, or ordering issues.

## Planned

### BAT-001 — Controlled batch processing

Permit multiple files only for source profiles with explicit compatibility, account, period, ordering, and duplicate rules.

## Explore

### CFG-002 — Internal import recipes

Formalize source-to-destination rules as maintainable configuration. Do not build a general-purpose visual rule editor without a demonstrated need.

## UAT

### UAT-SE-002 — Shared Expenses refinements

Decide from real use whether to recognize occasional dates, support repeated blocks, offer configured payer choices, clean descriptions, show per-block source totals, or add month selection.

## Done

### PWA-001 — Offline and installable packaging

The HTTPS-hosted converter can be installed as a Progressive Web App and reopened offline after its application shell is cached. Browser-supported installation is surfaced in the header. Updates wait for a safe close-and-reopen instead of forcing an active financial-data session to refresh.

### CFG-001 — Local non-financial configuration

Shared Expenses can optionally remember its two Paid By names in browser-local storage. The stored object is schema-limited to those names, can be removed independently of session data, and never includes transactions, amounts, descriptions, dates, balances, or workbook contents. Additional configuration categories remain separate future decisions.

### MER-001 — Deterministic merchant normalization

Raw descriptions remain attached to canonical transactions while normalized descriptions drive output and duplicate comparison. All destinations collapse repeated whitespace; the recognized Tangerine Expense profile also removes only known trailing city/province locations. Reference codes, punctuation, unknown locations, and merchant wording are preserved, and changed descriptions display their original value during review.

### VAL-002 — Expand validation coverage

Zero amounts, ambiguous comma formatting, extra source columns, and ambiguous generic header mappings now produce non-blocking review guidance. Common decimal-comma, thousands-separator, mixed-separator, currency-symbol, and accounting-parentheses formats are covered by regression tests. Batch-period compatibility remains with BAT-001 because no safe destination rule has yet been defined.

### DUP-001 — Separate definite and possible duplicates

Exact duplicate rows found across Expense Calculator files are removed deterministically. Rows sharing the same date, direction, amount, and normalized description are retained and visibly flagged for review across standard destinations; Shared Expenses continues using amount and description because dates are normally absent.

### REL-003 — v0.11.0 Beta release alignment

Application, repository metadata, documentation, and release notes identify the current feature set as v0.11.0 Beta. Regression coverage checks that version references remain aligned.

### EDT-001 — Session-only transaction editing

Review rows can be corrected before export. Edited output fields, totals, copy/download data, canonical metadata, and Shared Expenses duplicate flags update in memory; edited rows are visibly marked and original values are retained for traceability.

### REL-002 — Reconcile source-row accounting

Every source row is categorized as converted, source-excluded, skipped, or deduplicated. The conversion receipt shows the full accounting equation and surfaces a review note if the counts do not reconcile.

### SE-001 — Shared Expenses initial destination

Two paste profiles, per-block payer assignment, ordered four-column output, row selection, subtotals, duplicate review, copy, and CSV export.

### REL-001 — Automated regression foundation

Zero-dependency synthetic-fixture tests covering recognition, canonical transactions, transformations, ordering, exclusions, validation, selection, and output.

### ARC-001 — Canonical conversion engine

Browser-independent parsing, source profiles, canonical transaction provenance, destination adaptation, and shared validation findings extracted into `converter-core.js`.

### VAL-001 — Soft validation statuses

Review notes, skipped rows, and no-output cases are distinguished. Valid selected rows remain exportable.

### CI-001 — Automatic GitHub regression checks

Run the regression suite on pushes to `main` and on pull requests.
