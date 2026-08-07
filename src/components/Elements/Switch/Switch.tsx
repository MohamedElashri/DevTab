import clsx from 'clsx'
import React from 'react'
import './Switch.css'

type SwitchProps = {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  ariaLabel?: string
}

export const Switch = ({ checked, onChange, disabled = false, ariaLabel }: SwitchProps) => {
  return (
    <label className={clsx('switch', disabled && 'switch-disabled')}>
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
    </label>
  )
}
