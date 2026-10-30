import { Route, Routes } from 'react-router'
import MetarLookup from './MetarLookup'
import Footer from './partials/Footer'

function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col p-4">
      <div className="flex-1">
        <Routes>
          <Route path="/:code?" element={<MetarLookup />} />
        </Routes>
      </div>
      <Footer />
    </main>
  )
}

export default App
