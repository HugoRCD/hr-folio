import { defineAgent } from 'eve'

export default defineAgent({
  model: 'anthropic/claude-sonnet-5',
  // TODO(eve-connect-bundle): drop once eve externalizes @vercel/connect for the
  // connect/eve subpath upstream — see @github-tools/sdk/connect docs.
  build: {
    externalDependencies: ['@vercel/connect'],
  },
})
