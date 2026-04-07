# Changelog

[🇭🇺 Magyar verzió](./CHANGELOG_HU.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.5] - 2026-04-07

### Fixed

- Dev plugin loader: allow `host.docker.internal` URLs for Docker-hosted ElyOS instances
- Dev plugin loader: browser receives `localhost` URL (converted from `host.docker.internal`) so the plugin loads correctly from both server and client side
- Dev plugin window now gets focus after async loading completes
- Dev plugin loader UI strings are now fully localized (i18n keys, Docker hint added)

### Added

- New translation keys for the Dev Plugin Loader panel (hu/en)

## [0.1.0] - 2026-03-07

### Added

- Initial public release of ElyOS
- Full desktop environment in the browser with window management, taskbar, and start menu
- Built-in applications: Settings, Users, Log, Plugin Manager, Chat, Notifications, Help
- Plugin system with WebOS SDK for third-party app development _(in development)_
- Authentication system with email/password, OTP, Google sign-in, and 2FA (TOTP)
- Database-backed internationalization (i18n) with runtime locale switching
- Real-time chat via Socket.IO
- Dark/Light mode support
- Docker Compose setup for self-hosting
- Comprehensive documentation and troubleshooting guides

### Documentation

- Configuration guide for environment variables
- Troubleshooting guide for common setup issues (English and Hungarian)
- Contributing guide
- Project structure documentation
