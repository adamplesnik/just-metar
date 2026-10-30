![just-metar](public/github.png)

# JUST METAR

A minimal METAR lookup. Type a four-letter ICAO airport code and get the latest raw METAR.

- Open `/LZIB` (or any code) to prefill the form.
- The last three successful lookups are kept in the browser and shown as quick buttons.
- All caps, because we are all aviators.

Data comes from the [Aviation Weather Center](https://aviationweather.gov/data/api/).

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
