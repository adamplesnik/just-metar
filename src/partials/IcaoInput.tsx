type Props = {
  value: string
  onChange: (value: string) => void
}

export default function IcaoInput({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="icaoCode"
        className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
      >
        ICAO code
      </label>
      <input
        className="h-10 w-24 rounded-md border border-neutral-400 px-3 uppercase hover:border-neutral-900 dark:border-neutral-600 hover:dark:border-neutral-300"
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
