export default defineNuxtPlugin(() => {
  const visited = useState<Set<string>>('visited-pages', () => new Set())
  const router = useRouter()

  router.beforeEach((to) => {
    if (visited.value.has(to.path)) {
      document.documentElement.classList.add('revisit')
    } else {
      document.documentElement.classList.remove('revisit')
    }
  })

  router.afterEach((to) => {
    visited.value.add(to.path)
  })
})
