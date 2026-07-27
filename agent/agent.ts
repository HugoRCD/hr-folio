import { defineAgent } from 'eve'

/**
 * `claude-sonnet-5` is currently the best power/cost ratio on the Gateway for
 * this agent: cheaper than `sonnet-4.6` ($2/$10 per M tokens vs $3/$15) with a
 * 1M context window and extended-thinking support. `opus-5` is the strictly
 * "most powerful" option (2.5x the price) but overkill for GitHub triage/PR
 * work — bump to it manually if a task needs the extra reasoning.
 *
 * Fallbacks only kick in if the primary model errors out, not for cost
 * reasons, so they stay on equally-capable models rather than degrading to
 * something cheap and worse.
 */
const MODEL = 'anthropic/claude-sonnet-5'
const FALLBACK_MODELS = ['anthropic/claude-sonnet-4.6', 'google/gemini-3.6-flash']

export default defineAgent({
  model: MODEL,
  modelOptions: {
    providerOptions: {
      gateway: {
        // Every model above has a Gateway-side ZDR agreement (verified live
        // against this account); `openai/*` does not, which is why it's
        // absent from the fallback chain — a ZDR request to it errors
        // outright (no_providers_available) instead of degrading.
        // Free on Pro/Enterprise per-request (vs. $0.10/1k for team-wide).
        zeroDataRetention: true,
        models: FALLBACK_MODELS,
        tags: ['app:personal-github-agent'],
      },
      // `claude-sonnet-5` only understands the newer adaptive-thinking shape
      // (`type: 'enabled'` + `budgetTokens` is Claude 4.6-and-earlier only and
      // errors out on 5, which was silently burning the fallback chain on
      // every single call — verified live against this Gateway account).
      // `effort: 'medium'` keeps thinking tokens (billed as output) bounded
      // for a GitHub-triage agent; bump per-call if a task needs more depth.
      anthropic: {
        thinking: { type: 'adaptive', effort: 'medium', display: 'summarized' },
      },
    },
  },
  // TODO(eve-connect-bundle): drop once eve externalizes @vercel/connect for the
  // connect/eve subpath upstream — see @github-tools/sdk/connect docs.
  build: {
    externalDependencies: ['@vercel/connect'],
  },
})
