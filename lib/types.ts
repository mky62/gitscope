export type Step = 'initial' | 'verifying'
export type OAuthProvider = 'google' | 'github'

export type GithubUser = {
  login: string
  name?: string | null
  avatar_url?: string
  html_url?: string
  bio?: string | null
  blog?: string | null
  twitter_username?: string | null
  public_repos?: number
}

export type Repo = {
  id: number
  full_name: string
  name?: string
  html_url?: string
  stargazers_count: number
  open_issues_count?: number
  language: string | null
  pushed_at?: string
}
