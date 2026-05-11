import { HiLightBulb } from 'react-icons/hi'
import { RiCodeSSlashFill } from 'react-icons/ri'
import { repository, supportLink } from 'src/config'
import { getAppVersion } from 'src/utils/Os'

export const Footer = () => {
  const appVersion = getAppVersion()
  return (
    <footer className="AppFooter">
      <a className="linkItem" href={supportLink}>
        <HiLightBulb className="linkItemIcon" /> New Feature?
      </a>
      <a
        className="linkItem"
        href={repository}
        target="_blank"
        rel="noreferrer">
        <RiCodeSSlashFill className="linkItemIcon" /> Source code
      </a>
      {appVersion && (
        <a
          className="linkItem"
          href={repository}
          target="_blank"
          rel="noreferrer">
          v{appVersion}
        </a>
      )}
    </footer>
  )
}
