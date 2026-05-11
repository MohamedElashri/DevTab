import { useQuery } from '@tanstack/react-query'
import { ExtractFnReturnType, QueryConfig } from 'src/lib/react-query'
import { Repository } from 'src/types'

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

const getRepos = async ({
  tags,
  dateRange,
}: {
  tags: string[]
  dateRange: string
}): Promise<Repository[]> => {
  const daysMap: Record<string, number> = { daily: 1, weekly: 7, monthly: 30 }
  const days = daysMap[dateRange] || 7
  const since = getDateString(days)

  // Only use single-word tags as GitHub languages; skip multi-word tags
  const validLangTags = tags.filter((t) => t && t !== 'global' && !t.includes(' '))
  const lang = validLangTags.map((t) => `language:${t}`).join(' ')
  const q = lang ? `created:>${since} ${lang}` : `created:>${since}`

  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=50`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
    }
  )
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }
  const data = await res.json()
  return (data.items || []).map((item: any) => ({
    id: String(item.id),
    url: item.html_url,
    title: item.full_name,
    tags: [item.language || 'unknown'],
    comments_count: item.open_issues_count || 0,
    points_count: item.stargazers_count || 0,
    image_url: '',
    published_at: new Date(item.created_at).getTime(),
    description: item.description || '',
    technology: item.language || 'unknown',
    stars_count: item.stargazers_count || 0,
    source: 'github',
    owner: item.owner?.login || '',
    forks_count: item.forks_count || 0,
    stars_in_range: item.stargazers_count || 0,
    name: item.name || '',
  }))
}

type QueryFnType = typeof getRepos

type UseGetReposOptions = {
  config?: QueryConfig<QueryFnType>
  tags: string[]
  dateRange: 'daily' | 'monthly' | 'weekly'
}

export const useGetGithubRepos = ({ config, tags, dateRange }: UseGetReposOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['github_v2', ...tags, dateRange],
    queryFn: () => getRepos({ tags, dateRange }),
  })
}
