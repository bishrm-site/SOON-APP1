# Soon: what a reviewer must check

Status key: **Done** = built and tested here. **Check** = built, reviewer should verify. **Gap** = not built, must be fixed before real users.

## 1. Authentication and sessions
| Item | Status |
|---|---|
| OTP is random per request, single use, expires in 5 min, locks after 5 wrong tries | Check (code is fixed `1234` in demo; **Gap** until an SMS provider is wired) |
| OTP send is rate limited per number and per IP | Done (5 per 10 min per number) |
| Session token is 256-bit random, stored hashed, 30 day expiry, logout deletes it | Check |
| Token is kept in localStorage: any XSS steals it. Consider httpOnly cookie plus CSRF protection | Gap (decision needed) |
| Admin login is phone OTP only. Admins need a stronger factor (email plus authenticator) | Gap |
| Rate limits are in memory, per process. Move to Redis if more than one instance runs | Gap |
| IP detection trusts `x-forwarded-for`. Only safe behind a proxy you control | Check |

## 2. Authorization (most common real-world bug)
- Every route checks role and ownership: owners only touch their own shop, items and orders. Tests cover cross-shop access, but the reviewer should read each route in `server.js` and try IDs from another account.
- Customers only receive approved shops (plus shops of their own past orders). Confirm no other endpoint leaks pending shops or other users' orders.
- Price and total are computed on the server; the client sends only item ids and quantities. Confirm no route trusts a client price.

## 3. Input validation and injection
- All SQL uses bound parameters; search for string-built SQL (there should be none).
- Text fields strip `< > " \`` and `\`, and apostrophes become typographic. The UI builds HTML with template strings, so this is the only XSS barrier. **Check:** a proper fix is escaping on output everywhere in `app.js`; recommend doing this before launch.
- Quantities, prices, stock are range-checked integers. Request body is capped at 20 KB.
- CSP header allows `'unsafe-inline'` scripts because the UI uses inline handlers. Refactor to remove it.

## 4. Stock and order integrity
- Atomic reservation, reject/timeout release, delivery decrement: tested including 40-way concurrency.
- Database constraints (`reserved <= on_hand`, no negatives) are the last line of defence. Keep them.
- Reviewer: test a shop owner lowering stock below reserved, deleting an item with open orders, and double-clicking status buttons.
- SQLite handles one writer at a time, fine for a pilot. Past roughly 50 orders a minute, move to PostgreSQL.

## 5. Payments (none built)
- Use Razorpay or similar, never touch card data.
- Create the payment order on the server; verify the signature on the server; handle webhooks idempotently.
- Decide refund rules for rejected and timed-out paid orders.
- Cash on delivery: define who bears loss on fake orders.

## 6. Privacy and legal (India, DPDP Act 2023)
- Phone numbers, names, order history and location are personal data. Needs a privacy policy, consent at sign-up, and a delete-my-data path.
- Shops must hold FSSAI registration; document upload and verification is not built.
- GST invoice, consumer grievance contact and terms of service are required for a marketplace.
- Do not log full phone numbers (current logs mask them).

## 7. Operations
- HTTPS only; HSTS at the proxy.
- Secrets and config via environment, none in git (`.env` is ignored).
- Daily backup of `soon.db` with a tested restore.
- Error monitoring (Sentry) and uptime check on `/api/health`.
- Logs: orders, admin actions and failed logins are logged; add an audit table for admin actions.
- Dependencies: the server has none; frontend loads Leaflet and fonts from CDNs. Pin versions and add subresource integrity hashes, or self-host.

## 8. Performance
- State endpoint returns all shops and items on every 4 second poll. Fine for tens of users; add pagination, ETags or server-sent events before hundreds.
- Distance and search run in the browser. Move to a server query (PostGIS) when shops exceed a few hundred.
- Run a load test (k6) on `/api/state` and `/api/orders`.

## 9. UI, accessibility and devices
- **The UI has not been seen in a real browser by the builder.** Logic is tested with a stubbed DOM only. First task: open it on a real phone and laptop and walk every screen.
- Test Chrome Android, Safari iPhone, small screens (360 px), slow 3G, dark mode.
- Accessibility: many controls are clickable `div`s without keyboard focus or labels. Add buttons, aria labels, visible focus, contrast check, tap targets of at least 44 px.
- PWA: install prompt, offline screen, update flow after a deploy (bump `CACHE` in `sw.js`).

## 10. Store readiness (if wrapped later)
- Apple requires more than a web view wrapper; expect push, native features, and account deletion in app.
- Play requires privacy policy URL and data safety form.

## Hand-off note for a freelance reviewer
Scope: 1 to 2 days. Deliver: written findings ranked high, medium, low, with a fix for each high. Start with sections 1, 2, 3 and 5. Repo is about 380 lines of server code (server.js, db.js) and one 46 KB front-end file; run `bun test` first (18 tests should pass). Accounts for testing are in `README.md`. Out of scope: payment design, legal text.
