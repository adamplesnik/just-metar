import { useNavigate, useParams } from 'react-router'
import { JustMetar } from './lib'

// the website: the package component plus URL routing (/LZIB)
export default function MetarPage() {
  const { code } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mt-12 flex flex-col gap-12">
      <JustMetar
        endpoint="/api/data/metar"
        defaultCode={code}
        onCodeChange={(next) => {
          if (/^[A-Z]{4}$/.test(next)) navigate(`/${next}`, { replace: true })
        }}
      />
    </div>
  )
}
