import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout'
import { appVersion } from 'src/config'
import { TipLink } from './TipLink'
import './aboutSettings.css'

const repository = 'https://github.com/MohamedElashri/DevTab'
const projectLinks = [
  ['Project website', 'https://melashri.net/software/devtab/'],
  ['Source code', repository],
  ['Report an issue', `${repository}/issues`],
  ['Release notes', `${repository}/blob/master/CHANGELOG.md`],
]

export const AboutSettings = () => (
  <SettingsContentLayout title="About DevTab" description="Developer news on every new tab." actions={<TipLink />}>
    <section className="devtabAbout" aria-label="DevTab app information">
      <div className="devtabAboutBrand">
        <img src="./logos/logo64.png" width="48" height="48" alt="" />
        <span>Version {appVersion}</span>
      </div>
      <nav className="devtabAboutLinks" aria-label="Project links">
        {projectLinks.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
        ))}
      </nav>
      <div className="devtabAboutCredits">
        <p>Maintained by Mohamed Elashri</p>
        <a href={`${repository}/blob/master/LICENSE`} target="_blank" rel="noopener noreferrer">
          Apache 2.0 license
        </a>
      </div>
    </section>
  </SettingsContentLayout>
)
