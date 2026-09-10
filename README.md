# Finance Data Converter

A small, local-first browser tool for converting supported Canadian banking exports into workbook-ready CSV or tab-separated rows.

## Use

Open `index.html` in a modern browser, choose the destination workbook, and import or paste source data. Review the conversion and then copy the workbook-ready rows or download the converted CSV.

No installation, account, database, or server is required.

## Privacy

Imported files are read and transformed in browser memory. The application contains no analytics, network requests, remote storage, or upload service. Closing or refreshing the page clears the working data.

If you deploy a modified version, review any additions carefully: external scripts, analytics, fonts, APIs, or error-reporting services can change these privacy properties.

## Supported compatibility profiles

The current version includes compatibility profiles for selected exports from:

- TD
- Tangerine
- Desjardins

Support is based on the structure of specific export formats and is not a guarantee that every account or export variant will work. TD, Tangerine, Desjardins, and their associated marks belong to their respective owners. This project is not affiliated with, endorsed by, or sponsored by those institutions.

## Security

The included page uses a restrictive Content Security Policy and does not load remote resources. Static hosting is recommended. HTTPS should be enabled by the hosting provider.

## Testing

Run the zero-dependency regression suite with `npm test`. The tests execute the same conversion engine used by `index.html` against synthetic fixtures and cover source recognition, canonical transactions, destination output, exclusions, ordering, duplicate warnings, selection totals, and unsupported inputs.

Financial exports and workbook contents must not be used as fixtures. Add only synthetic examples that preserve the source structure needed for the regression.

## Architecture

`converter-core.js` contains the source parsing, profile recognition, canonical transaction model, validation findings, and destination adaptation logic. It has no browser UI dependency and is consumed by both `index.html` and the automated tests.

Canonical transactions retain the original and normalized descriptions, signed amount, direction, source profile, source filename and row, review status, warnings, and destination-specific metadata. The browser page owns only session state, interaction, preview, selection, editing, receipts, and export presentation.

Rows can be edited during review. Changes affect only the current browser session and its copy/download output, edited rows are marked, and original output values remain attached to the row for traceability. Refreshing or closing the page clears the edits with the rest of the working data.

## Validation behavior

Validation preserves usable work. Missing dates, zero amounts, unusual currency interpretation, extra source columns, ambiguous generic header mappings, unexpected Shared Expenses negative amounts, and possible duplicates are review notes. Unreadable or conflicting individual rows are skipped with an explanation while valid rows remain exportable. Unsupported sources produce no output rather than guessed output.

Exact duplicate rows found across combined Expense Calculator files are removed. Other likely duplicates are retained and flagged using date, direction, amount, and normalized description so the user can keep or exclude them. Shared Expenses uses amount and description because its normal inputs do not include dates.

Copy and download stay available whenever at least one valid row is selected. The review panel and conversion receipt report review notes and skipped rows separately. The receipt also reconciles every imported row as converted, source-excluded, skipped, or deduplicated and flags any accounting mismatch for review.

## Product direction

The agreed product boundary, priorities, and longer-term direction are recorded in [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md). Current delivery status is maintained in [BACKLOG.md](BACKLOG.md), release history is recorded in [CHANGELOG.md](CHANGELOG.md), and Shared Expenses requirements and UAT questions are tracked in [SHARED_EXPENSES.md](SHARED_EXPENSES.md).

## Version

Current development beta: `v0.11.0 Beta`

## License

Copyright © 2026. All rights reserved. See [LICENSE](LICENSE).
