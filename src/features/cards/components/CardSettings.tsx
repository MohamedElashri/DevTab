import { Menu, MenuDivider, MenuItem, SubMenu } from 'src/components/Elements'
import { memo, useCallback, useMemo } from 'react'
import { AiOutlineCode } from 'src/components/Elements/Icons'
import { BsBoxArrowInUpRight } from 'src/components/Elements/Icons'
import { FiFilter } from 'src/components/Elements/Icons'
import { GoGear } from 'src/components/Elements/Icons'
import { IoTrashBinOutline } from 'src/components/Elements/Icons'
import { LiaSortSolid } from 'src/components/Elements/Icons'
import { MdDateRange } from 'src/components/Elements/Icons'
import { useMediaQuery } from 'src/hooks/useMediaQuery'
import { useUserPreferences } from 'src/stores/preferences'
import { useShallow } from 'src/lib/store'
import { MY_LANGUAGES_OPTION } from '../config'

type SortOption = { label: string; value: string; icon?: React.ReactNode }

type CardSettingsProps = {
  url?: string
  id: string
  sortBy?: string
  globalTag?: { label: string; value: string }
  language?: string
  showLanguageFilter?: boolean
  showDateRangeFilter?: boolean
  customStartMenuItems?: React.ReactNode
  sortOptions?: ((defaults: SortOption[]) => SortOption[]) | SortOption[]
}

const DEFAULT_SORT_OPTIONS = [{ label: 'Newest', value: 'published_at', icon: <MdDateRange /> }]
const SPECIAL_LABELS = ['global', MY_LANGUAGES_OPTION.label.toLowerCase()]

const CardSettings = ({
  id,
  url,
  sortBy,
  globalTag,
  language,
  showLanguageFilter = true,
  showDateRangeFilter = true,
  customStartMenuItems,
  sortOptions,
}: CardSettingsProps) => {
  const { userSelectedTags, openLinksNewTab, removeCard, setCardSettings, cardSettings } =
    useUserPreferences(
      useShallow((state) => ({
        userSelectedTags: state.userSelectedTags,
        openLinksNewTab: state.openLinksNewTab,
        removeCard: state.removeCard,
        setCardSettings: state.setCardSettings,
        cardSettings: state.cardsSettings?.[id],
      }))
    )

  const userTagsMemo = useMemo(() => {
    const sortedTags = [...userSelectedTags].sort((a, b) => a.label.localeCompare(b.label))
    return [
      MY_LANGUAGES_OPTION,
      ...(globalTag ? [globalTag] : []),
      ...sortedTags,
    ]
  }, [userSelectedTags, globalTag])

  const resolvedSortOptions = useMemo(() => {
    return typeof sortOptions === 'function'
      ? sortOptions(DEFAULT_SORT_OPTIONS)
      : sortOptions || DEFAULT_SORT_OPTIONS
  }, [sortOptions])

  const onOpenSourceUrlClicked = useCallback(() => {
    if (!url) return
    window.open(url, openLinksNewTab ? '_blank' : '_self')
  }, [url, openLinksNewTab])

  const firstFollowedIndex = useMemo(
    () => userTagsMemo.findIndex((tag) => !SPECIAL_LABELS.includes(tag.label.toLowerCase())),
    [userTagsMemo]
  )

  const isMobile = useMediaQuery({ maxWidth: 767 })
  const menuIcon = isMobile ? <FiFilter /> : <GoGear />

  return (
    <Menu
      menuButton={menuIcon}
      theming="dark"
      portal={true}
      className={`menuItem`}
      transition
      direction={'bottom'}
      align="start">
      {customStartMenuItems}
      {showLanguageFilter && userTagsMemo.length > 0 && (
        <SubMenu
          label={
            <span className={`menuItem`}>
              <AiOutlineCode /> Topic
            </span>
          }>
          {userTagsMemo.map((tag, i) => (
            <>
              {i === firstFollowedIndex && <MenuDivider />}
              <MenuItem
                className={`menuItem`}
                type="radio"
                value={tag.value}
                key={tag.value}
                disabled={language === tag.value}
                onClick={() => {
                  setCardSettings(id, { ...cardSettings, language: tag.value })
                }}>
                {tag.label}
              </MenuItem>
            </>
          ))}
        </SubMenu>
      )}

      {showDateRangeFilter && (
        <SubMenu
          className="subMenuItem"
          label={
            <span className={`menuItem`}>
              <LiaSortSolid />
              Sort by
            </span>
          }>
          {resolvedSortOptions.map((option) => (
            <MenuItem
              className={`menuItem`}
              key={option.value}
              disabled={sortBy === option.value}
              onClick={() => {
                setCardSettings(id, { ...cardSettings, sortBy: option.value })
              }}>
              {option.icon} {option.label}
            </MenuItem>
          ))}
        </SubMenu>
      )}
      {(showDateRangeFilter || showLanguageFilter) && <MenuDivider />}
      <MenuItem
        className={`menuItem`}
        onClick={() => {
          removeCard(id)
        }}>
        <IoTrashBinOutline />
        Remove card
      </MenuItem>
      <MenuItem className={`menuItem`} onClick={onOpenSourceUrlClicked} disabled={!url}>
        <BsBoxArrowInUpRight />
        Open in new tab
      </MenuItem>
    </Menu>
  )
}

export const MemoizedCardSettings = memo(CardSettings)
