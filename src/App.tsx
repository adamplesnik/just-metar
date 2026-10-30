import { Route, Routes } from 'react-router'
import MetarLookup from './MetarLookup'

function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col p-4">
      <div className="flex-1">
        <Routes>
          <Route path="/:code?" element={<MetarLookup />} />
        </Routes>
      </div>
      <div className="w full flex justify-between">
        <h1 className="mt-auto text-xs font-bold">Just METAR</h1>
        <a
          href="https://github.com/adamplesnik/just-metar"
          className="text-xs text-main-dim underline hover:text-main"
          target="blank"
        >
          GitHub
        </a>
      </div>
    </main>
  )
}

export default App
