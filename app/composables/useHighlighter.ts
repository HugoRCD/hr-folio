import { createHighlighter, type HighlighterGeneric } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'

let highlighter: HighlighterGeneric<any, any> | null = null

let promise: Promise<HighlighterGeneric<any, any>> | null = null

export const useHighlighter = async () => {
  if (!promise) {
    promise = createHighlighter({
      langs: ['vue', 'js', 'ts', 'css', 'html', 'json', 'yaml', 'markdown', 'bash'],
      themes: ['material-theme-palenight', 'material-theme-lighter'],
      engine: createJavaScriptRegexEngine()
    })
  }
  if (!highlighter) {
    highlighter = await promise
  }

  return highlighter
}
