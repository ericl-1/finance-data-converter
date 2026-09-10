# Finance Data Converter

A small, local-first browser tool for converting supported Canadian banking exports into workbook-ready CSV or tab-separated rows.

## Use

Open `index.html` in a modern browser, choose the destination workbook, and import or paste source data. Review the conversion and then copy the workbook-ready rows or download the converted CSV.

No account, database, or application server is required.

## Install and offline use

When opened from GitHub Pages in a supported browser, the converter can be installed as a Progressive Web App (PWA). It is still the same web app, but it gets its own app icon and window and can reopen without an internet connection after the first successful visit.

1. Open the hosted converter while online.
2. Select **Install app** when that button appears, or use the browser's install option.
3. Open Finance Data Converter from the computer's Applications or app launcher.

The install button appears only after the browser confirms that it can open a native installation prompt. If it is not shown, use Chrome or Edge's **Install page as app** command, Safari's **Add to Dock**, or the browser's equivalent installation menu.

Updates are downloaded in the background but do not force-refresh an active conversion. Close every open converter tab or installed-app window and reopen it when the app reports that an update is ready. Working financial data is not saved through an update or relaunch.

Opening `index.html` directly remains supported for ordinary conversion. Installation and offline caching require the HTTPS-hosted version (or a local development server).

## Privacy

Imported files are read and transformed in browser memory. The application contains no analytics, remote storage, or upload service. The hosted app only retrieves its own static application files so they can be cached for offline use. Closing or refreshing the page clears the working data.

Shared Expenses has an optional device-local preference for its two Paid By names. Only those names are stored when the user enables the setting. The saved names can be forgotten separately, and transactions, amounts, descriptions, dates, balances, and workbook contents are never included in local preferences.

If you deploy a modified version, review any additions carefully: external scripts, analytics, fonts, APIs, or error-reporting services can change these privacy properties.

## Supported compatibility profiles

The current version includes compatibility profiles for selected exports from:

- TD
- Tangerine
- Desjardins

Support is based on the structure of specific export formats and is not a guarantee that every account or export variant will work. TD, Tangerine, Desjardins, and their associated marks belong to their respective owners. This project is not affiliated with, endorsed by, or sponsored by those institutions.

## Security

The included page uses a restrictive Content Security Policy and does not load third-party resources. Static hosting is recommended. HTTPS should be enabled by the hosting provider.

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

Merchant normalization is deterministic and conservative. Repeated whitespace is collapsed for every destination. The recognized Tangerine Expense profile also removes a trailing location only when it matches the app's explicit city/province list. Reference codes, punctuation, unknown locations, and merchant wording are retained. Whenever output differs, the original description remains available during review.

Copy and download stay available whenever at least one valid row is selected. The review panel and conversion receipt report review notes and skipped rows separately. The receipt also reconciles every imported row as converted, source-excluded, skipped, or deduplicated and flags any accounting mismatch for review.

## Product direction

The agreed product boundary, priorities, and longer-term direction are recorded in [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md). Current delivery status is maintained in [BACKLOG.md](BACKLOG.md), release history is recorded in [CHANGELOG.md](CHANGELOG.md), and Shared Expenses requirements and UAT questions are tracked in [SHARED_EXPENSES.md](SHARED_EXPENSES.md).

## Version

Current development beta: `v0.11.0 Beta`

## License

Copyright © 2026. All rights reserved. See [LICENSE](LICENSE).
