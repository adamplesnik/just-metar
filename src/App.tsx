import { Route, Routes } from 'react-router'
import MetarPage from './MetarPage'
import Footer from './partials/Footer'

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md min-w-74 flex-col px-4">
      <div className="flex-1">
        <Routes>
          <Route path="/:code?" element={<MetarPage />} />
        </Routes>
      </div>
      <Footer />
    </main>
  )
}

export default App
