import { TfiLayoutColumn4Alt } from 'src/components/Elements/Icons'
import { Select, SelectOption } from 'src/components/Elements'

type LayoutOption = SelectOption<'cards'>

const Layouts: LayoutOption[] = [
  { value: 'cards', label: 'Cards', icon: <TfiLayoutColumn4Alt /> },
]

export const LayoutSettings = () => {
  return (
    <div className="settingRow">
      <p className="settingTitle">Layout Style</p>
      <div className="settingContent">
        <div className="form">
          <div style={{ flex: 1 }}>
            <Select options={Layouts} value={Layouts[0]} />
          </div>
        </div>
      </div>
    </div>
  )
}
