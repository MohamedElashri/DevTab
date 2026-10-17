import React from 'react'

export type DevTabLogoProps = React.SVGProps<SVGSVGElement>

export const DevTabLogo = ({ className, ...props }: DevTabLogoProps) => {
  return (
    <svg
      viewBox="0 0 106 22"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}>
      <text
        x="0"
        y="17"
        fill="var(--neon-accent)"
        fontFamily="'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace"
        fontSize="17"
        fontWeight="700">
        &gt;
      </text>
      <text
        x="12"
        y="17"
        fontFamily="'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace"
        fontSize="17"
        fontWeight="700"
        letterSpacing="1.5">
        DEVTAB
      </text>
      <rect
        x="82"
        y="4"
        width="8"
        height="14"
        fill="var(--neon-accent)"
        className="devtab-cursor"
      />
    </svg>
  )
}

export default DevTabLogo
