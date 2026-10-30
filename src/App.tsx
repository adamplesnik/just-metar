import MetarLookup from "./MetarLookup";

function App() {
  return (
    <main className="mx-auto max-w-2xl p-4 min-h-screen flex flex-col">
      <div className="flex-1">
        <MetarLookup />
      </div>
      <h1 className="mb-4 mt-auto text-xs font-bold">Just METAR.</h1>
    </main>
  );
}

export default App;
