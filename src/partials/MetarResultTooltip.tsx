type Props = {
  label: string
  tooltip: string
}

export default function MetarResultTooltip({ label, tooltip }: Props) {
  return (
    <span
      tabIndex={0}
      aria-describedby="station-name"
      className="group -mx-1 cursor-help px-1 underline decoration-outline decoration-1 underline-offset-4 transition-colors hover:bg-blue-500/20 focus:bg-blue-500/20"
    >
      {label}
      <span
        id="station-name"
        role="tooltip"
        title="lala"
        className="pointer-events-none absolute top-1.5 left-0 mb-2 w-max max-w-80 rounded bg-container-dim px-2 py-1 text-xs text-main-dim opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  )
}
