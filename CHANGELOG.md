# Synthik TypeScript SDK Changelog

## 0.2.0
- Added `apiVersion` option (v1 default, v2 recommended) with console warnings for v1.
- Added explicit `v1Generate` / `v2Generate` methods for Tabular and Text clients.
- Backward compatible `generate()` delegates to selected version.
- Refer to root MIGRATION.md for API changes and v1 sunset.
- Added `authClient()` with registration/login/token lifecycle helpers (v2 primary, v1 deprecated helpers retain warnings).

## 0.1.0
- Initial release.
