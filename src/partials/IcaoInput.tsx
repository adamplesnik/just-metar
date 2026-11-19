import type { ReactNode } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  children?: ReactNode
}

export default function IcaoInput({ value, onChange, children }: Props) {
  return (
    <div className="flex items-center rounded-xl border border-outline p-1 focus-within:border-main-dim focus-within:outline-2 focus-within:outline-blue-500/50 hover:border-main-dim">
      <label htmlFor="icaoCode" className="shrink-0 pl-2 text-xs text-main-dim">
        ICAO code
      </label>
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
  )
}
