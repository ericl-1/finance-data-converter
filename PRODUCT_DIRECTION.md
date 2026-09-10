# Finance Data Converter — Product Direction

Status: Agreed direction  
Primary audience: The owner's personal finance workflow  
Planning horizon: Interim tool before a comprehensive finance application

## Product role

Finance Data Converter is a local-first financial data preparation and reconciliation utility. It turns institution-specific exports into trusted, workbook-ready inputs while keeping the recurring monthly workflow fast and easy to verify.

The active direction combines:

- **A — Hardened Converter:** make the existing conversion workflow exceptionally reliable, testable, diagnosable, accessible, and resilient to source-format changes.
- **B — Local Finance Preparation Workbench:** add focused preparation and review capabilities that materially reduce manual cleanup without creating a persistent financial record system.

Selected elements of **C — Configurable Conversion Platform** may be considered later when configurability clearly reduces maintenance or enables useful reuse. Configurable internals are more important than exposing a general-purpose rule builder.

The primary measure of success is recurring monthly time saved without reducing confidence in the converted data.

## Strategic boundary

The converter owns everything needed to:

- ingest source files or pasted rows;
- recognize supported source structures;
- normalize source records;
- transform records for a known destination;
- review and selectively include records;
- reconcile counts and totals;
- validate inputs and outputs; and
- export data into another system.

The converter does **not** own:

- long-term financial or transaction storage;
- budgeting or account balances;
- dashboards, analysis, or reporting;
- account aggregation or bank APIs;
- user accounts; or
- cloud or multi-device synchronization.

A useful scope test is: if a capability improves preparing data for another destination, it probably belongs here. If its value depends on retaining transactions and interpreting the user's finances over time, it belongs in the future finance application.

## Context shaping the roadmap

- The workflow normally runs monthly and is currently time-consuming.
- The recurring pain is collecting data from multiple sources, then cleaning, manipulating, validating, and entering it into multiple workbooks.
- Known bank-export formats appear relatively stable, but recognition remains profile-based and must fail safely when a structure changes.
- The primary audience remains the owner; broad market requirements are not a current driver.
- The eventual finance application is expected to replace the complex workbooks and provide reporting, visuals, and exports.
- Import, normalization, validation, and source-profile logic developed here should be structured so it can potentially be reused by that future application.

## Priorities

Implementation status and the ordered working queue are maintained in [BACKLOG.md](BACKLOG.md).

### 1. Finish Shared Expenses

**Initial implementation complete; monthly UAT remains.** Complete the original four-destination workflow before widening the product. See [SHARED_EXPENSES.md](SHARED_EXPENSES.md).

### 2. Harden reliability and architecture

**Foundation complete; coverage continues as formats and rules are added.**

- Add sanitized synthetic fixtures and automated regression tests for recognition, transformation, exclusions, ordering, totals, output, and failure cases.
- Move toward a canonical transaction model that separates source parsing from destination transformation.
- Formalize source profiles so recognition, parsing, cleanup, and destination rules do not become interdependent branches.
- Preserve privacy-safe diagnostics and safe failure for unsupported or ambiguous files.

### 3. Improve validation and reconciliation

**Soft validation statuses complete; source-row accounting is next.**

Prioritize confidence checks such as missing or invalid dates, unreadable or zero amounts, conflicting debit and credit values, suspicious duplicates, incompatible periods, unexpected row structures, and count or total mismatches.

### 4. Add selective workbench capabilities later

Consider these only after the four destinations and reliability foundation are sound:

- deterministic merchant normalization;
- temporary, session-only transaction editing;
- definite versus possible duplicate detection, with fuzzy matches reviewed rather than automatically removed;
- controlled batch processing for profiles where combining files is safe;
- import recipes and reusable mappings;
- locally stored non-financial preferences, aliases, mappings, and recipes; and
- PWA and offline polish.

## Persistence policy

Local persistence remains open for exploration, but the initial boundary is non-financial configuration only, such as preferences, merchant aliases, mappings, and import recipes. Do not retain imported rows, transaction history, balances, or workbook contents unless a stronger case is explicitly agreed later.

Any persistence feature should be opt-in or clearly disclosed, device-local, inspectable, and easy to clear. It must not silently weaken the current ephemeral-data privacy model.

## Explicitly deferred to the future finance application

The future application, rather than this converter, should own persistent transactions, category intelligence tied to history, budgeting, balances, reporting, charts, financial goals, account aggregation, bank connections, identities, and synchronization.

## Delivery principles

- Preserve the destination-first import → recognize → transform → review → validate → export flow.
- Prefer capabilities that help multiple destination workbooks.
- Never guess when a financial transformation is ambiguous.
- Keep examples and automated fixtures synthetic; do not commit real exports, workbook data, private screenshots, or realistic personal records.
- Treat the privacy architecture as a product feature, not merely an implementation detail.
