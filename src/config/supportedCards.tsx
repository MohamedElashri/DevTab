import { FaReddit } from 'react-icons/fa'
import { SiGithub, SiYcombinator } from 'react-icons/si'
import LobstersIcon from 'src/assets/icon_lobsters.png'
import { SupportedCardType } from 'src/types'
import { lazyImport } from 'src/utils/lazyImport'
const { GithubCard } = lazyImport(() => import('src/features/cards'), 'GithubCard')
const { HackernewsCard } = lazyImport(() => import('src/features/cards'), 'HackernewsCard')
const { LobstersCard } = lazyImport(() => import('src/features/cards'), 'LobstersCard')
const { RedditCard } = lazyImport(() => import('src/features/cards'), 'RedditCard')

export const SUPPORTED_CARDS: SupportedCardType[] = [
  {
    value: 'github',
    analyticsTag: 'github',
    label: 'Github repositories',
    component: GithubCard,
    icon: <SiGithub className="blockHeaderWhite" />,
    link: 'https://github.com/',
    type: 'supported',
  },
  {
    value: 'hackernews',
    icon: <SiYcombinator color="#FB6720" />,
    analyticsTag: 'hackernews',
    label: 'Hackernews',
    component: HackernewsCard,
    link: 'https://news.ycombinator.com/',
    type: 'supported',
  },
  {
    value: 'reddit',
    icon: <FaReddit color="#FF4500" />,
    analyticsTag: 'reddit',
    label: 'Reddit',
    component: RedditCard,
    link: 'https://reddit.com/',
    type: 'supported',
  },
  {
    value: 'lobsters',
    icon: <img alt="lobsters" src={LobstersIcon} />,
    analyticsTag: 'lobsters',
    label: 'Lobsters',
    component: LobstersCard,
    link: 'https://lobste.rs/',
    type: 'supported',
  },
]
