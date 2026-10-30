import LoadingDots from './LoadingDots'

export type Status = 'idle' | 'loading' | 'error'

type Props = {
  icao: string
  metar: string | null
  status: Status
}

export default function MetarResult({ icao, metar, status }: Props) {
  return (
    <pre className="text-xl whitespace-pre-wrap">
      {status === 'loading' && <LoadingDots />}
      {status === 'error' && (
        <span className="text-red-500 dark:text-red-400">
          Could not fetch METAR.
        </span>
      )}
      {status === 'idle' &&
        icao.length === 4 &&
        (metar ?? (
          <span className="text-neutral-500 dark:text-neutral-400">
            No METAR available for this station.
          </span>
        ))}
    </pre>
  )
}
