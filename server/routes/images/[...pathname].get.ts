export default eventHandler((event) => {
  const { pathname } = event.context.params || {}
  return hubBlob().serve(event, pathname)
})
