import { useEffect, useState } from 'react'
import LoadingDots from './LoadingDots'
import StatusText from './StatusText'

export type Status = 'idle' | 'loading' | 'error'

export type Metar = {
  raw: string
  name: string | null
  taf: string | null
}

// one change group per row: FM, BECMG, TEMPO and PROB start a new row (PROB TEMPO stays together)
function tafRows(raw: string) {
  return raw
    .trim()
    .split(/(?<!PROB\d{2})\s+(?=(?:FM\d{6}|BECMG|TEMPO|PROB\d{2})\b)/)
}

type Props = {
  icao: string
  metar: Metar | null
  status: Status
  refreshing: boolean
}

// observation time from the "DDHHMMZ" group (UTC), resolved against the user's clock
function observationTime(raw: string, now: Date): Date | null {
  const match = /\b(\d{2})(\d{2})(\d{2})Z\b/.exec(raw)
  if (!match) return null
  const [day, hour, minute] = match.slice(1).map(Number)
  let obs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute)
  // a day in the future means the report is from the previous month
  if (obs > now.getTime() + 60 * 60 * 1000) {
    obs = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      day,
      hour,
      minute,
    )
  }
  return new Date(obs)
}

function MetarAge({ raw, refreshing }: { raw: string; refreshing: boolean }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000)
    return () => clearInterval(id)
  }, [])

  const obs = observationTime(raw, now)
  if (!obs) return null

  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - obs.getTime()) / 60000),
  )
  const localTime = obs.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-1">
      {refreshing && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 animate-[spin_1.5s_ease-in-out_infinite] text-main-dim"
          role="img"
          aria-label="Checking for a newer report"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      <div
        className={`label-sm ${
          minutes >= 61
            ? 'text-red'
            : minutes >= 31
              ? 'text-orange'
              : 'text-green'
        }`}
        title={`Observed at ${localTime} local time`}
      >
        {minutes} min ago
      </div>
    </div>
  )
}

export default function MetarResult({
  icao,
  metar,
  status,
  refreshing,
}: Props) {
  return (
    <div className="pt-8">
      {status === 'loading' && <LoadingDots key={icao} />}
      {status === 'error' && <StatusText text="Could not fetch METAR." />}
      {status === 'idle' && icao.length !== 4 && (
        <StatusText text="METAR appears here." />
      )}
      {status === 'idle' &&
        icao.length === 4 &&
        (metar ? (
          <>
            <div className="flex pb-4">
              <div className="flex-1 label-sm text-main-dim">{metar.name}</div>
              <MetarAge raw={metar.raw} refreshing={refreshing} />
            </div>
            <div className="copy-lg whitespace-pre-wrap">{metar.raw}</div>
            {metar.taf && (
              <div className="pt-6 copy-md text-main-dim">
                {tafRows(metar.taf).map((row, i) => (
                  <div key={i} className="pb-1">
                    {row}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <StatusText text="No METAR available for this station." />
        ))}
    </div>
  )
}
