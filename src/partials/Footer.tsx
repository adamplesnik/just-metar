export default function Footer() {
  return (
    <div className="w full flex justify-between">
      <h1 className="mt-auto text-xs font-bold">
        <a href="/">Just METAR</a>
      </h1>
      <a
        href="https://github.com/adamplesnik/just-metar"
        className="flex items-start gap-1 text-xs text-main-dim hover:text-main"
        target="blank"
      >
        <span className="underline">GitHub</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </a>
    </div>
  )
}
