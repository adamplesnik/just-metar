import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

const METAR_URL = (icao: string) => `/api/data/metar?ids=${icao}&format=raw`

const STORAGE_KEY = 'just-metar:recent'
const MAX_RECENT = 3

function loadRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((c) => typeof c === 'string' && /^[A-Z]{4}$/.test(c))
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export default function MetarLookup() {
  const [recent, setRecent] = useState(loadRecent)
  const { code } = useParams()
  const navigate = useNavigate()
  // URL code wins over the last remembered one
  const [icao, setIcao] = useState(() => {
    const fromUrl = code?.toUpperCase()
    return fromUrl && /^[A-Z]{4}$/.test(fromUrl) ? fromUrl : (recent[0] ?? '')
  })
  const [metar, setMetar] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [elapsed, setElapsed] = useState<number | null>(null) // ms since last request started

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
      setElapsed(null)
      return
    }

    const controller = new AbortController()
    const startedAt = performance.now()
    const tick = setInterval(
      () => setElapsed(performance.now() - startedAt),
      100,
    )
    const stopTimer = () => {
      clearInterval(tick)
      setElapsed(performance.now() - startedAt)
    }
    setStatus('loading')
    setElapsed(0)

    fetch(METAR_URL(icao), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.text()
      })
      .then((text) => {
        setMetar(text.trim() || null) // empty = no METAR for this station
        if (text.trim()) {
          setRecent((prev) => {
            const next = [icao, ...prev.filter((c) => c !== icao)].slice(
              0,
              MAX_RECENT,
            )
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {
              // storage unavailable (private mode / quota): keep in memory only
            }
            return next
          })
        }
        stopTimer()
        setStatus('idle')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        stopTimer()
        setStatus('error')
      })

    return () => {
      clearInterval(tick)
      controller.abort()
    }
  }, [icao])

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="icaoCode"
            className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
          >
            ICAO code
          </label>
          <input
            className="h-10 w-24 rounded-md border border-neutral-400 px-3 uppercase hover:border-neutral-900 dark:border-neutral-600 hover:dark:border-neutral-300"
            value={icao}
            id="icaoCode"
            onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
            spellCheck={false}
            autoComplete="off"
            aria-label="ICAO airport code"
          />
        </div>
        {recent.length > 0 && (
          <div className="flex h-10 items-center gap-2">
            {recent.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setIcao(code)}
                className="h-8 cursor-pointer rounded bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-500"
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>

      <pre className="text-xl whitespace-pre-wrap">
        {status === 'loading' && 'Loading…'}
        {status === 'error' && 'Could not fetch METAR.'}
        {status === 'idle' &&
          icao.length === 4 &&
          (metar ?? 'No METAR available for this station.')}
      </pre>
      {elapsed !== null && (
        <p className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
          {(elapsed / 1000).toFixed(1)} s{status === 'loading' && ' …'}
        </p>
      )}
    </div>
  )
}
