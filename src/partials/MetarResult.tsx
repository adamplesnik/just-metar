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
}

function MetarText({ icao, metar }: { icao: string; metar: Metar }) {
  // mark the first occurrence of the station code, e.g. "METAR LKPR 152030Z …"
  const match = new RegExp(`\\b${icao}\\b`).exec(metar.raw)
  if (!match || !metar.name) return <>{metar.raw}</>

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

export default function MetarResult({ icao, metar, status }: Props) {
  return (
    <div className="relative pt-8">
      {status === 'loading' && <LoadingDots key={icao} />}
      {status === 'error' && <StatusText text="Could not fetch METAR." />}
      {status === 'idle' && icao.length !== 4 && (
        <StatusText text="METAR appears here." />
      )}
      {status === 'idle' &&
        icao.length === 4 &&
        (metar ? (
          <div className="text-xl whitespace-pre-wrap">
            <MetarText icao={icao} metar={metar} />
          </div>
        ) : (
          <StatusText text="No METAR available for this station." />
        ))}
    </div>
  )
}
