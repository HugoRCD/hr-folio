export type GithubToolMeta = {
  label: string
  labelActive: string
  icon: string
}

export const GITHUB_TOOL_META: Record<string, GithubToolMeta> = {
  getRepository: { label: 'Repository fetched', labelActive: 'Fetching repository', icon: 'i-simple-icons-github' },
  listBranches: { label: 'Branches listed', labelActive: 'Listing branches', icon: 'i-lucide-git-branch' },
  getFileContent: { label: 'File read', labelActive: 'Reading file', icon: 'i-lucide-file-code' },
  createBranch: { label: 'Branch created', labelActive: 'Creating branch', icon: 'i-lucide-git-branch-plus' },
  forkRepository: { label: 'Repository forked', labelActive: 'Forking repository', icon: 'i-lucide-git-fork' },
  createRepository: { label: 'Repository created', labelActive: 'Creating repository', icon: 'i-lucide-plus' },
  createOrUpdateFile: { label: 'File updated', labelActive: 'Updating file', icon: 'i-lucide-file-pen' },
  listPullRequests: { label: 'Pull requests listed', labelActive: 'Listing pull requests', icon: 'i-lucide-git-pull-request' },
  getPullRequest: { label: 'Pull request fetched', labelActive: 'Fetching pull request', icon: 'i-lucide-git-pull-request' },
  createPullRequest: { label: 'Pull request created', labelActive: 'Creating pull request', icon: 'i-lucide-git-pull-request-arrow' },
  mergePullRequest: { label: 'Pull request merged', labelActive: 'Merging pull request', icon: 'i-lucide-git-merge' },
  addPullRequestComment: { label: 'Comment posted', labelActive: 'Posting PR comment', icon: 'i-lucide-message-square-plus' },
  listIssues: { label: 'Issues listed', labelActive: 'Listing issues', icon: 'i-lucide-circle-dot' },
  getIssue: { label: 'Issue fetched', labelActive: 'Fetching issue', icon: 'i-lucide-circle-dot' },
  createIssue: { label: 'Issue created', labelActive: 'Creating issue', icon: 'i-lucide-circle-plus' },
  addIssueComment: { label: 'Comment posted', labelActive: 'Posting issue comment', icon: 'i-lucide-message-square-plus' },
  closeIssue: { label: 'Issue closed', labelActive: 'Closing issue', icon: 'i-lucide-circle-check' },
  searchCode: { label: 'Code searched', labelActive: 'Searching code', icon: 'i-lucide-search-code' },
  searchRepositories: { label: 'Repositories searched', labelActive: 'Searching repositories', icon: 'i-lucide-search' },
  listCommits: { label: 'Commits listed', labelActive: 'Listing commits', icon: 'i-lucide-git-commit-horizontal' },
  getCommit: { label: 'Commit fetched', labelActive: 'Fetching commit', icon: 'i-lucide-git-commit-horizontal' },
}

export const GITHUB_TOOL_NAMES = new Set<string>(Object.keys(GITHUB_TOOL_META))
