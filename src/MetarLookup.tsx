import { useEffect, useState } from "react";

const METAR_URL = (icao: string) => `/api/data/metar?ids=${icao}&format=raw`;

export default function MetarLookup() {
  const [icao, setIcao] = useState("");
  const [metar, setMetar] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!/^[A-Z]{4}$/.test(icao)) {
      setMetar(null);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    fetch(METAR_URL(icao), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        setMetar(text.trim() || null); // empty = no METAR for this station
        setStatus("idle");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, [icao]);

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="icaoCode"
          className="text-sm font-medium text-neutral-800 dark:text-neutral-400"
        >
          Aerodrome ICAO code
        </label>
        <input
          className="w-48 rounded border border-neutral-500 px-3 py-2 uppercase"
          value={icao}
          id="icaoCode"
          onChange={(e) => setIcao(e.target.value.toUpperCase().slice(0, 4))}
          maxLength={4}
          spellCheck={false}
          autoComplete="off"
          aria-label="ICAO airport code"
        />
      </div>
      <pre className="text-xl whitespace-pre-wrap">
        {status === "loading" && "Loading…"}
        {status === "error" && "Could not fetch METAR."}
        {status === "idle" &&
          icao.length === 4 &&
          (metar ?? "No METAR available for this station.")}
      </pre>
    </div>
  );
}
