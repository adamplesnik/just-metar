import { useEffect, useState } from 'react'
import StatusText from './StatusText'

// cycles ".", "..", "..." while mounted
export default function LoadingDots() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const tick = setInterval(() => setCount((n) => (n % 3) + 1), 400)
    return () => clearInterval(tick)
  }, [])

  return <StatusText text={'Loading' + '.'.repeat(count)} />
}
