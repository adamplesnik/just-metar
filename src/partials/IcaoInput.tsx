type Props = {
  value: string
  onChange: (value: string) => void
}

export default function IcaoInput({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="icaoCode" className="text-sm font-medium text-main-dim">
        ICAO code
      </label>
      <input
        className="h-10 w-24 rounded-md border border-outline px-3 uppercase hover:border-main-dim"
        value={value}
        id="icaoCode"
        onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 4))}
        onFocus={(e) => e.target.select()}
        // stop the click that focused the input from collapsing the selection
        onMouseUp={(e) => {
          const { selectionStart, selectionEnd, value } = e.currentTarget
          if (selectionStart === 0 && selectionEnd === value.length) {
            e.preventDefault()
          }
        }}
        maxLength={4}
        spellCheck={false}
        autoComplete="off"
        aria-label="ICAO airport code"
      />
    </div>
  )
}
