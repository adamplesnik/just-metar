![just-metar](public/github.png)

# JUST METAR

A minimal METAR lookup. Type a four-letter ICAO airport code and get the latest raw METAR.

- Open `/LZIB` (or any code) to prefill the form.
- Save up to four favourite airports with the FAV checkbox; they are kept in the browser.
- All caps, because we are all aviators.

Data comes from the [Aviation Weather Center](https://aviationweather.gov/data/api/).

## npm package

The components are also published as [`just-metar`](https://www.npmjs.com/package/just-metar) for React 18 and 19.

```
npm install just-metar
```

```tsx
import { MetarCard, MetarFavourites, MetarLookup } from 'just-metar'
import 'just-metar/style.css'

// 1. search, favourites and result
<MetarLookup endpoint="/api/metar" />

// 2. search and result, no favourites
<MetarLookup endpoint="/api/metar" favourites={false} />

// 3. fixed set of 2–4 airports, no search
<MetarFavourites endpoint="/api/metar" airports={['LZKZ', 'LZIB', 'LOWW']} />

// 4. one station: airport name as title, METAR below
<MetarCard endpoint="/api/metar" code="LZIB" />
```

Every component takes `theme` (`'system'` by default, `'light'` or `'dark'`) and `className` for layout.

| Prop           | Component                        |                                                                                   |
| -------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `endpoint`     | all                              | Required. Proxy of `https://aviationweather.gov/api/data/metar`, see below.       |
| `theme`        | all                              | `'system'` \| `'light'` \| `'dark'`                                               |
| `className`    | all                              | Added to the root element.                                                        |
| `favourites`   | `MetarLookup`                    | Show the FAV checkbox and the favourites bar. Default `true`.                     |
| `defaultCode`  | `MetarLookup`, `MetarFavourites` | Code shown first. `MetarLookup` falls back to the last successful lookup.         |
| `onCodeChange` | `MetarLookup`                    | Called when the typed code changes, e.g. to sync the URL.                         |
| `storageKey`   | `MetarLookup`                    | `localStorage` key prefix for favourites and the last code. Default `just-metar`. |
| `airports`     | `MetarFavourites`                | Two to four ICAO codes, shown in the given order.                                 |
| `code`         | `MetarCard`                      | ICAO code of the station.                                                         |

There is also a `useMetar(endpoint, code)` hook returning `{ metar, status }` for your own UI.

### Endpoint (required)

The Aviation Weather API sends no CORS headers, so browsers can't call it from your site directly. Proxy it on your own domain and pass that path as `endpoint`. The components add `?ids=LZIB&format=json`.

Vercel (`vercel.json`):

```json
{
  "rewrites": [
    {
      "source": "/api/metar",
      "destination": "https://aviationweather.gov/api/data/metar"
    }
  ]
}
```

Netlify (`netlify.toml`):

```toml
[[redirects]]
  from = "/api/metar"
  to = "https://aviationweather.gov/api/data/metar"
  status = 200
```

Vite dev server (`vite.config.ts`):

```ts
server: {
  proxy: {
    '/api/metar': {
      target: 'https://aviationweather.gov',
      changeOrigin: true,
      // swap only the path, keep the ?ids=…&format=json query
      rewrite: (path) => path.replace(/^\/api\/metar/, '/api/data/metar'),
    },
  },
}
```

### Styling

The stylesheet is scoped: classes are prefixed (`jm:`), there is no global reset, and the components don't set a page background, so they sit on yours. The font is [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) with a system monospace fallback; load it yourself if you want the exact look. Light and dark use CSS `light-dark()`, supported by browsers since 2024.

### Building the package

```
npm run build:lib   # dist-lib/: index.js, style.css, types/
npm publish         # runs build:lib first
```

## Stack

React, Vite, TypeScript, Tailwind CSS, React Router.

## Development

```
npm install
npm run dev
```

## Deployment

The Aviation Weather API does not send CORS headers, so requests go through `/api/data/metar`, which is proxied by Vite in development and by a rewrite in `vercel.json` in production. The same file sends all other paths to `index.html` so direct links like `/LZIB` work. On another host you need to set up equivalent rules.

## License

MIT, see [LICENSE](LICENSE).
