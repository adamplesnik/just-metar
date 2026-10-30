import { useEffect, useState } from 'react'
import StatusText from './StatusText'

const STAGES = [
  { after: 0, text: 'Loading' },
  { after: 3000, text: 'Pretending I can read METAR' },
  { after: 6000, text: 'Fly somewhere else?' },
]

// cycles ".", "..", "..." while mounted; the text changes the longer it takes
export default function LoadingDots() {
  const [count, setCount] = useState(1)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => setCount((n) => (n % 3) + 1), 400)
    const timers = STAGES.slice(1).map(({ after }, i) =>
      setTimeout(() => setStage(i + 1), after),
    )
    return () => {
      clearInterval(tick)
      timers.forEach(clearTimeout)
    }
  }, [])

  return <StatusText text={STAGES[stage].text + '.'.repeat(count)} />
}
