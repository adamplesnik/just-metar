import { useState } from 'react'
import Favourites from './components/Favourites'
import MetarResult from './components/MetarResult'
import Root from './components/Root'
import { useMetar } from './useMetar'
import { isIcao, type Theme } from './utils'

/** Two to four ICAO codes. */
export type Airports =
  [string, string] | [string, string, string] | [string, string, string, string]

export type MetarFavouritesProps = {
  /** Proxy of https://aviationweather.gov/api/data/metar, e.g. "/api/metar". */
  endpoint: string
  /** Two to four ICAO codes, shown in this order. */
  airports: Airports
  /** Code selected first. Default: the first airport. */
  defaultCode?: string
  theme?: Theme
  className?: string
}

export default function MetarFavourites({
  endpoint,
  airports,
  defaultCode,
  theme,
  className,
}: MetarFavouritesProps) {
  const codes = [...new Set(airports.map((c) => c.toUpperCase()))].filter(
    isIcao,
  )
  if (codes.length < 2 || codes.length > 4) {
    console.warn(
      `[just-metar] MetarFavourites expects 2–4 valid ICAO codes, got: ${airports.join(', ')}`,
    )
  }
  const shown = codes.slice(0, 4)

  const [selected, setSelected] = useState(() => {
    const initial = defaultCode?.toUpperCase()
    return initial && shown.includes(initial) ? initial : (shown[0] ?? '')
  })
  const { metar, status } = useMetar(endpoint, selected)

  return (
    <Root theme={theme} className={className}>
      <Favourites
        codes={shown}
        slots={shown.length}
        active={selected}
        onSelect={setSelected}
      />
      <MetarResult icao={selected} metar={metar} status={status} />
    </Root>
  )
}
