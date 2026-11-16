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
import { JustMetar } from 'just-metar'
import 'just-metar/style.css'

// search, favourites and result
<JustMetar endpoint="/api/metar" />

// search and result, no favourites
<JustMetar endpoint="/api/metar" noFavourites />

// predefined favourites the user can change
<JustMetar endpoint="/api/metar" favourites={['LZIB', 'LOWW']} />

// fixed favourites, no search
<JustMetar endpoint="/api/metar" noInput favourites={['LZKZ', 'LZIB', 'LOWW']} />

// one station: airport name as title, METAR below
<JustMetar endpoint="/api/metar" noInput noFavourites code="LZIB" />
```

| Prop           | Default      |                                                                                                                                                                                   |
| -------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`     |              | Required. Proxy of `https://aviationweather.gov/api/data/metar`, see below.                                                                                                       |
| `noInput`      | `false`      | Hides the ICAO input and the FAV checkbox.                                                                                                                                        |
| `noFavourites` | `false`      | Hides the favourites bar.                                                                                                                                                         |
| `favourites`   |              | One to four ICAO codes, sorted alphabetically. With the input shown they are the starting set; users can add and remove (saved in `localStorage`). With `noInput` they are fixed. |
| `code`         |              | One ICAO code. Only together with `noInput` and `noFavourites`; TypeScript rejects it otherwise.                                                                                  |
| `defaultCode`  |              | Code shown first. Falls back to the last lookup, then the first favourite.                                                                                                        |
| `onCodeChange` |              | Called when the selected code changes, e.g. to sync the URL.                                                                                                                      |
| `storageKey`   | `just-metar` | `localStorage` key prefix for favourites and the last code.                                                                                                                       |
| `theme`        | `system`     | `'system'` \| `'light'` \| `'dark'`                                                                                                                                               |
| `className`    |              | Added to the root element.                                                                                                                                                        |

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
