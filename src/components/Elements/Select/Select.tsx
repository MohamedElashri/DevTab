import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'src/components/Elements/Icons'
import clsx from 'src/utils/clsx'
import './Select.css'

export type SelectOption<T = unknown> = {
  label: string
  value: T
  icon?: React.ReactNode
}

export type SelectProps<T = unknown> = {
  options: SelectOption<T>[]
  value?: SelectOption<T> | null
  defaultValue?: SelectOption<T> | null
  placeholder?: string
  onChange?: (selected: SelectOption<T> | null) => void
  className?: string
  classNamePrefix?: string
}

export function Select<T = unknown>({
  options,
  value,
  defaultValue,
  placeholder = 'Select...',
  onChange,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<SelectOption<T> | null>(
    value !== undefined ? value : defaultValue || null
  )
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = value !== undefined ? value : internalValue

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (option: SelectOption<T>) => {
    if (value === undefined) {
      setInternalValue(option)
    }
    onChange?.(option)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setFocusedIndex(0)
      } else {
        setFocusedIndex((prev) => (prev + 1 < options.length ? prev + 1 : 0))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setFocusedIndex(options.length - 1)
      } else {
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : options.length - 1))
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
        handleSelect(options[focusedIndex])
      } else {
        setIsOpen((prev) => !prev)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={clsx('devtab-select', className)}
      onKeyDown={handleKeyDown}>
      <div
        className={clsx(
          'devtab-select__control',
          isOpen && 'devtab-select__control--is-open'
        )}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}>
        <div className="devtab-select__value-container">
          {selectedOption ? (
            <div className="devtab-select__single-value">
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="devtab-select__placeholder">{placeholder}</span>
          )}
        </div>
        <div
          className={clsx(
            'devtab-select__indicators',
            isOpen && 'devtab-select__indicator--open'
          )}>
          <FiChevronDown size={18} />
        </div>
      </div>

      {isOpen && (
        <ul className="devtab-select__menu" role="listbox">
          {options.map((option, index) => {
            const isSelected = selectedOption?.value === option.value
            const isFocused = focusedIndex === index
            return (
              <li
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                className={clsx(
                  'devtab-select__option',
                  isSelected && 'devtab-select__option--is-selected',
                  isFocused && 'devtab-select__option--is-focused'
                )}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}>
                {option.icon}
                <span>{option.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Select
