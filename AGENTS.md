# hr-folio

Instructions for AI coding agents working in this repository.

<!-- evlog:start -->
## Logging with evlog

This project uses [evlog](https://evlog.dev). Follow these rules when you add or change logging.

**One wide event per operation.** A request, a job, a user action — each produces exactly one
event carrying everything about it. Not one log line per step.

- Get the request logger with `useLogger(event)` (auto-imported) inside a `server/api` handler.
- Add context as you learn it: `log.set({ user: { id, plan }, cart: { items, total } })`.
- Group related fields into objects. Never flat abbreviations like `{ uid, n, t }`.
- Never pass a raw body — `log.set({ user: body })` leaks passwords. List fields explicitly.
- Do not time anything by hand; the duration is computed when the event emits.
- `log.debug()` is for step detail and is stripped from production builds.

**Errors are structured, never bare.**

```ts
throw createError({
  message: 'Payment failed',
  status: 402,
  why: 'Card declined by the issuer',
  fix: 'Use a different payment method',
  internal: { correlationId },   // drains only — never reaches the client
})
```

Never `throw new Error(...)`. Never `console.error(e); throw e` — use `log.error(e)`.
When the same error appears in three or more places, promote it to `defineErrorCatalog()`.

**Sensitive actions get an audit trail.** Call `log.audit({ action, actor, target, outcome })`
on anything that changes permissions, money, or personal data. Audit entries are never sampled.

**Never log** passwords, tokens, API keys, full card numbers, or session JWTs. Redaction is on
in production, but it is a safety net — not a substitute for choosing the fields yourself.

Check coverage with `npx @evlog/cli map --no-write`. Diagnose setup with `npx @evlog/cli doctor`.
Deeper guidance is in the `review-logging-patterns` skill — read it before a logging change.
<!-- evlog:end -->
