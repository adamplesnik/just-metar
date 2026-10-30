import LoadingDots from './LoadingDots'
import StatusText from './StatusText'

export type Status = 'idle' | 'loading' | 'error'

type Props = {
  icao: string
  metar: string | null
  status: Status
}

export default function MetarResult({ icao, metar, status }: Props) {
  return (
    <>
      {status === 'loading' && <LoadingDots />}
      {status === 'error' && <StatusText text="Could not fetch METAR." />}
      {status === 'idle' && icao.length !== 4 && (
        <StatusText text="METAR appears here." />
      )}
      {status === 'idle' &&
        icao.length === 4 &&
        (metar ? (
          <div className="text-xl whitespace-pre-wrap">{metar}</div>
        ) : (
          <StatusText text="No METAR available for this station." />
        ))}
    </>
  )
}
