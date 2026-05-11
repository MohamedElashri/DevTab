import clsx from 'clsx'
import { AiFillMobile, AiFillSecurityScan } from 'react-icons/ai'
import { BsArrowRight, BsFillGearFill } from 'react-icons/bs'
import { FaDatabase, FaPaintBrush, FaRobot, FaServer } from 'react-icons/fa'
import { RiDeviceFill } from 'react-icons/ri'
import { TbDots } from 'react-icons/tb'
import { Tag, useRemoteConfigStore } from 'src/features/remoteConfig'
import { useUserPreferences } from 'src/stores/preferences'
import { Occupation } from '../../types'

const OCCUPATIONS: Occupation[] = [
  {
    title: 'Front-End Engineer',
    value: 'frontend',
    icon: FaPaintBrush,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['frontend', 'javascript', 'typescript', 'css', 'react', 'vue.js', 'angularjs'],
  },
  {
    title: 'Back-End Engineer',
    value: 'backend',
    icon: BsFillGearFill,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['backend', 'go', 'php', 'ruby', 'rust', 'r'],
  },
  {
    title: 'Full Stack Engineer',
    icon: RiDeviceFill,
    value: 'fullstack',
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['webdev', 'javascript', 'typescript', 'php', 'devops'],
  },
  {
    title: 'Mobile',
    value: 'mobile',
    icon: AiFillMobile,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: [
      'mobile',
      'android',
      'kotlin',
      'java',
      'ios',
      'swift',
      'objectivec',
      'react native',
      'flutter',
    ],
  },
  {
    title: 'Devops Engineer',
    value: 'devops',
    icon: FaServer,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['devops', 'kubernetes', 'docker', 'bash'],
  },
  {
    title: 'Data Engineer',
    value: 'data',
    icon: FaDatabase,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['data science', 'python', 'artificial intelligence', 'machine learning'],
  },
  {
    title: 'Security Engineer',
    value: 'security',
    icon: AiFillSecurityScan,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['security', 'cpp', 'bash', 'python'],
  },
  {
    title: 'ML Engineer',
    value: 'ai',
    icon: FaRobot,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['artificial intelligence', 'machine learning', 'python'],
  },
  {
    title: 'Other',
    value: 'other',
    icon: TbDots,
    sources: ['github', 'hackernews', 'lobsters', 'reddit'],
    tags: ['webdev', 'mobile'],
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
        <h1 className="tabTitle">👋 Let’s set up your Hackertab</h1>
        <p className="tabBody">Select your developer role 👨🏻‍💻 to personalize your Hackertab.</p>
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
