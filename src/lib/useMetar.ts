import { useEffect, useRef, useState } from 'react'
import type { Metar, Status } from './components/MetarResult'
import { isIcao } from './utils'

type ApiReport = { rawOb?: string; name?: string }

const metarUrl = (endpoint: string, icao: string) =>
  `${endpoint}${endpoint.includes('?') ? '&' : '?'}ids=${icao}&format=json`

/**
 * Fetches the latest METAR for `icao` from `endpoint`, a proxy of
 * https://aviationweather.gov/api/data/metar (the API sends no CORS headers).
 */
export function useMetar(
  endpoint: string,
  icao: string,
  onFound?: (icao: string) => void,
) {
  const [metar, setMetar] = useState<Metar | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  // latest callback without refetching when the parent passes a new function
  const onFoundRef = useRef(onFound)
  useEffect(() => {
    onFoundRef.current = onFound
  })

  useEffect(() => {
    if (!isIcao(icao)) {
      setMetar(null)
      setStatus('idle')
      return
    }

    const controller = new AbortController()
    setStatus('loading')

    fetch(metarUrl(endpoint, icao), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        // 204 = no METAR for this station
        return res.status === 204 ? [] : res.json()
      })
      .then((data: ApiReport[]) => {
        const report = Array.isArray(data) ? data[0] : undefined
        if (report?.rawOb) {
          setMetar({ raw: report.rawOb, name: report.name ?? null })
          onFoundRef.current?.(icao)
        } else {
          setMetar(null)
        }
        setStatus('idle')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [endpoint, icao])

  return { metar, status }
}
