type Props = {
  codes: string[]
  onSelect: (code: string) => void
}

export default function RecentCodes({ codes, onSelect }: Props) {
  if (codes.length === 0) return null

  return (
    <div className="flex h-10 items-center gap-2">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onSelect(code)}
          className="h-8 cursor-pointer rounded bg-container px-3 py-1 text-sm hover:bg-container-bright"
        >
          {code}
        </button>
      ))}
    </div>
  )
}
