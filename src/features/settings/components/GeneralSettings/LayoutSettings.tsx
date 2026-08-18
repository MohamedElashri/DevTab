import { TfiLayoutColumn4Alt } from 'react-icons/tfi'
import Select, { GroupBase, OptionProps, SingleValueProps, components } from 'react-select'

type LayoutOption = {
  label: string
  value: 'cards'
  icon: React.ReactNode
}

const Layouts: LayoutOption[] = [
  { value: 'cards', label: 'Cards', icon: <TfiLayoutColumn4Alt /> },
]

const IconOption = (props: OptionProps<LayoutOption, false, GroupBase<LayoutOption>>) => (
  <components.Option {...props}>
    <div className="optionIcon">
      {props.data.icon}
      {props.data.label}
    </div>
  </components.Option>
)

const SingleIconOption = (
  props: SingleValueProps<LayoutOption, false, GroupBase<LayoutOption>>
) => (
  <components.SingleValue {...props}>
    <div className="optionIcon">
      {props.data.icon}
      {props.data.label}
    </div>
  </components.SingleValue>
)

export const LayoutSettings = () => {
  return (
    <div className="settingRow">
      <p className="settingTitle">Layout Style</p>
      <div className="settingContent">
        <div className="form">
          <div style={{ flex: 1 }}>
            <Select
              options={Layouts}
              components={{
                Option: IconOption,
                SingleValue: SingleIconOption,
              }}
              isMulti={false}
              isClearable={false}
              isSearchable={false}
              value={Layouts[0]}
              classNamePrefix={'devtab'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
