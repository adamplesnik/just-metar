import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import IcaoInput from './partials/IcaoInput'
import MetarResult, { type Metar, type Status } from './partials/MetarResult'
import Favourites from './partials/Favourites'
import FavouriteToggle from './partials/FavouriteToggle'

const METAR_URL = (icao: string) => `/api/data/metar?ids=${icao}&format=json`
const TAF_URL = (icao: string) => `/api/data/taf?ids=${icao}&format=json`

// 204 = no report for this station
const fetchJson = (url: string, signal: AbortSignal) =>
  fetch(url, { signal }).then((res) => {
    if (!res.ok) throw new Error(String(res.status))
    return res.status === 204 ? [] : res.json()
  })

const FAV_KEY = 'just-metar:favourites'
const LAST_KEY = 'just-metar:last'
const MAX_FAV = 4
const REFRESH_MS = 5 * 60 * 1000
const isIcao = (c: unknown): c is string =>
  typeof c === 'string' && /^[A-Z]{4}$/.test(c)

function loadFavourites(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter(isIcao))].sort().slice(0, MAX_FAV)
  } catch {
    return []
  }
}

function loadLast(): string {
  try {
    const last = localStorage.getItem(LAST_KEY)
    return isIcao(last) ? last : ''
  } catch {
    return ''
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode / quota): keep in memory only
  }
}

export default function MetarLookup() {
  const [favourites, setFavourites] = useState(loadFavourites)
  const { code } = useParams()
  const navigate = useNavigate()
  // URL code wins over the last remembered one
  const [icao, setIcao] = useState(() => {
    const fromUrl = code?.toUpperCase()
    return isIcao(fromUrl) ? fromUrl : loadLast()
  })
  const [metar, setMetar] = useState<Metar | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  // keep the URL in sync with a valid code
  useEffect(() => {
    if (/^[A-Z]{4}$/.test(icao) && code !== icao) {
      navigate(`/${icao}`, { replace: true })
    }
  }, [icao, code, navigate])

  useEffect(() => {
    if (!/^[A-Z]{4}$/.test(icao)) {
      setMetar(null)
      setStatus('idle')
      return
    }

    let controller = new AbortController()
    let lastFetch = 0

    // background refreshes keep the shown report and ignore failures
    const load = (background: boolean) => {
      controller.abort()
      controller = new AbortController()
      const { signal } = controller
      lastFetch = Date.now()
      if (!background) setStatus('loading')

      // a missing TAF must not hide the METAR
      const taf = fetchJson(TAF_URL(icao), signal)
        .then((data: { rawTAF?: string }[]) =>
          Array.isArray(data) ? (data[0]?.rawTAF ?? null) : null,
        )
        .catch((err) => {
          if (err.name === 'AbortError') throw err
          return null
        })

      Promise.all([fetchJson(METAR_URL(icao), signal), taf])
        .then(
          ([data, rawTaf]: [
            { rawOb?: string; name?: string }[],
            string | null,
          ]) => {
            const report = Array.isArray(data) ? data[0] : undefined
            if (report?.rawOb) {
              setMetar({
                raw: report.rawOb,
                name: report.name ?? null,
                taf: rawTaf,
              })
              save(LAST_KEY, icao)
            } else if (!background) {
              setMetar(null)
            }
            setStatus('idle')
          },
        )
        .catch((err) => {
          if (err.name === 'AbortError' || background) return
          setStatus('error')
        })
    }

    load(false)

    const interval = setInterval(() => {
      if (!document.hidden) load(true)
    }, REFRESH_MS)

    // refresh on returning to the tab, unless it was just fetched
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastFetch > 60 * 1000) load(true)
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      controller.abort()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [icao])

  const updateFavourites = (next: string[]) => {
    const sorted = [...next].sort()
    setFavourites(sorted)
    save(FAV_KEY, JSON.stringify(sorted))
  }

  const isValid = isIcao(icao)
  const isFavourite = favourites.includes(icao)
  const isFull = favourites.length >= MAX_FAV

  return (
    <>
      <MetarResult icao={icao} metar={metar} status={status} />
      <div className="flex flex-col gap-2">
        <IcaoInput value={icao} onChange={setIcao}>
          <FavouriteToggle
            isFavourite={isFavourite}
            canAdd={isValid && !isFull}
            onAdd={() => updateFavourites([...favourites, icao])}
            onRemove={() =>
              updateFavourites(favourites.filter((c) => c !== icao))
            }
          />
        </IcaoInput>
        <Favourites
          codes={favourites}
          slots={MAX_FAV}
          active={icao}
          onSelect={setIcao}
        />
      </div>
    </>
  )
}
