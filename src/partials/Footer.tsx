function IconArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}

function IconCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-2.5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export default function Footer() {
  return (
    <div className="w full flex items-center gap-2 pb-8">
      <h1 className="flex-1 text-xs font-bold">
        <a href="/" className="flex items-center gap-1">
          <IconCircle />
          JUST METAR
        </a>
      </h1>
      <a
        href="https://www.npmjs.com/package/just-metar"
        className="flex items-start gap-1 text-xs text-main-dim hover:text-main"
        target="blank"
      >
        <span className="underline">npmjs</span>
        <IconArrow />
      </a>
      <a
        href="https://github.com/adamplesnik/just-metar"
        className="flex items-start gap-1 text-xs text-main-dim hover:text-main"
        target="blank"
      >
        <span className="underline">GitHub</span>
        <IconArrow />
      </a>
    </div>
  )
}
