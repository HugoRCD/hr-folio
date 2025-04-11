import { z } from 'zod'

export default eventHandler(async (event) => {
  const { limit, cursor } = await getValidatedQuery(event, z.object({
    limit: z.string().optional(),
    cursor: z.string().optional()
  }).parse)

  return hubBlob().list({
    limit: limit ? +limit : 10,
    cursor: cursor ? cursor : undefined
  })
})
