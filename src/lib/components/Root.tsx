import type { ReactNode } from 'react'
import type { Theme } from '../utils'

type Props = {
  theme?: Theme
  className?: string
  children: ReactNode
}

// data-theme sets color-scheme in styles.css, which drives the light-dark() colours
export default function Root({ theme = 'system', className, children }: Props) {
  return (
    <div
      className={`jm-root jm:font-mono jm:tracking-wide jm:text-main jm:uppercase ${className ?? ''}`}
      data-theme={theme}
    >
      {children}
    </div>
  )
}
