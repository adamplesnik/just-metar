type Props = {
  codes: string[]
  onSelect: (code: string) => void
}

export default function RecentCodes({ codes, onSelect }: Props) {
  if (codes.length === 0) return null

  return (
    <div className="recent">
      {codes.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onSelect(code)}
          className="recent-code"
        >
          {code}
        </button>
      ))}
    </div>
  )
}
