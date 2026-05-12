import { create } from 'zustand'

import { persist } from 'zustand/middleware'
import { RemoteConfig, Tag } from '../types'

type RemoteConfigStore = {
  tags: Tag[]
  setRemoteConfig: (remoteConfig: RemoteConfig) => void
}

const DEFAULT_TAGS: Tag[] = [
  // Languages (GitHub language filter + Reddit subreddit)
  { value: 'python', label: 'Python', category: 'languages' },
  { value: 'rust', label: 'Rust', category: 'languages' },
  { value: 'golang', label: 'Go', category: 'languages' },
  { value: 'java', label: 'Java', category: 'languages' },
  { value: 'cpp', label: 'C++', category: 'languages' },
  { value: 'kotlin', label: 'Kotlin', category: 'languages' },
  { value: 'swift', label: 'Swift', category: 'languages' },
  { value: 'ruby', label: 'Ruby', category: 'languages' },
  { value: 'php', label: 'PHP', category: 'languages' },
  { value: 'zig', label: 'Zig', category: 'languages' },
  { value: 'lua', label: 'Lua', category: 'languages' },
  { value: 'scala', label: 'Scala', category: 'languages' },
  { value: 'elixir', label: 'Elixir', category: 'languages' },
  // AI / ML (Reddit subreddits)
  { value: 'MachineLearning', label: 'Machine Learning', category: 'ai' },
  { value: 'artificial', label: 'Artificial Intelligence', category: 'ai' },
  { value: 'LocalLLaMA', label: 'Local LLMs', category: 'ai' },
  { value: 'deeplearning', label: 'Deep Learning', category: 'ai' },
  { value: 'datascience', label: 'Data Science', category: 'ai' },
  { value: 'computervision', label: 'Computer Vision', category: 'ai' },
  { value: 'chatgpt', label: 'ChatGPT / LLMs', category: 'ai' },
  { value: 'singularity', label: 'AI News', category: 'ai' },
  { value: 'nlp', label: 'NLP', category: 'ai' },
  // Backend (Reddit subreddits)
  { value: 'django', label: 'Django', category: 'backend' },
  { value: 'graphql', label: 'GraphQL', category: 'backend' },
  { value: 'laravel', label: 'Laravel', category: 'backend' },
  { value: 'springboot', label: 'Spring Boot', category: 'backend' },
  // Databases (Reddit subreddits)
  { value: 'PostgreSQL', label: 'PostgreSQL', category: 'databases' },
  { value: 'mongodb', label: 'MongoDB', category: 'databases' },
  { value: 'redis', label: 'Redis', category: 'databases' },
  { value: 'sqlite', label: 'SQLite', category: 'databases' },
  { value: 'mysql', label: 'MySQL', category: 'databases' },
  // Infrastructure (Reddit subreddits)
  { value: 'docker', label: 'Docker', category: 'infrastructure' },
  { value: 'kubernetes', label: 'Kubernetes', category: 'infrastructure' },
  { value: 'aws', label: 'AWS', category: 'infrastructure' },
  { value: 'linux', label: 'Linux', category: 'infrastructure' },
  { value: 'devops', label: 'DevOps', category: 'infrastructure' },
  { value: 'terraform', label: 'Terraform', category: 'infrastructure' },
  { value: 'homelab', label: 'Homelab', category: 'infrastructure' },
  // Web Development (Reddit subreddits)
  { value: 'webdev', label: 'Web Dev', category: 'webdev' },
  { value: 'web_design', label: 'Web Design', category: 'webdev' },
  { value: 'javascript', label: 'JavaScript', category: 'webdev' },
  { value: 'typescript', label: 'TypeScript', category: 'webdev' },
  { value: 'reactjs', label: 'React', category: 'webdev' },
  { value: 'vuejs', label: 'Vue.js', category: 'webdev' },
  { value: 'angular', label: 'Angular', category: 'webdev' },
  { value: 'sveltejs', label: 'Svelte', category: 'webdev' },
  { value: 'node', label: 'Node.js', category: 'webdev' },
  { value: 'css', label: 'CSS', category: 'webdev' },
  { value: 'frontend', label: 'Frontend', category: 'webdev' },
  // Embedded / Electronics (Reddit subreddits)
  { value: 'embedded', label: 'Embedded', category: 'embedded' },
  { value: 'electronics', label: 'Electronics', category: 'embedded' },
  { value: 'arduino', label: 'Arduino', category: 'embedded' },
  { value: 'FPGA', label: 'FPGA', category: 'embedded' },
  { value: 'raspberry_pi', label: 'Raspberry Pi', category: 'embedded' },
  { value: 'microcontrollers', label: 'Microcontrollers', category: 'embedded' },
  { value: 'PrintedCircuitBoard', label: 'PCB Design', category: 'embedded' },
  { value: 'AskElectronics', label: 'Ask Electronics', category: 'embedded' },
  // Topics (Reddit subreddits)
  { value: 'programming', label: 'Programming', category: 'topics' },
  { value: 'technology', label: 'Technology', category: 'topics' },
  { value: 'compsci', label: 'Computer Science', category: 'topics' },
  { value: 'opensource', label: 'Open Source', category: 'topics' },
  // Security (Reddit subreddits)
  { value: 'cybersecurity', label: 'Cybersecurity', category: 'security' },
  { value: 'netsec', label: 'Network Security', category: 'security' },
  { value: 'privacy', label: 'Privacy', category: 'security' },
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
      version: 5,
      migrate: (state: unknown) => {
        return { ...(state as RemoteConfigStore), tags: DEFAULT_TAGS } as RemoteConfigStore
      },
    }
  )
)
