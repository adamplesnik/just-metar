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
      <h1 className="mt-auto text-xs font-bold">Just METAR</h1>
    </main>
  )
}

export default App
