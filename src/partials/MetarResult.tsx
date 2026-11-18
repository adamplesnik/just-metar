import { useEffect, useState } from 'react'
import LoadingDots from './LoadingDots'
import StatusText from './StatusText'

export type Status = 'idle' | 'loading' | 'error'

export type Metar = {
  raw: string
  name: string | null
}

type Props = {
  icao: string
  metar: Metar | null
  status: Status
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

function MetarAge({ raw }: { raw: string }) {
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
    <div
      className={`text-sm ${
        minutes >= 1
          ? 'text-rose-500'
          : minutes >= 1
            ? 'text-yellow-500'
            : 'text-emerald-500'
      }`}
      title={`Observed at ${localTime} local time`}
    >
      {minutes} min ago
    </div>
  )
}

export default function MetarResult({ icao, metar, status }: Props) {
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
              <div className="flex-1 text-sm text-main-dim">{metar.name}</div>
              <MetarAge raw={metar.raw} />
            </div>
            <div className="text-xl whitespace-pre-wrap">{metar.raw}</div>
          </>
        ) : (
          <StatusText text="No METAR available for this station." />
        ))}
    </div>
  )
}
