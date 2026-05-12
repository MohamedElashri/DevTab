import clsx from 'clsx'
import { BsArrowRight, BsFillGearFill } from 'react-icons/bs'
import { FaDatabase, FaMicrochip, FaRobot, FaServer } from 'react-icons/fa'
import { RiShieldKeyholeFill } from 'react-icons/ri'
import { TbDots, TbWorldWww } from 'react-icons/tb'
import { Tag, useRemoteConfigStore } from 'src/features/remoteConfig'
import { useUserPreferences } from 'src/stores/preferences'
import { Occupation } from '../../types'

const OCCUPATIONS: Occupation[] = [
  {
    title: 'Backend Engineer',
    value: 'backend',
    icon: BsFillGearFill,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['python', 'rust', 'golang', 'java', 'django', 'graphql'],
  },
  {
    title: 'AI / ML Engineer',
    value: 'ai',
    icon: FaRobot,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['python', 'MachineLearning', 'artificial', 'LocalLLaMA', 'datascience'],
  },
  {
    title: 'Web Developer',
    value: 'webdev',
    icon: TbWorldWww,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['javascript', 'typescript', 'reactjs', 'webdev', 'frontend', 'node'],
  },
  {
    title: 'DevOps Engineer',
    value: 'devops',
    icon: FaServer,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['golang', 'rust', 'docker', 'kubernetes', 'linux', 'devops'],
  },
  {
    title: 'Data Engineer',
    value: 'data',
    icon: FaDatabase,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['python', 'PostgreSQL', 'mongodb', 'redis', 'datascience'],
  },
  {
    title: 'Embedded / Electronics',
    value: 'embedded',
    icon: FaMicrochip,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['embedded', 'electronics', 'rust', 'cpp', 'arduino', 'FPGA'],
  },
  {
    title: 'Security Engineer',
    value: 'security',
    icon: RiShieldKeyholeFill,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['python', 'cpp', 'rust', 'cybersecurity', 'netsec', 'privacy'],
  },
  {
    title: 'Other',
    value: 'other',
    icon: TbDots,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['programming', 'technology', 'compsci', 'opensource'],
  },
]

export const HelloTab = () => {
  const {
    markOnboardingAsCompleted,
    setCardSettings,
    setCards,
    setTags,
    setOccupation,
    occupation,
  } = useUserPreferences()

  const { tags } = useRemoteConfigStore()

  const onStartClicked = () => {
    const selectedOccupation = OCCUPATIONS.find((occ) => occ.title === occupation)
    if (selectedOccupation) {
      setOccupation(selectedOccupation.value)
      setCards(
        selectedOccupation.sources.map((source, index) => ({
          id: index,
          name: source,
          type: 'supported',
        }))
      )
      const userTags = selectedOccupation.tags
        .map((tag) => {
          return tags.find((t) => t.value === tag)
        })
        .filter(Boolean) as Array<Tag>

      setTags(userTags)
      for (const source of selectedOccupation.sources) {
        setCardSettings(source, {
          language: selectedOccupation.tags[0],
          sortBy: 'published_at',
        })
      }
    }

    markOnboardingAsCompleted()
  }

  return (
    <div>
      <div className="tabHeader">
        <h1 className="tabTitle">👋 Let's set up your DevTab</h1>
        <p className="tabBody">Select your developer role to personalize your feed.</p>
      </div>
      <div className="occupations">
        {OCCUPATIONS.map((occ) => {
          return (
            <button
              key={occ.title}
              onClick={() => setOccupation(occ.title)}
              className={clsx('occupation', occupation === occ.title && 'active')}>
              <span>
                <occ.icon className="occupationIcon" />
              </span>
              <h3 className="occupationTitle">{occ.title}</h3>
            </button>
          )
        })}
      </div>
      <div className="tabFooter">
        {occupation && (
          <button className="positiveButton" onClick={onStartClicked}>
            <BsArrowRight /> Start now
          </button>
        )}
      </div>
    </div>
  )
}
