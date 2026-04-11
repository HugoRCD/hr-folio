import { generateText } from 'ai'
import { INTELLIGENCE_MODEL } from './config'

export async function processReport(
  data: string,
  instructions: string,
): Promise<string> {
  'use step'

  const result = await generateText({
    model: INTELLIGENCE_MODEL,
    system: 'You are an intelligence analyst. Process the provided data according to the instructions. Be thorough, insightful, and well-structured.',
    prompt: `## Data\n\n${data}\n\n## Instructions\n\n${instructions}`,
  })
  return result.text
}
