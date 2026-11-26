// /things as Markdown, for agents: add .md to the page's address and get the whole inventory.
export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return thingsMarkdown(await thingsCatalog(event))
})
