import { useId, type ReactNode } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  children?: ReactNode
}

export default function IcaoInput({ value, onChange, children }: Props) {
  const id = useId()

  return (
    <div className="jm:flex jm:flex-1 jm:flex-col jm:gap-1">
      <label htmlFor={id} className="jm:text-xs jm:text-main-dim">
        ICAO code
      </label>
      <div className="jm:flex jm:items-center jm:rounded-md jm:border jm:border-outline jm:p-1 jm:focus-within:border-main-dim jm:focus-within:outline-2 jm:focus-within:outline-blue-500/50 jm:hover:border-main-dim">
        <input
          className="jm:w-full jm:border-none jm:px-2 jm:focus:outline-none"
          value={value}
          id={id}
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
