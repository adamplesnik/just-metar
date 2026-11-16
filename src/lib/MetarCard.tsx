import MetarResult from './components/MetarResult'
import Root from './components/Root'
import { useMetar } from './useMetar'
import type { Theme } from './utils'

export type MetarCardProps = {
  /** Proxy of https://aviationweather.gov/api/data/metar, e.g. "/api/metar". */
  endpoint: string
  /** ICAO code of the station, e.g. "LZIB". */
  code: string
  theme?: Theme
  className?: string
}

export default function MetarCard({
  endpoint,
  code,
  theme,
  className,
}: MetarCardProps) {
  const icao = code.toUpperCase()
  const { metar, status } = useMetar(endpoint, icao)

  return (
    <Root theme={theme} className={className}>
      <div className="jm:flex jm:flex-col jm:gap-2">
        <div className="jm:text-xs jm:text-main-dim">
          {icao}
          {metar?.name && ` · ${metar.name}`}
        </div>
        <MetarResult icao={icao} metar={metar} status={status} compact />
      </div>
    </Root>
  )
}
