import type { ReactNode } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  children?: ReactNode
}

export default function IcaoInput({ value, onChange, children }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label htmlFor="icaoCode" className="text-sm text-main-dim">
        ICAO code
      </label>
      <div className="flex items-center rounded-md border border-outline p-1 focus-within:border-red-300 hover:border-main-dim">
        <input
          className="w-full border-none px-2 focus:outline-none"
          value={value}
          id="icaoCode"
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 4))}
          maxLength={4}
          spellCheck={false}
          autoComplete="off"
          aria-label="ICAO airport code"
        />
        {children}
      </div>
    </div>
  )
}
