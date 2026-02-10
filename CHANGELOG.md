# 📝 Changelog

All notable changes to this project will be documented in this file.  
This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## [Release Version] - _title/description_

### Added

-

### Changed

-

### Fixed

-

### Removed

-

### Added (Testing)

### Notes

-

- ***

---

## [2.1.1] - Update readme using dummy name 


### Changed

- Update readme file to use dummy name.

---

## [2.1.0] - PR Mentions & Rate Limiting

### Added

- **PR Mentions**: Automatically mention PR authors and reviewers on Discord
  - Mention PR author when someone else acts on their PR
  - Mention requested reviewers when review is requested
  - Support all PR-related events (reviews, comments, status changes)
  - Skip self-actions (no mention when actor is the same as target)
- **ENV-based User Mapping**: GitHub username → Discord User ID mapping via environment variables
  - Format: `DISCORD_USER_<GITHUB_USERNAME>=<discord_user_id>`
  - Case-insensitive GitHub username matching
- **Rate Limiting**: Built-in DoS protection with `express-rate-limit`
  - Default: 100 requests per 15 minutes per IP
  - Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` env vars
  - Standard rate limit headers in responses
- **E2E Tests**: Comprehensive end-to-end tests for PR mentions and rate limiter
- **Unit Tests**: Added unit tests for mention utilities, PR mention logic, and logging
- **New Utils Modules**:
  - `src/utils/pr-mention.ts` - PR mention extraction and logic
  - `src/utils/webhook-logger.ts` - Centralized logging utilities
  - `src/utils/mention.ts` - Discord mention generation

### Changed

- Refactored webhook handler to use modular utilities
- Updated GitHub types to include PR author in review payloads
- Improved code organization and testability

### Notes

- This version adds significant new functionality without breaking changes
- Migration guide: Add `DISCORD_USER_*` environment variables for PR mentions

---

## [2.0.0] - Project restructure

### Added

- Jest framework for both e2e and unit testing
- Plugged **commitizen** into the project

### Notes

- MAJOR CHANGES

---

## [1.0.0] - Initial setup

### Added

- Initial release of **webhook-integration**

---

### Notes

- Use **semantic versioning**: `MAJOR.MINOR.PATCH` (e.g., 1.0.0 → 1.1.0 → 1.1.1)
- Bootstrapped the ng-core project
- Always add the newest version **on top** of the file.

---
