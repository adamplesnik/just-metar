type Props = {
  codes: string[]
  slots: number
  active: string
  onSelect: (code: string) => void
}

export default function Favourites({ codes, slots, active, onSelect }: Props) {
  const empty = Math.max(0, slots - codes.length)

  return (
    <div className="jm:flex jm:items-center jm:gap-1 jm:rounded-md jm:border jm:border-outline jm:p-1">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onSelect(code)}
          className={`jm:h-8 jm:flex-1 jm:cursor-pointer jm:rounded jm:px-2 jm:py-1 jm:transition-colors jm:hover:bg-container-bright jm:hover:text-main jm:sm:px-3 ${
            code === active ? 'jm:bg-container' : 'jm:bg-container-dim'
          }`}
        >
          {code}
        </button>
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <button
          key={`empty-${i}`}
          type="button"
          disabled
          aria-hidden="true"
          tabIndex={-1}
          className="jm:pointer-events-none jm:h-8 jm:flex-1 jm:px-2 jm:py-1 jm:opacity-20 jm:sm:px-3"
        >
          FAV{codes.length + i + 1}
        </button>
      ))}
    </div>
  )
}
