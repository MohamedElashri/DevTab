import { RiSparkling2Fill } from 'react-icons/ri'
import { TfiLayoutColumn4Alt } from 'react-icons/tfi'
import Select, {
  GroupBase,
  OptionProps,
  SingleValue,
  SingleValueProps,
  components,
} from 'react-select'
import { useUserPreferences } from 'src/stores/preferences'
import { Layout } from 'src/types'

type LayoutOption = {
  label: string
  value: Layout
  icon: React.ReactNode
}

const Layouts: LayoutOption[] = [
  { value: 'grid', label: 'AI Feed (Beta)', icon: <RiSparkling2Fill color="#F1D247" /> },
  { value: 'cards', label: 'Cards', icon: <TfiLayoutColumn4Alt /> },
]

const OptionComp = components.Option as React.FC<any>
const SingleValueComp = components.SingleValue as React.FC<any>

const IconOption = (props: OptionProps<LayoutOption, false, GroupBase<LayoutOption>>) => (
  <OptionComp {...props}>
    <div className="optionIcon">
      {props.data.icon}
      {props.data.label}
    </div>
  </OptionComp>
)

const SingleIconOption = (
  props: SingleValueProps<LayoutOption, false, GroupBase<LayoutOption>>
) => (
  <SingleValueComp {...props}>
    <div className="optionIcon">
      {props.data.icon}
      {props.data.label}
    </div>
  </SingleValueComp>
)

export const LayoutSettings = () => {
  const { layout, setLayout } = useUserPreferences()

  const onPeriodSelect = (selectedOption: SingleValue<LayoutOption>) => {
    if (!selectedOption) {
      return
    }

    setLayout(selectedOption.value)
  }

  const getDefaultValue = (): LayoutOption | undefined => {
    return Layouts.find((e) => e.value === layout)
  }

  return (
    <div className="settingRow">
      <p className="settingTitle">Layout Style</p>
      <div className="settingContent">
        <div className="form">
          <div style={{ flex: 1 }}>
            <Select
              options={Layouts}
              components={{
                Option: IconOption as React.ComponentType<any>,
                SingleValue: SingleIconOption as React.ComponentType<any>,
              }}
              isMulti={false}
              isClearable={false}
              isSearchable={false}
              defaultValue={getDefaultValue()}
              classNamePrefix={'hackertab'}
              onChange={onPeriodSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
