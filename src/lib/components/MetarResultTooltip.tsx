import { useId } from 'react'

type Props = {
  label: string
  tooltip: string
}

export default function MetarResultTooltip({ label, tooltip }: Props) {
  const id = useId()

  return (
    <span
      tabIndex={0}
      aria-describedby={id}
      className="jm:group jm:-mx-1 jm:cursor-help jm:px-1 jm:underline jm:decoration-outline jm:decoration-1 jm:underline-offset-4 jm:transition-colors jm:hover:bg-blue-500/20 jm:focus:bg-blue-500/20 relative"
    >
      {label}
      <span
        id={id}
        role="tooltip"
        className="jm:pointer-events-none jm:absolute jm:top-8 jm:-left-16 jm:sm:left-1 jm:mb-2 jm:w-max jm:max-w-64 jm:sm:max-w-80 jm:rounded jm:bg-main-dim jm:px-2 jm:py-1 jm:text-xs jm:text-on-main jm:opacity-0 jm:transition-opacity jm:group-hover:opacity-100 jm:group-focus:opacity-100 jm:group-focus-visible:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  )
}
