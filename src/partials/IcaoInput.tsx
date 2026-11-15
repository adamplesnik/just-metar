type Props = {
  value: string
  onChange: (value: string) => void
}

export default function IcaoInput({ value, onChange }: Props) {
  return (
    <div className="icao-field">
      <label htmlFor="icaoCode" className="icao-label">
        ICAO code
      </label>
      <input
        className="icao-input"
        value={value}
        id="icaoCode"
        onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 4))}
        maxLength={4}
        spellCheck={false}
        autoComplete="off"
        aria-label="ICAO airport code"
      />
    </div>
  )
}
