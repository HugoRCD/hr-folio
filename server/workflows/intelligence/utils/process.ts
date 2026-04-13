import { generateText } from 'ai'
import { INTELLIGENCE_MODEL } from './config'

export async function processReport(
  data: string,
  instructions: string,
): Promise<string> {
  'use step'

  const result = await generateText({
    model: INTELLIGENCE_MODEL,
    system: [
      'You are an intelligence analyst. Process the provided data according to the instructions. Be thorough, insightful, and well-structured.',
      '',
      'When producing summaries or narratives, emphasize work that is currently active or recently touched (roughly the last three weeks in the data). Do not give equal weight to repositories or initiatives that appear abandoned or irrelevant to the period — mention them only if the data shows they matter for the requested window.',
    ].join('\n'),
    prompt: `## Data\n\n${data}\n\n## Instructions\n\n${instructions}`,
  })
  return result.text
}
