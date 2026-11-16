import { useState } from 'react'
import FavouriteToggle from './components/FavouriteToggle'
import Favourites from './components/Favourites'
import IcaoInput from './components/IcaoInput'
import MetarResult from './components/MetarResult'
import Root from './components/Root'
import { useMetar } from './useMetar'
import { isIcao, load, save, type Theme } from './utils'

const MAX_FAV = 4

export type MetarLookupProps = {
  /** Proxy of https://aviationweather.gov/api/data/metar, e.g. "/api/metar". */
  endpoint: string
  /** Show the favourites bar and the FAV checkbox. Default true. */
  favourites?: boolean
  /** Code to show first. Falls back to the last successful lookup. */
  defaultCode?: string
  /** Called whenever the typed code changes (e.g. to sync the URL). */
  onCodeChange?: (code: string) => void
  /** localStorage key prefix. Default "just-metar". */
  storageKey?: string
  theme?: Theme
  className?: string
}

function loadFavourites(key: string): string[] {
  try {
    const parsed = JSON.parse(load(key) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter(isIcao))].sort().slice(0, MAX_FAV)
  } catch {
    return []
  }
}

export default function MetarLookup({
  endpoint,
  favourites: showFavourites = true,
  defaultCode,
  onCodeChange,
  storageKey = 'just-metar',
  theme,
  className,
}: MetarLookupProps) {
  const favKey = `${storageKey}:favourites`
  const lastKey = `${storageKey}:last`

  const [favourites, setFavourites] = useState(() => loadFavourites(favKey))
  const [icao, setIcao] = useState(() => {
    const initial = defaultCode?.toUpperCase()
    if (isIcao(initial)) return initial
    const last = load(lastKey)
    return isIcao(last) ? last : ''
  })
  const { metar, status } = useMetar(endpoint, icao, (code) =>
    save(lastKey, code),
  )

  const changeIcao = (code: string) => {
    setIcao(code)
    onCodeChange?.(code)
  }

  const updateFavourites = (next: string[]) => {
    const sorted = [...next].sort()
    setFavourites(sorted)
    save(favKey, JSON.stringify(sorted))
  }

  const isFavourite = favourites.includes(icao)
  const isFull = favourites.length >= MAX_FAV

  return (
    <Root theme={theme} className={className}>
      <div className="jm:flex jm:flex-col jm:gap-4">
        <IcaoInput value={icao} onChange={changeIcao}>
          {showFavourites && (
            <FavouriteToggle
              isFavourite={isFavourite}
              canAdd={isIcao(icao) && !isFull}
              onAdd={() => updateFavourites([...favourites, icao])}
              onRemove={() =>
                updateFavourites(favourites.filter((c) => c !== icao))
              }
            />
          )}
        </IcaoInput>
        {showFavourites && (
          <Favourites
            codes={favourites}
            slots={MAX_FAV}
            active={icao}
            onSelect={changeIcao}
          />
        )}
        <MetarResult icao={icao} metar={metar} status={status} />
      </div>
    </Root>
  )
}
