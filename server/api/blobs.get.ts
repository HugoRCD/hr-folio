export default eventHandler(async (event) => {
  const { limit, cursor } = await getQuery(event)

  return hubBlob().list({
    limit: limit ? Number.parseInt(limit) : 10,
    cursor: cursor ? cursor : undefined
  })
})
