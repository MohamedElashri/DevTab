import { useMemo, useRef, useState } from 'react'
import { MdOutlineDragIndicator } from 'src/components/Elements/Icons'
import { SUPPORTED_CARDS } from 'src/config/supportedCards'
import { CustomRssCard } from 'src/features/cards'
import { DesktopBreakpoint } from 'src/providers/DesktopBreakpoint'
import { useUserPreferences } from 'src/stores/preferences'
import { SelectedCard, SupportedCardType } from 'src/types'
import { clsx } from 'src/utils/clsx'

type SortableItemProps = {
  id: string
  card: SupportedCardType
  isDragging: boolean
  isOver: boolean
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDragLeave: (id: string) => void
  onDrop: (id: string) => void
  onDragEnd: () => void
  onMoveLeft: (id: string) => void
  onMoveRight: (id: string) => void
}

const SortableItem = ({
  id,
  card,
  isDragging,
  isOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
}: SortableItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const Component = card.component || CustomRssCard

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onMoveLeft(id)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onMoveRight(id)
    }
  }

  return (
    <div
      ref={itemRef}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver(id)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        onDragLeave(id)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(id)
      }}
    >
      <Component
        meta={card}
        className={clsx(isDragging && 'draggedBlock', isOver && 'dropTargetBlock')}
        knob={
          <DesktopBreakpoint>
            <button
              className="blockHeaderDragButton"
              aria-label="Reorder card"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', id)
                e.dataTransfer.effectAllowed = 'move'
                if (itemRef.current) {
                  const rect = itemRef.current.getBoundingClientRect()
                  e.dataTransfer.setDragImage(
                    itemRef.current,
                    e.clientX - rect.left,
                    e.clientY - rect.top
                  )
                }
                setTimeout(() => {
                  onDragStart(id)
                }, 0)
              }}
              onDragEnd={onDragEnd}
              onKeyDown={handleKeyDown}
            >
              <MdOutlineDragIndicator />
            </button>
          </DesktopBreakpoint>
        }
      />
    </div>
  )
}

export const DesktopCards = ({
  cards,
}: {
  cards: SelectedCard[]
}) => {
  const { updateCardOrder, userCustomCards } = useUserPreferences()
  const cardsWrapperRef = useRef<HTMLDivElement>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
    cardsWrapperRef.current?.classList.add('snapDisabled')
  }

  const handleDragOver = (id: string) => {
    if (draggedId && draggedId !== id) {
      setOverId(id)
    }
  }

  const handleDragLeave = (id: string) => {
    if (overId === id) {
      setOverId(null)
    }
  }

  const handleDrop = (targetId: string) => {
    if (draggedId && draggedId !== targetId) {
      const previousCard = cards.find((card) => card.name === draggedId)
      const newCard = cards.find((card) => card.name === targetId)
      if (previousCard && newCard) {
        updateCardOrder(previousCard.id, newCard.id)
      }
    }
    setDraggedId(null)
    setOverId(null)
    cardsWrapperRef.current?.classList.remove('snapDisabled')
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setOverId(null)
    cardsWrapperRef.current?.classList.remove('snapDisabled')
  }

  const handleMoveLeft = (id: string) => {
    const previousCard = cards.find((card) => card.name === id)
    if (previousCard && previousCard.id > 0) {
      updateCardOrder(previousCard.id, previousCard.id - 1)
    }
  }

  const handleMoveRight = (id: string) => {
    const previousCard = cards.find((card) => card.name === id)
    if (previousCard && previousCard.id < cards.length - 1) {
      updateCardOrder(previousCard.id, previousCard.id + 1)
    }
  }

  const memoCards = useMemo(() => {
    const availableCards = [...SUPPORTED_CARDS, ...userCustomCards]

    return cards
      .map((card) => {
        const constantCard = availableCards.find((c) => c.value === card.name)
        if (!constantCard) {
          return null
        }

        return {
          card: constantCard,
          id: card.name,
        }
      })
      .filter(Boolean) as { id: string; card: SupportedCardType }[]
  }, [cards, userCustomCards])

  return (
    <div ref={cardsWrapperRef} className="Cards HorizontalScroll">
      {memoCards.map(({ id, card }) => {
        return (
          <SortableItem
            key={id}
            id={id}
            card={card}
            isDragging={draggedId === id}
            isOver={overId === id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
          />
        )
      })}
    </div>
  )
}
