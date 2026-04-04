import { defineServerAuth } from '@onmax/nuxt-better-auth/config'

export default defineServerAuth(({ runtimeConfig }) => ({
  user: {
    additionalFields: {
      githubUsername: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: runtimeConfig.github?.clientId as string,
      clientSecret: runtimeConfig.github?.clientSecret as string,
      scope: ['repo', 'read:user', 'user:email'],
      mapProfileToUser: (profile: { login?: string }) => ({
        githubUsername: typeof profile.login === 'string' ? profile.login : undefined,
      }),
      overrideUserInfoOnSignIn: true,
    },
  },
}))
