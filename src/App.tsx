import { Route, Routes } from 'react-router'
import MetarLookup from './MetarLookup'
import Header from './partials/Header'

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-8">
      <Header />
      <div className="flex flex-1 flex-col justify-between">
        <Routes>
          <Route path="/:code?" element={<MetarLookup />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
