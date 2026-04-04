export function useListNavigation(
  items: Ref<{ url?: string, path?: string }[]>,
  searchRef: Ref<HTMLInputElement | null>,
) {
  const highlightedIndex = ref(-1)

  function isSearchFocused() {
    return searchRef.value && document.activeElement === searchRef.value
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      highlightedIndex.value = -1
      return
    }

    if (isSearchFocused()) return

    const len = items.value.length
    if (!len) return

    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault()
      highlightedIndex.value = highlightedIndex.value < len - 1 ? highlightedIndex.value + 1 : 0
    }

    if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault()
      highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : len - 1
    }

    if (e.key === 'Enter' && highlightedIndex.value >= 0) {
      const item = items.value[highlightedIndex.value]
      if (!item) return
      const href = item.url || item.path
      if (href) {
        if (href.startsWith('http')) window.open(href, '_blank')
        else navigateTo(href)
      }
    }
  }

  useEventListener('keydown', onKeydown)

  watch(items, () => {
    highlightedIndex.value = -1
  })

  return { highlightedIndex }
}
