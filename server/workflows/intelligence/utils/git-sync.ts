const REPO_OWNER = 'HugoRCD'
const REPO_NAME = 'hr-intelligence'

export async function syncToGit(folder: string, filename: string, content: string): Promise<void> {
  'use step'

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn('[intelligence] GITHUB_TOKEN not set, skipping git sync')
    return
  }

  const filePath = `${folder}/${filename}.md`
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`
  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let sha: string | undefined
  try {
    const existing = await fetch(apiUrl, { headers })
    if (existing.ok) {
      const data = await existing.json() as { sha: string };
      ({ sha } = data)
    }
  } catch {
    // File doesn't exist yet
  }

  const body: Record<string, string> = {
    message: `intelligence: ${filePath}`,
    content: Buffer.from(content, 'utf-8').toString('base64'),
  }
  if (sha) body.sha = sha

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[intelligence] Git sync failed (${response.status}): ${error}`)
  }
}
