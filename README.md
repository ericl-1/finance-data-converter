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

## Version

Current development beta: `v0.10.0 Beta`

## License

Copyright © 2026. All rights reserved. See [LICENSE](LICENSE).
