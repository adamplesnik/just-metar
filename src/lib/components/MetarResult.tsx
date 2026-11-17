import LoadingDots from './LoadingDots'
import MetarResultTooltip from './MetarResultTooltip'
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
  /** compact: no top padding and no airport-name tooltip (the card shows a title) */
  compact?: boolean
}

function MetarText({
  icao,
  metar,
  tooltip,
}: {
  icao: string
  metar: Metar
  tooltip: boolean
}) {
  // mark the first occurrence of the station code, e.g. "METAR LKPR 152030Z …"
  const match = new RegExp(`\\b${icao}\\b`).exec(metar.raw)
  if (!tooltip || !match || !metar.name) return <>{metar.raw}</>

  const before = metar.raw.slice(0, match.index)
  const after = metar.raw.slice(match.index + icao.length)

  return (
    <>
      {before}
      <MetarResultTooltip label={icao} tooltip={metar.name} />
      {after}
    </>
  )
}

export default function MetarResult({
  icao,
  metar,
  status,
  compact = false,
}: Props) {
  return (
    <div className={`jm:relative ${compact ? '' : 'jm:pt-2'}`}>
      {status === 'loading' && <LoadingDots key={icao} />}
      {status === 'error' && <StatusText text="Could not fetch METAR." />}
      {status === 'idle' && icao.length !== 4 && (
        <StatusText text="METAR appears here." />
      )}
      {status === 'idle' &&
        icao.length === 4 &&
        (metar ? (
          <div className="jm:text-xl jm:whitespace-pre-wrap">
            <MetarText icao={icao} metar={metar} tooltip={!compact} />
          </div>
        ) : (
          <StatusText text="No METAR available for this station." />
        ))}
    </div>
  )
}
