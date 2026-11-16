type Props = {
  codes: string[]
  slots: number
  active: string
  onSelect: (code: string) => void
}

export default function Favourites({ codes, slots, active, onSelect }: Props) {
  const empty = Math.max(0, slots - codes.length)

  return (
    <div className="flex items-center gap-1 rounded-md border border-outline p-1">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onSelect(code)}
          className={`h-8 flex-1 cursor-pointer rounded px-2 py-1 transition-colors hover:bg-container-bright hover:text-main sm:px-3 ${
            code === active ? 'bg-container' : 'bg-container-dim'
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
          className="pointer-events-none h-8 flex-1 px-2 py-1 opacity-20 sm:px-3"
        >
          FAV{codes.length + i + 1}
        </button>
      ))}
    </div>
  )
}
