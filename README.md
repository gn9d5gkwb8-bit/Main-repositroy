# Kings Club

The web app for Kings Club — a late-night venue and members' club. A single-page
site backed by a small Node HTTP server: the programme comes from an API, and
table reservations are validated server-side.

> Listings, prices, address and phone number in this build are placeholders.
> Replace the programme in `src/events.ts` and the venue details in
> `public/index.html` with the real ones.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000, reloads on change
```

## Layout

| Path                  | What it is                                             |
| --------------------- | ------------------------------------------------------ |
| `public/index.html`   | The page — hero, programme, rooms, membership, booking |
| `public/styles.css`   | All styling; no framework, no build step               |
| `public/app.js`       | Fetches the programme, filters it, submits the booking |
| `src/server.ts`       | Static file server plus the JSON API                   |
| `src/events.ts`       | The programme and the date/category helpers            |
| `src/reservations.ts` | Booking validation and reference generation            |

## API

| Endpoint                        | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `GET /api/events`               | Upcoming events, soonest first                 |
| `GET /api/events?category=live` | Filtered by `club-night`, `live`, or `members` |
| `POST /api/reservations`        | Books a table; returns a `KC-XXXXXX` reference |

Reservations are held in memory for the life of the process — swap
`src/server.ts`'s `reservations` array for a real store before taking bookings
for real.

## Scripts

- `npm run dev` — run the server with auto-reload
- `npm run build` / `npm start` — compile to `dist/`, then run it
- `npm test` / `npm run test:watch` — Vitest
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier

`PORT` overrides the default port 3000.
