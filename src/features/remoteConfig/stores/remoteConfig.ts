import { create } from 'zustand'

import { persist } from 'zustand/middleware'
import { RemoteConfig, Tag } from '../types'

type RemoteConfigStore = {
  tags: Tag[]
  setRemoteConfig: (remoteConfig: RemoteConfig) => void
}

const DEFAULT_TAGS: Tag[] = [
  { value: 'javascript', label: 'Javascript', category: 'frontend' },
  { value: 'typescript', label: 'Typescript', category: 'frontend' },
  { value: 'python', label: 'Python', category: 'backend' },
  { value: 'go', label: 'Go', category: 'backend' },
  { value: 'rust', label: 'Rust', category: 'backend' },
  { value: 'java', label: 'Java', category: 'backend' },
  { value: 'cpp', label: 'C++', category: 'backend' },
  { value: 'csharp', label: 'C#', category: 'backend' },
  { value: 'php', label: 'PHP', category: 'backend' },
  { value: 'ruby', label: 'Ruby', category: 'backend' },
  { value: 'swift', label: 'Swift', category: 'mobile' },
  { value: 'kotlin', label: 'Kotlin', category: 'mobile' },
  { value: 'react', label: 'React', category: 'frontend' },
  { value: 'vue.js', label: 'Vue.js', category: 'frontend' },
  { value: 'angularjs', label: 'Angular', category: 'frontend' },
  { value: 'css', label: 'CSS', category: 'frontend' },
  { value: 'html', label: 'HTML', category: 'frontend' },
  { value: 'node.js', label: 'Node.js', category: 'backend' },
  { value: 'docker', label: 'Docker', category: 'devops' },
  { value: 'kubernetes', label: 'Kubernetes', category: 'devops' },
  { value: 'aws', label: 'AWS', category: 'devops' },
  { value: 'linux', label: 'Linux', category: 'devops' },
  { value: 'git', label: 'Git', category: 'devops' },
  { value: 'sql', label: 'SQL', category: 'data' },
  { value: 'postgresql', label: 'PostgreSQL', category: 'data' },
  { value: 'mongodb', label: 'MongoDB', category: 'data' },
  { value: 'redis', label: 'Redis', category: 'data' },
  { value: 'machine learning', label: 'Machine Learning', category: 'ai' },
  { value: 'artificial intelligence', label: 'Artificial Intelligence', category: 'ai' },
  { value: 'data science', label: 'Data Science', category: 'data' },
  { value: 'security', label: 'Security', category: 'security' },
  { value: 'blockchain', label: 'Blockchain', category: 'blockchain' },
  { value: 'webdev', label: 'Web Development', category: 'frontend' },
  { value: 'mobile', label: 'Mobile', category: 'mobile' },
  { value: 'devops', label: 'DevOps', category: 'devops' },
  { value: 'backend', label: 'Backend', category: 'backend' },
  { value: 'frontend', label: 'Frontend', category: 'frontend' },
  { value: 'fullstack', label: 'Full Stack', category: 'fullstack' },
]

export const useRemoteConfigStore = create(
  persist<RemoteConfigStore>(
    (set) => ({
      tags: DEFAULT_TAGS,
      setRemoteConfig: (remoteConfig: RemoteConfig) =>
        set({
          tags: remoteConfig.tags.length ? remoteConfig.tags : DEFAULT_TAGS,
        }),
    }),
    {
      name: 'remote_config_storage',
      version: 4,
      migrate: (state: unknown) => {
        return { ...(state as RemoteConfigStore), tags: DEFAULT_TAGS } as RemoteConfigStore
      },
    }
  )
)
