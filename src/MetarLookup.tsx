import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import IcaoInput from './partials/IcaoInput'
import MetarResult, { type Metar, type Status } from './partials/MetarResult'
import Favourites from './partials/Favourites'
import FavouriteToggle from './partials/FavouriteToggle'

// METAR with its TAF attached, for any number of stations in one request
const REPORTS_URL = (icaos: string[]) =>
  `/api/data/metar?ids=${icaos.join(',')}&format=json&taf=true`

type ApiReport = {
  icaoId?: string
  rawOb?: string
  name?: string
  rawTaf?: string
}

// reports keyed by station; stations without a METAR are missing.
// The API does not keep the requested order, so match on icaoId.
async function fetchReports(
  icaos: string[],
  signal: AbortSignal,
): Promise<Record<string, Metar>> {
  const res = await fetch(REPORTS_URL(icaos), { signal })
  if (!res.ok) throw new Error(String(res.status))
  // 204 = no report for any of the stations
  const data: unknown = res.status === 204 ? [] : await res.json()

  const reports: Record<string, Metar> = {}
  if (!Array.isArray(data)) return reports
  for (const r of data as ApiReport[]) {
    const id = r?.icaoId
    // first entry per station is the latest
    if (!isIcao(id) || !r.rawOb || reports[id]) continue
    reports[id] = {
      raw: r.rawOb,
      name: r.name ?? null,
      taf: r.rawTaf ?? null,
    }
  }
  return reports
}

const sameReport = (a: Metar | null, b: Metar | null) =>
  a?.raw === b?.raw && a?.taf === b?.taf && a?.name === b?.name

const FAV_KEY = 'just-metar:favourites'
const CACHE_KEY = 'just-metar:cache'
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

// latest report per favourite so it shows instantly while a fresh copy loads;
// other stations are never stored. Its age is shown next to it, so an old
// entry is still worth showing.
type CacheEntry = { report: Metar; fetchedAt: number }
type Cache = Record<string, CacheEntry>

const num = (n: unknown) => (typeof n === 'number' && isFinite(n) ? n : 0)

function readCache(): Cache {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object') return {}
    const cache: Cache = {}
    for (const [key, e] of Object.entries(
      parsed as Record<string, CacheEntry>,
    )) {
      const m = e?.report
      if (isIcao(key) && typeof m?.raw === 'string') {
        cache[key] = {
          report: {
            raw: m.raw,
            name: typeof m.name === 'string' ? m.name : null,
            taf: typeof m.taf === 'string' ? m.taf : null,
          },
          fetchedAt: num(e.fetchedAt),
        }
      }
    }
    return cache
  } catch {
    return {}
  }
}

const cache = readCache()
// clear out anything stored before only favourites were kept
pruneCache(loadFavourites())

const cachedReport = (icao: string): Metar | null =>
  cache[icao]?.report ?? null

// drop non-favourite entries, then persist
function pruneCache(favourites: string[]) {
  for (const key of Object.keys(cache)) {
    if (!favourites.includes(key)) delete cache[key]
  }
  save(CACHE_KEY, JSON.stringify(cache))
}

// store the favourites' reports; other stations are ignored.
// requestedAt is when the request started: a response from an older request
// that finishes late never replaces a newer one
function cacheReports(
  reports: Record<string, Metar>,
  favourites: string[],
  requestedAt: number,
) {
  for (const [icao, report] of Object.entries(reports)) {
    if ((cache[icao]?.fetchedAt ?? -1) > requestedAt) continue
    cache[icao] = { report, fetchedAt: requestedAt }
  }
  pruneCache(favourites)
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
  const [metar, setMetar] = useState<Metar | null>(() => cachedReport(icao))
  const [status, setStatus] = useState<Status>('idle')
  // a background fetch is in flight while a report is already shown
  const [refreshing, setRefreshing] = useState(false)
  const favouritesRef = useRef(favourites)
  useEffect(() => {
    favouritesRef.current = favourites
  }, [favourites])
  // favourites are fetched once per page load, in the same request as the
  // first lookup (or on their own when there is nothing to look up yet)
  const favouritesPending = useRef(true)

  // keep the URL in sync with a valid code
  useEffect(() => {
    if (/^[A-Z]{4}$/.test(icao) && code !== icao) {
      navigate(`/${icao}`, { replace: true })
    }
  }, [icao, code, navigate])

  useEffect(() => {
    let controller = new AbortController()

    if (!isIcao(icao)) {
      setMetar(null)
      setStatus('idle')
      setRefreshing(false)

      const favs = favouritesRef.current
      if (favouritesPending.current && favs.length) {
        const requestedAt = Date.now()
        fetchReports(favs, controller.signal)
          .then((reports) => {
            cacheReports(reports, favouritesRef.current, requestedAt)
            favouritesPending.current = false
          })
          .catch(() => {
            // retried with the next lookup
          })
      }
      return () => controller.abort()
    }

    let lastFetch = 0

    // background loads keep the shown report and ignore failures
    const load = (background: boolean) => {
      controller.abort()
      controller = new AbortController()
      const { signal } = controller
      const requestedAt = Date.now()
      lastFetch = requestedAt
      if (!background) setStatus('loading')
      setRefreshing(background)

      const withFavourites = favouritesPending.current
      const ids = withFavourites
        ? [...new Set([icao, ...favouritesRef.current])]
        : [icao]

      fetchReports(ids, signal)
        .then((reports) => {
          cacheReports(reports, favouritesRef.current, requestedAt)
          if (withFavourites) favouritesPending.current = false
          const report = reports[icao]
          if (report) {
            // only re-render when something actually changed
            setMetar((prev) => (sameReport(prev, report) ? prev : report))
            save(LAST_KEY, icao)
          } else if (!background) {
            setMetar(null)
          }
          setStatus('idle')
          setRefreshing(false)
        })
        .catch((err) => {
          // an aborted load was replaced by a newer one, which owns the state
          if (err.name === 'AbortError') return
          setRefreshing(false)
          if (!background) setStatus('error')
        })
    }

    // a cached report shows right away; the fresh one replaces it if newer
    const cached = cachedReport(icao)
    if (cached) {
      setMetar(cached)
      setStatus('idle')
    }
    load(Boolean(cached))

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
    // a removed favourite's report leaves storage too
    pruneCache(sorted)
  }

  const isValid = isIcao(icao)
  const isFavourite = favourites.includes(icao)
  const isFull = favourites.length >= MAX_FAV

  return (
    <>
      <MetarResult
        icao={icao}
        metar={metar}
        status={status}
        refreshing={refreshing}
      />
      <div className="flex flex-col gap-2">
        <IcaoInput value={icao} onChange={setIcao}>
          <FavouriteToggle
            isFavourite={isFavourite}
            canAdd={isValid && !isFull}
            onAdd={() => {
              const next = [...favourites, icao]
              updateFavourites(next)
              // keep the report already on screen; any fetch replaces it
              if (metar) cacheReports({ [icao]: metar }, next, -1)
            }}
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
