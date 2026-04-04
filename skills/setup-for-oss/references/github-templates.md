# GitHub templates

Adapt labels, contact links, and project-specific fields. Ensure filenames match exact names below.

## .github/ISSUE_TEMPLATE/bug-report.yml

```yml
name: Bug report
description: Report a reproducible bug
title: "bug: "
labels: [bug]
body:
  - type: textarea
    id: summary
    attributes:
      label: Summary
      description: What happened?
      placeholder: Clear and concise description of the bug.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to reproduce
      description: How can we reproduce the issue?
      placeholder: |
        1. ...
        2. ...
        3. ...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      placeholder: What did you expect to happen?
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: OS, Node version, package manager, etc.
      placeholder: |
        OS:
        Node:
        Package manager:
  - type: textarea
    id: logs
    attributes:
      label: Logs / Screenshots
      description: Paste any relevant logs or screenshots.
```

## .github/ISSUE_TEMPLATE/enhancement-request.yml

```yml
name: Enhancement request
description: Suggest an improvement to existing behavior
title: "enhancement: "
labels: [enhancement]
body:
  - type: textarea
    id: summary
    attributes:
      label: Summary
      placeholder: Describe the enhancement.
    validations:
      required: true
  - type: textarea
    id: rationale
    attributes:
      label: Rationale
      placeholder: Why is this change useful?
  - type: textarea
    id: proposal
    attributes:
      label: Proposal
      placeholder: Suggest a possible implementation approach.
```

## .github/ISSUE_TEMPLATE/feature-request.yml

```yml
name: Feature request
description: Propose a new feature
title: "feature: "
labels: [feature]
body:
  - type: textarea
    id: summary
    attributes:
      label: Summary
      placeholder: Describe the feature.
    validations:
      required: true
  - type: textarea
    id: use-case
    attributes:
      label: Use case
      placeholder: Who will use this and why?
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      placeholder: Any alternatives considered?
```

## .github/ISSUE_TEMPLATE/question.yml

```yml
name: Question
description: Ask a question about usage or behavior
title: "question: "
labels: [question]
body:
  - type: textarea
    id: question
    attributes:
      label: Question
      placeholder: Ask your question here.
    validations:
      required: true
```

## .github/pull_request_template.md

```md
## Linked issue

- Closes #<ISSUE_NUMBER>

## Summary

- What changed?

## Checklist

- [ ] Tests added or updated (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] CI passes
```

## .github/release.yml (release notes categories)

```yml
changelog:
  categories:
    - title: Breaking Changes
      labels:
        - breaking
    - title: Features
      labels:
        - feature
        - feat
    - title: Enhancements
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
        - fix
    - title: Documentation
      labels:
        - docs
    - title: Dependency Updates
      labels:
        - dependencies
```
