# Health files

Use these templates as starting points. Replace placeholders like `<PROJECT_NAME>`, `<ORG_NAME>`, `<REPO_URL>`, `<CONTACT_EMAIL>`, and update URLs/paths based on the repo.

## README.md (template)

```md
# <PROJECT_NAME>

[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![ci](<REPO_URL>/actions/workflows/ci.yml/badge.svg)](<REPO_URL>/actions/workflows/ci.yml)

## Features

- <Feature 1>
- <Feature 2>
- <Feature 3>

## Tech Stack

- <Runtime/Language>
- <Framework/Library>
- <Tooling>

## Getting Started

```bash
<PACKAGE_MANAGER> install
<PACKAGE_MANAGER> run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Apache-2.0. See [LICENSE](./LICENSE).
```

## CONTRIBUTING.md (template)

```md
# Contributing

Thanks for taking the time to contribute!

## Development

```bash
<PACKAGE_MANAGER> install
<PACKAGE_MANAGER> run lint
<PACKAGE_MANAGER> run test
```

## Pull Requests

- Use conventional commits (e.g., `feat: add new feature`).
- Keep PRs focused and include a clear description.
- Ensure CI passes before requesting review.
```

## CODE_OF_CONDUCT.md (Contributor Covenant)

Use the Contributor Covenant v2.1 template and update the contact email.

```md
# Contributor Covenant Code of Conduct

## Our Pledge

We pledge to make participation in our community a harassment-free experience for everyone.

## Our Standards

Examples of behavior that contributes to a positive environment include:

- Demonstrating empathy and kindness
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Trolling, insulting or derogatory comments
- Public or private harassment

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards.

## Scope

This Code of Conduct applies within all community spaces.

## Enforcement

Instances of abusive behavior may be reported by contacting <CONTACT_EMAIL>.

## Attribution

This Code of Conduct is adapted from the Contributor Covenant, version 2.1.
```

## LICENSE

Default to Apache-2.0 unless the user specifies another license. Use the standard Apache 2.0 text.

## SECURITY.md (template)

```md
# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| Latest | ✅ |

## Reporting a Vulnerability

Please report security issues to <CONTACT_EMAIL>.

We follow responsible disclosure and will provide updates as we investigate.
```

## .github/funding.yml (template)

```yml
github: [<GITHUB_SPONSOR_USERNAME>]
```
