import { gateway } from '@ai-sdk/gateway'
import { stepCountIs } from 'ai'

export const INTELLIGENCE_MODEL = gateway('anthropic/claude-sonnet-4.6')
export const INTELLIGENCE_MAX_STEPS = stepCountIs(30)
