# Soon (pilot build)

Hyperlocal grocery marketplace. Customers order from nearby shops, shop owners manage stock and orders, an admin approves shops.

## Run it

```
bun run server.js          # http://localhost:3000
PORT=8080 bun run server.js
bun test                   # 18 tests: API, security, concurrency, UI logic
```

Needs [Bun](https://bun.sh) 1.x. No other dependencies. Data lives in `soon.db` (SQLite), created and seeded on first run. Delete the file to reset.

## Demo logins (OTP is always 1234)

| Role | Mobile |
|---|---|
| Customer | 90000 00001 (any new number also works) |
| Shop owner | 98450 00001 to 98450 00004 (the four live shops), 98450 11223 (pending shop) |
| Admin | 90000 00000 |

## What is real

- Phone OTP login with sessions, rate limits and role checks on every route
- SQLite database; shops, items, orders, users persist
- Stock reservation is atomic: `UPDATE ... WHERE on_hand - reserved >= qty`. 40 simultaneous orders for 5 units sell exactly 5 (tested)
- Reject and 10 minute auto-timeout release stock; delivery reduces on-hand
- Shop registration, admin approve, reject (with reason), suspend
- Live status through 4 second polling
- Installable PWA (manifest and service worker)

## What is still a stand-in

- **OTP:** no SMS is sent. Plug a provider (MSG91, Twilio) into `/api/otp/send` in `server.js` and generate a random code
- **Payments:** none, orders are cash on delivery. Add Razorpay before charging anyone
- **Delivery time and distance:** estimated in the browser from straight-line distance, not routing
- **Shop documents (FSSAI, GST):** the form only shows ticks, nothing is uploaded or verified
- **Owner sales chart:** illustrative numbers plus today's revenue
- **Push notifications and rider tracking:** not built, orders update by polling

## Hosting

Any small Linux VM, or Railway, Render, Fly.io (needs a persistent disk for `soon.db`). Put it behind HTTPS (required for the PWA install and service worker). Set `PORT`, `DB_PATH`, `ORDER_TIMEOUT_MIN`. Back up `soon.db` daily. Before real users, work through `docs/reviewer-checklist.md`.

## Layout

```
server.js   HTTP API + static files     db.js     schema + seed data
public/     index.html, app.js, PWA files
tests/      api.test.js, ui-smoke.test.js
docs/       reviewer-checklist.md, pwa-vs-native.md
```
