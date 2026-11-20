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

// METAR + TAF for one station; null when the station has no METAR
const fetchReport = (icao: string, signal: AbortSignal) =>
  fetchReports([icao], signal).then((reports) => reports[icao] ?? null)

const sameReport = (a: Metar | null, b: Metar | null) =>
  a?.raw === b?.raw && a?.taf === b?.taf && a?.name === b?.name

const FAV_KEY = 'just-metar:favourites'
const CACHE_KEY = 'just-metar:cache'
const LAST_KEY = 'just-metar:last'
const MAX_FAV = 4
const CACHE_TTL_MS = 120 * 60 * 1000
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

// last fetched report per favourite so it shows instantly while a fresh copy
// loads; other stations are never stored. Entries older than CACHE_TTL_MS are
// never shown.
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

function cachedReport(icao: string): Metar | null {
  const entry = cache[icao]
  return entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS
    ? entry.report
    : null
}

// drop non-favourite and expired entries, then persist
function pruneCache(favourites: string[]) {
  const now = Date.now()
  for (const key of Object.keys(cache)) {
    if (
      !favourites.includes(key) ||
      now - cache[key].fetchedAt >= CACHE_TTL_MS
    ) {
      delete cache[key]
    }
  }
  save(CACHE_KEY, JSON.stringify(cache))
}

// store a favourite's report; other stations are ignored
function cacheReport(icao: string, report: Metar, favourites: string[]) {
  if (!favourites.includes(icao)) return
  cache[icao] = { report, fetchedAt: Date.now() }
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

  // keep every favourite warm: when any is missing or about to expire
  // (before the next check), refetch all of them together
  useEffect(() => {
    let controller: AbortController | null = null

    const warm = () => {
      if (document.hidden || controller) return
      const favs = favouritesRef.current
      const stale = favs.some((f) => {
        const entry = cache[f]
        return (
          !entry || Date.now() - entry.fetchedAt > CACHE_TTL_MS - REFRESH_MS
        )
      })
      if (!stale) return

      const current = new AbortController()
      controller = current
      fetchReports(favs, current.signal)
        .then((reports) => {
          for (const [f, report] of Object.entries(reports)) {
            if (favs.includes(f))
              cacheReport(f, report, favouritesRef.current)
          }
        })
        .catch(() => {
          // warming is best effort; the next check retries
        })
        .finally(() => {
          if (controller === current) controller = null
        })
    }

    warm()
    const interval = setInterval(warm, REFRESH_MS)
    document.addEventListener('visibilitychange', warm)
    return () => {
      controller?.abort()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', warm)
    }
  }, [favourites])

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
      setRefreshing(false)
      return
    }

    let controller = new AbortController()
    let lastFetch = 0

    // background loads keep the shown report and ignore failures
    const load = (background: boolean) => {
      controller.abort()
      controller = new AbortController()
      const { signal } = controller
      lastFetch = Date.now()
      if (!background) setStatus('loading')
      setRefreshing(background)

      fetchReport(icao, signal)
        .then((report) => {
          if (report) {
            cacheReport(icao, report, favouritesRef.current)
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
