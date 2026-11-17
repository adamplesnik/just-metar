import { useState } from 'react'
import FavouriteToggle from './components/FavouriteToggle'
import Favourites from './components/Favourites'
import IcaoInput from './components/IcaoInput'
import MetarResult from './components/MetarResult'
import Root from './components/Root'
import { useMetar } from './useMetar'
import { isIcao, load, save, type Theme } from './utils'

const MAX_FAV = 4

/** One to four ICAO codes. */
export type Airports =
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]

type CommonProps = {
  /** Proxy of https://aviationweather.gov/api/data/metar, e.g. "/api/metar". */
  endpoint: string
  /** Code shown first. Falls back to the last lookup, then the first favourite. */
  defaultCode?: string
  /** Called whenever the selected code changes (e.g. to sync the URL). */
  onCodeChange?: (code: string) => void
  /** localStorage key prefix. Default "just-metar". */
  storageKey?: string
  theme?: Theme
  className?: string
}

/** Lookup: input and/or favourites bar. */
type LookupProps = CommonProps & {
  /** Hide the ICAO input (and the FAV checkbox). Default false. */
  noInput?: boolean
  /** Hide the favourites bar. Default false. */
  noFavourites?: boolean
  /**
   * Predefined favourites (1–4). With the input shown they are the starting
   * set, which the user can change (saved in localStorage); with `noInput`
   * they are fixed.
   */
  favourites?: Airports
  code?: never
}

/** Single station: title and METAR only. */
type CardProps = CommonProps & {
  noInput: true
  noFavourites: true
  /** ICAO code of the station. Only with `noInput` and `noFavourites`. */
  code: string
  favourites?: never
}

export type JustMetarProps = LookupProps | CardProps

const normalize = (codes: readonly unknown[]) =>
  [...new Set(codes.map((c) => (typeof c === 'string' ? c.toUpperCase() : c)))]
    .filter(isIcao)
    .sort()
    .slice(0, MAX_FAV)

function loadFavourites(key: string): string[] | null {
  try {
    const parsed = JSON.parse(load(key) ?? 'null')
    return Array.isArray(parsed) ? normalize(parsed) : null
  } catch {
    return null
  }
}

export default function JustMetar(props: JustMetarProps) {
  const {
    endpoint,
    defaultCode,
    onCodeChange,
    storageKey = 'just-metar',
    theme,
    className,
    noInput = false,
    noFavourites = false,
  } = props

  if (props.code !== undefined && !(noInput && noFavourites)) {
    console.warn(
      '[just-metar] `code` only works together with `noInput` and `noFavourites`; it is ignored.',
    )
  }

  const favKey = `${storageKey}:favourites`
  const lastKey = `${storageKey}:last`
  const isCard = noInput && noFavourites
  const preset = props.favourites ? normalize(props.favourites) : null
  // without the input nobody can edit favourites, so a preset is used as is
  const editable = !noInput

  const [favourites, setFavourites] = useState<string[]>(() =>
    !editable && preset ? preset : (loadFavourites(favKey) ?? preset ?? []),
  )

  const [icao, setIcao] = useState(() => {
    if (isCard) return props.code?.toUpperCase() ?? ''
    const initial = defaultCode?.toUpperCase()
    if (isIcao(initial)) return initial
    const last = load(lastKey)
    // without the input only a favourite can be shown
    if (isIcao(last) && (editable || favourites.includes(last))) return last
    return editable ? '' : (favourites[0] ?? '')
  })

  const { metar, status } = useMetar(endpoint, icao, (code) => {
    if (!isCard) save(lastKey, code)
  })

  const changeIcao = (code: string) => {
    setIcao(code)
    onCodeChange?.(code)
  }

  const updateFavourites = (next: string[]) => {
    const sorted = [...next].sort()
    setFavourites(sorted)
    save(favKey, JSON.stringify(sorted))
  }

  if (isCard) {
    return (
      <Root theme={theme} className={className}>
        <div className="jm:flex jm:flex-col jm:gap-2">
          <div className="jm:text-xs jm:text-main-dim">
            {icao}
            {metar?.name && ` · ${metar.name}`}
          </div>
          <MetarResult icao={icao} metar={metar} status={status} compact />
        </div>
      </Root>
    )
  }

  const isFavourite = favourites.includes(icao)
  const isFull = favourites.length >= MAX_FAV

  return (
    <Root theme={theme} className={className}>
      <div className="jm:flex jm:flex-col jm:gap-2">
        {!noInput && (
          <IcaoInput value={icao} onChange={changeIcao}>
            {!noFavourites && (
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
        )}
        {!noFavourites && (
          <Favourites
            codes={favourites}
            // empty slots only make sense when the user can fill them
            slots={editable ? MAX_FAV : favourites.length}
            active={icao}
            onSelect={changeIcao}
          />
        )}
        <MetarResult icao={icao} metar={metar} status={status} />
      </div>
    </Root>
  )
}
