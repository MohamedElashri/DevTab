import { useMemo, useState } from 'react'
import { ChipsSet, ConfirmModal } from 'src/components/Elements'
import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout/SettingsContentLayout'
import { SUPPORTED_CARDS } from 'src/config/supportedCards'
import { useUserPreferences } from 'src/stores/preferences'
import { Option, SelectedCard } from 'src/types'

export const SourceSettings = () => {
  const { cards, setCards } = useUserPreferences()
  const [confirmDelete, setConfirmDelete] = useState<{
    showModal: boolean
    option?: Option
  }>({
    showModal: false,
    option: undefined,
  })

  const mergedSources = useMemo(() => {
    return [
      ...SUPPORTED_CARDS.map((source) => {
        return {
          label: source.label,
          value: source.value,
          icon: source.icon,
        }
      }),
    ].sort((a, b) => (a.label > b.label ? 1 : -1))
  }, [])

  return (
    <SettingsContentLayout
      title="Sources"
      description={`Your feed will be tailored by following the sources you are interested in.`}>
      <>
        <ConfirmModal
          showModal={confirmDelete.showModal}
          title={`Confirm delete source: ${confirmDelete.option?.label}`}
          description={`Are you sure you want to delete ${confirmDelete.option?.label} source? This action cannot be undone.`}
          onClose={() =>
            setConfirmDelete({
              showModal: false,
              option: undefined,
            })
          }
          onConfirm={() => {
            if (!confirmDelete.option) {
              return
            }

            const newCards = cards.filter((card) => card.name !== confirmDelete.option?.value)
            setCards(newCards)
            setConfirmDelete({ showModal: false, option: undefined })
          }}
        />
        <ChipsSet
          canSelectMultiple={true}
          options={mergedSources}
          defaultValues={cards.map((source) => source.name)}
          onRemove={(option) => {
            setConfirmDelete({ showModal: true, option: option })
          }}
          onChange={(changes, selectedChips) => {
            const selectedValues = selectedChips.map((chip) => chip.value)

            const cards = selectedValues
              .map((source, index) => {
                if (SUPPORTED_CARDS.find((sc) => sc.value === source)) {
                  return {
                    id: index,
                    name: source,
                    type: 'supported',
                  }
                }
                return null
              })
              .filter(Boolean) as SelectedCard[]

            setCards(cards)
          }}
        />
      </>
    </SettingsContentLayout>
  )
}
