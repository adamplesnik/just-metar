type Props = {
  codes: string[]
  slots: number
  active: string
  onSelect: (code: string) => void
}

export default function Favourites({ codes, slots, active, onSelect }: Props) {
  const empty = Math.max(0, slots - codes.length)

  return (
    <div className="flex h-10 items-center gap-2">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onSelect(code)}
          className={`h-10 flex-1 cursor-pointer rounded border bg-container px-3 py-1 hover:bg-container-bright ${
            code === active ? 'border-main-dim' : 'border-transparent'
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
          className="pointer-events-none h-10 flex-1 rounded border border-transparent bg-container px-3 py-1 opacity-30"
        >
          FAV{codes.length + i + 1}
        </button>
      ))}
    </div>
  )
}
