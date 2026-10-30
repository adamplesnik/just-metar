import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import IcaoInput from './partials/IcaoInput'
import MetarResult, { type Status } from './partials/MetarResult'
import RecentCodes from './partials/RecentCodes'

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

    const controller = new AbortController()
    setStatus('loading')

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
        setStatus('idle')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [icao])

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <IcaoInput value={icao} onChange={setIcao} />
        <RecentCodes codes={recent} onSelect={setIcao} />
      </div>
      <MetarResult icao={icao} metar={metar} status={status} />
    </div>
  )
}
