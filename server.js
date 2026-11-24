import { openDb } from "./db.js";
import { join, normalize, extname } from "node:path";
import { createHash, randomBytes } from "node:crypto";

const PUBLIC = join(import.meta.dir, "public");
const DEMO_OTP = process.env.DEMO_OTP || "1234";
const ORDER_TIMEOUT_MS = (+process.env.ORDER_TIMEOUT_MIN || 10) * 60_000;
const SESSION_MS = 30 * 24 * 3600_000;
const FEE_BELOW = 199, FEE = 25;

export function createApp({ dbPath, port = 0, quiet = false } = {}) {
  const db = openDb(dbPath);
  const q = (sql) => db.query(sql);

  // ---------- helpers ----------
  const hash = (t) => createHash("sha256").update(t).digest("hex");
  const log = (...a) => { if (!quiet) console.log(new Date().toISOString(), ...a); };
  class HttpError extends Error { constructor(s, m) { super(m); this.status = s; } }
  const bad = (m, s = 400) => { throw new HttpError(s, m); };
  const phoneOf = (p) => { const d = String(p ?? "").replace(/\D/g, "").slice(-10); return /^[6-9]\d{9}$/.test(d) ? d : null; };
  const text = (v, min, max, label) => {
    let s = String(v ?? "").normalize("NFKC").replace(/[\u0000-\u001f]/g, " ").replace(/'/g, "\u2019").replace(/[<>"`\\]/g, "").replace(/\s+/g, " ").trim();
    if (s.length < min || s.length > max) bad(`${label} must be ${min}-${max} characters`);
    return s;
  };
  const int = (v, min, max, label) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) bad(`${label} must be a whole number between ${min} and ${max}`);
    return n;
  };
  const EMOJI = /^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]{0,10}$/u;

  // ---------- rate limiting (in-memory; use Redis when running more than one instance) ----------
  const hits = new Map();
  function limit(key, max, windowMs) {
    const now = Date.now(); const h = hits.get(key);
    if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return; }
    if (++h.n > max) bad("Too many attempts, please wait a few minutes", 429);
  }

  // ---------- auth ----------
  function auth(req, required = true) {
    const m = /^Bearer ([A-Za-z0-9_-]{20,80})$/.exec(req.headers.get("authorization") || "");
    const row = m && q(`SELECT u.* FROM sessions s JOIN users u ON u.phone=s.phone WHERE s.token_hash=? AND s.expires_at>?`).get(hash(m[1]), Date.now());
    if (!row && required) bad("Please log in again", 401);
    return row || null;
  }
  const need = (u, role) => { if (u.role !== role) bad("Not allowed for your account", 403); };
  function newSession(phone) {
    const token = randomBytes(32).toString("base64url");
    q("INSERT INTO sessions VALUES(?,?,?)").run(hash(token), phone, Date.now() + SESSION_MS);
    return token;
  }
  const userOut = (u) => ({ phone: u.phone, role: u.role, name: u.name, shopId: u.shop_id });

  function checkOtp(phone, code) {
    const o = q("SELECT * FROM otps WHERE phone=?").get(phone);
    if (!o || o.expires_at < Date.now()) bad("OTP expired, request a new one", 400);
    if (o.tries >= 5) bad("Too many wrong OTPs, request a new one", 429);
    const isAdmin = q("SELECT 1 FROM users WHERE phone=? AND role='admin'").get(phone);
    const expected = isAdmin && process.env.ADMIN_CODE ? process.env.ADMIN_CODE : o.code;
    if (String(code ?? "").replace(/\s/g, "") !== expected) {
      q("UPDATE otps SET tries=tries+1 WHERE phone=?").run(phone);
      bad("Wrong OTP", 400);
    }
    q("DELETE FROM otps WHERE phone=?").run(phone);
  }

  // ---------- shape ----------
  const shopOut = (s, withItems = true) => ({
    id: s.id, name: s.name, em: s.em, bg: s.bg, cats: JSON.parse(s.cats), prep: s.prep,
    rating: s.rating ?? "New", lat: s.lat, lng: s.lng, status: s.status, reason: s.reason,
    owner: s.owner, phone: s.phone, open: !!s.open,
    items: withItems ? q("SELECT id,name,em,price,on_hand AS 'on',reserved AS res FROM items WHERE shop_id=? ORDER BY rowid").all(s.id) : [],
  });
  const orderOut = (o) => ({
    id: "#" + (1000 + o.id), address: o.address || "", shopId: o.shop_id, status: o.status, total: o.total, at: o.created_at, customer: o.customer,
    items: q("SELECT item_id AS id,name,qty AS q,price AS p FROM order_items WHERE order_id=?").all(o.id),
  });
  const parseOid = (s) => { const n = Number(decodeURIComponent(String(s)).replace("#", "")) - 1000; return Number.isInteger(n) && n > 0 ? n : bad("Order not found", 404); };

  // ---------- stock ----------
  function release(orderId, deliver) {
    const lines = q("SELECT item_id,qty FROM order_items WHERE order_id=?").all(orderId);
    for (const l of lines) {
      if (deliver) q("UPDATE items SET reserved=reserved-?, on_hand=on_hand-? WHERE id=?").run(l.qty, l.qty, l.item_id);
      else q("UPDATE items SET reserved=reserved-? WHERE id=?").run(l.qty, l.item_id);
    }
  }
  const NEXT = { placed: ["accepted", "rejected"], accepted: ["packing", "rejected"], packing: ["out", "rejected"], out: ["delivered"] };
  function moveOrder(id, to, expectShop) {
    return db.transaction(() => {
      const o = q("SELECT * FROM orders WHERE id=?").get(id);
      if (!o || (expectShop && o.shop_id !== expectShop)) bad("Order not found", 404);
      if (!(NEXT[o.status] || []).includes(to)) bad(`Order is ${o.status}, cannot move to ${to}`, 409);
      const r = q("UPDATE orders SET status=?, updated_at=? WHERE id=? AND status=?").run(to, Date.now(), id, o.status);
      if (r.changes !== 1) bad("Order changed, refresh", 409);
      if (to === "rejected") release(id, false);
      if (to === "delivered") release(id, true);
      return o;
    })();
  }
  const sweep = () => {
    const stale = q("SELECT id FROM orders WHERE status='placed' AND created_at<?").all(Date.now() - ORDER_TIMEOUT_MS);
    for (const o of stale) { try { moveOrder(o.id, "rejected"); log("order timed out", o.id); } catch {} }
    q("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
    q("DELETE FROM otps WHERE expires_at<?").run(Date.now());
    const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  };
  const timer = setInterval(sweep, 30_000);

  // ---------- routes ----------
  const ownerShop = (u) => { need(u, "shop"); return q("SELECT * FROM shops WHERE id=?").get(u.shop_id) || bad("No shop", 404); };
  const CATS = new Set(["Daily needs", "Fresh", "Organic", "Supermarket", "Desserts"]);

  const routes = [];
  const on = (method, re, fn) => routes.push([method, new RegExp("^" + re + "$"), fn]);

  on("POST", "/api/otp/send", async (req, ip, b) => {
    const phone = phoneOf(b.phone) || bad("Enter a valid 10 digit Indian mobile number");
    limit("otp:" + phone, 5, 10 * 60_000); limit("otpip:" + ip, 30, 10 * 60_000);
    q("INSERT OR REPLACE INTO otps VALUES(?,?,?,0)").run(phone, DEMO_OTP, Date.now() + 5 * 60_000);
    log("OTP issued for", phone.slice(0, 2) + "XXXXXX" + phone.slice(-2));
    return { ok: true, demo: true, hint: "Demo mode: no SMS is sent. Use OTP " + DEMO_OTP };
  });

  on("POST", "/api/otp/verify", async (req, ip, b) => {
    const phone = phoneOf(b.phone) || bad("Enter a valid mobile number");
    limit("ver:" + ip, 40, 10 * 60_000);
    checkOtp(phone, b.code);
    const adm = q("SELECT role FROM users WHERE phone=?").get(phone);
    if (adm && adm.role === "admin" && process.env.ADMIN_CODE && String(b.code ?? "").trim() !== process.env.ADMIN_CODE) bad("Wrong OTP", 400);
    const intent = ["customer", "shop", "admin"].includes(b.role) ? b.role : "customer";
    let u = q("SELECT * FROM users WHERE phone=?").get(phone);
    if (!u) {
      if (intent !== "customer") bad(intent === "shop" ? "This number has no shop. Use Register new shop." : "Not an admin number", 403);
      q("INSERT INTO users VALUES(?,?,?,?,?)").run(phone, "customer", "", null, Date.now());
      u = q("SELECT * FROM users WHERE phone=?").get(phone);
    }
    if (u.role !== intent) bad(`This number is registered as ${u.role === "shop" ? "a shop owner" : u.role}. Pick that option instead.`, 403);
    return { token: newSession(phone), user: userOut(u) };
  });

  on("POST", "/api/logout", async (req) => {
    const m = /^Bearer (\S+)$/.exec(req.headers.get("authorization") || "");
    if (m) q("DELETE FROM sessions WHERE token_hash=?").run(hash(m[1]));
    return { ok: true };
  });

  on("GET", "/api/state", async (req) => {
    const u = auth(req);
    let shops, orders;
    if (u.role === "customer") {
      shops = q("SELECT * FROM shops WHERE status='approved' OR id IN (SELECT shop_id FROM orders WHERE customer=?)").all(u.phone).map((s) => shopOut(s));
      orders = q("SELECT * FROM orders WHERE customer=? ORDER BY id DESC LIMIT 100").all(u.phone);
    } else if (u.role === "shop") {
      shops = [shopOut(ownerShop(u))];
      orders = q("SELECT * FROM orders WHERE shop_id=? ORDER BY id DESC LIMIT 200").all(u.shop_id);
    } else {
      shops = q("SELECT * FROM shops ORDER BY rowid").all().map((s) => shopOut(s));
      orders = q("SELECT * FROM orders ORDER BY id DESC LIMIT 300").all();
    }
    const addresses = u.role === "customer" ? q("SELECT id,label,line,lat,lng FROM addresses WHERE phone=? ORDER BY id").all(u.phone) : [];
    const wishlist = u.role === "customer" ? q("SELECT w.item_id FROM wishlist w JOIN items i ON i.id=w.item_id WHERE w.phone=? ORDER BY w.created_at DESC").all(u.phone).map((r) => r.item_id) : [];
    return { user: userOut(u), addresses, wishlist, shops, orders: orders.map(orderOut), serverTime: Date.now() };
  });

  on("POST", "/api/orders", async (req, ip, b) => {
    const u = auth(req); need(u, "customer");
    limit("ord:" + u.phone, +process.env.RATE_ORDERS || 20, 10 * 60_000);
    if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 30) bad("Cart is empty or too large");
    const lines = new Map();
    for (const l of b.items) {
      const id = String(l?.id ?? ""); const qty = int(l?.q, 1, 50, "Quantity");
      lines.set(id, (lines.get(id) || 0) + qty);
    }
    return db.transaction(() => {
      const s = q("SELECT * FROM shops WHERE id=?").get(String(b.shopId));
      if (!s || s.status !== "approved" || !s.open) bad("This shop is not taking orders", 409);
      let total = 0; const rows = [];
      for (const [id, qty] of lines) {
        const it = q("SELECT * FROM items WHERE id=? AND shop_id=?").get(id, s.id);
        if (!it) bad("An item in your cart is no longer sold here", 409);
        const r = q("UPDATE items SET reserved=reserved+? WHERE id=? AND on_hand-reserved>=?").run(qty, id, qty);
        if (r.changes !== 1) bad(`Only limited stock left for ${it.name}`, 409);
        rows.push([it, qty]); total += it.price * qty;
      }
      if (total < FEE_BELOW) total += FEE;
      const now = Date.now();
      let address = "";
      if (b.addressId != null) { const ad = q("SELECT * FROM addresses WHERE id=? AND phone=?").get(Number(b.addressId), u.phone); if (ad) address = ad.label + ": " + ad.line; }
      const r = q("INSERT INTO orders(shop_id,customer,status,total,created_at,updated_at,address) VALUES(?,?,?,?,?,?,?)").run(s.id, u.phone, "placed", total, now, now, address);
      for (const [it, qty] of rows) q("INSERT INTO order_items VALUES(?,?,?,?,?)").run(r.lastInsertRowid, it.id, it.name, qty, it.price);
      log("order", r.lastInsertRowid, "shop", s.id, "total", total);
      return orderOut(q("SELECT * FROM orders WHERE id=?").get(r.lastInsertRowid));
    })();
  });

  on("POST", "/api/orders/([^/]+)/status", async (req, ip, b, m) => {
    const u = auth(req); need(u, "shop");
    const to = String(b.status);
    moveOrder(parseOid(m[1]), to, u.shop_id);
    return orderOut(q("SELECT * FROM orders WHERE id=?").get(parseOid(m[1])));
  });

  const itemBody = (b) => {
    const em = String(b.em ?? "");
    return { name: text(b.name, 1, 60, "Item name"), em: EMOJI.test(em) ? em : "🛒", price: int(b.price, 0, 100000, "Price"), on: int(b.on, 0, 100000, "Stock") };
  };
  on("POST", "/api/items", async (req, ip, b) => {
    const u = auth(req); const s = ownerShop(u);
    if (s.status !== "approved") bad("Your shop is not approved yet", 403);
    const v = itemBody(b);
    if (q("SELECT COUNT(*) c FROM items WHERE shop_id=?").get(s.id).c >= 500) bad("Item limit reached");
    const id = s.id + "n" + randomBytes(5).toString("hex");
    q("INSERT INTO items(id,shop_id,name,em,price,on_hand) VALUES(?,?,?,?,?,?)").run(id, s.id, v.name, v.em, v.price, v.on);
    return { id };
  });
  on("PUT", "/api/items/([^/]+)", async (req, ip, b, m) => {
    const u = auth(req); const s = ownerShop(u); const v = itemBody(b);
    const it = q("SELECT * FROM items WHERE id=? AND shop_id=?").get(m[1], s.id) || bad("Item not found", 404);
    if (v.on < it.reserved) bad(`${it.reserved} units are reserved by open orders, stock cannot go lower`, 409);
    const r = q("UPDATE items SET name=?,em=?,price=?,on_hand=? WHERE id=? AND reserved<=?").run(v.name, v.em, v.price, v.on, it.id, v.on);
    if (r.changes !== 1) bad("Stock changed, refresh and retry", 409);
    return { ok: true };
  });
  on("DELETE", "/api/items/([^/]+)", async (req, ip, b, m) => {
    const u = auth(req); const s = ownerShop(u);
    const it = q("SELECT * FROM items WHERE id=? AND shop_id=?").get(m[1], s.id) || bad("Item not found", 404);
    if (it.reserved > 0) bad(`Cannot delete: ${it.reserved} reserved by open orders`, 409);
    q("DELETE FROM items WHERE id=? AND reserved=0").run(it.id);
    return { ok: true };
  });

  on("POST", "/api/shops/register", async (req, ip, b) => {
    limit("reg:" + ip, 10, 3600_000);
    const phone = phoneOf(b.phone) || bad("Enter a valid 10 digit mobile number");
    const name = text(b.name, 2, 60, "Shop name"), owner = text(b.owner, 2, 60, "Owner name");
    const lat = Number(b.lat), lng = Number(b.lng);
    if (!(lat > 6 && lat < 37 && lng > 68 && lng < 98)) bad("Location must be inside India");
    const cats = (Array.isArray(b.cats) ? b.cats : []).filter((c) => CATS.has(c)).slice(0, 3);
    if (!cats.length) bad("Pick a shop type");
    const em = EMOJI.test(String(b.em)) ? String(b.em) : "🏪";
    const bg = ["#FFE7A8", "#FFD3C4", "#CDEBD6", "#D3E2FF"][int(b.bg ?? 0, 0, 3, "Colour")];
    checkOtp(phone, b.code);
    return db.transaction(() => {
      if (q("SELECT 1 FROM users WHERE phone=?").get(phone)) bad("This number is already registered. Log in instead.", 409);
      const id = "sx" + randomBytes(4).toString("hex");
      q("INSERT INTO shops(id,name,em,bg,cats,prep,rating,lat,lng,status,owner,phone) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(id, name, em, bg, JSON.stringify(cats), 10, null, lat, lng, "pending", owner, phone);
      q("INSERT INTO users VALUES(?,?,?,?,?)").run(phone, "shop", owner, id, Date.now());
      log("shop registered", id);
      return { token: newSession(phone), user: userOut(q("SELECT * FROM users WHERE phone=?").get(phone)) };
    })();
  });
  on("POST", "/api/shops/resubmit", async (req) => {
    const u = auth(req); const s = ownerShop(u);
    if (s.status !== "rejected") bad("Only rejected shops can be resubmitted", 409);
    q("UPDATE shops SET status='pending', reason='' WHERE id=?").run(s.id);
    return { ok: true };
  });

  on("POST", "/api/admin/shops/([^/]+)/(approve|reject|suspend)", async (req, ip, b, m) => {
    const u = auth(req); need(u, "admin");
    const s = q("SELECT * FROM shops WHERE id=?").get(m[1]) || bad("Shop not found", 404);
    const [to, reason] = m[2] === "approve" ? ["approved", ""] : m[2] === "reject" ? ["rejected", text(b.reason || "Not specified", 1, 200, "Reason")] : ["suspended", "Suspended by admin"];
    if (to === "approved" && s.status === "approved") bad("Already approved", 409);
    q("UPDATE shops SET status=?, reason=? WHERE id=?").run(to, reason, s.id);
    log("admin", u.phone, m[2], s.id);
    return { ok: true };
  });

  on("PUT", "/api/me", async (req, ip, b) => {
    const u = auth(req);
    q("UPDATE users SET name=? WHERE phone=?").run(text(b.name, 2, 60, "Name"), u.phone);
    return { ok: true };
  });
  on("POST", "/api/addresses", async (req, ip, b) => {
    const u = auth(req); need(u, "customer");
    const label = ["Home", "Work", "Other"].includes(b.label) ? b.label : "Other";
    const line = text(b.line, 6, 200, "Address");
    if (q("SELECT COUNT(*) c FROM addresses WHERE phone=?").get(u.phone).c >= 10) bad("You can save up to 10 addresses");
    const lat = Number(b.lat), lng = Number(b.lng), geo = lat > 6 && lat < 37 && lng > 68 && lng < 98;
    const r = q("INSERT INTO addresses(phone,label,line,lat,lng,created_at) VALUES(?,?,?,?,?,?)").run(u.phone, label, line, geo ? lat : null, geo ? lng : null, Date.now());
    return { id: Number(r.lastInsertRowid) };
  });
  on("DELETE", "/api/addresses/([0-9]+)", async (req, ip, b, m) => {
    const u = auth(req); need(u, "customer");
    q("DELETE FROM addresses WHERE id=? AND phone=?").run(Number(m[1]), u.phone);
    return { ok: true };
  });

  on("POST", "/api/wishlist", async (req, ip, b) => {
    const u = auth(req); need(u, "customer");
    const id = String(b.itemId ?? "");
    if (!q("SELECT 1 FROM items WHERE id=?").get(id)) bad("Item not found", 404);
    if (q("SELECT 1 FROM wishlist WHERE phone=? AND item_id=?").get(u.phone, id)) { q("DELETE FROM wishlist WHERE phone=? AND item_id=?").run(u.phone, id); return { wished: false }; }
    if (q("SELECT COUNT(*) c FROM wishlist WHERE phone=?").get(u.phone).c >= 200) bad("Wishlist is full");
    q("INSERT INTO wishlist VALUES(?,?,?)").run(u.phone, id, Date.now());
    return { wished: true };
  });

  on("GET", "/api/health", async () => ({ ok: true, time: Date.now() }));

  // ---------- http ----------
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
  const SEC = {
    "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Permissions-Policy": "geolocation=(self)", "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; connect-src 'self' https://nominatim.openstreetmap.org; frame-ancestors 'none'",
  };
  const jres = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...SEC } });

  async function handle(req, server) {
    const url = new URL(req.url);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || server?.requestIP(req)?.address || "local";
    if (url.pathname.startsWith("/api/")) {
      try {
        for (const [method, re, fn] of routes) {
          const m = re.exec(url.pathname);
          if (m && method === req.method) {
            let b = {};
            if (method !== "GET" && method !== "DELETE") {
              const raw = await req.text();
              if (raw.length > 20_000) bad("Request too large", 413);
              try { b = raw ? JSON.parse(raw) : {}; } catch { bad("Invalid JSON"); }
              if (b === null || typeof b !== "object") bad("Invalid JSON");
            }
            return jres(200, await fn(req, ip, b, m));
          }
        }
        return jres(404, { error: "Not found" });
      } catch (e) {
        if (e instanceof HttpError) return jres(e.status, { error: e.message });
        console.error("ERR", e);
        return jres(500, { error: "Something went wrong" });
      }
    }
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    if (p.includes("..")) return new Response("Bad request", { status: 400 });
    if (!p) p = "index.html";
    let f = Bun.file(join(PUBLIC, p));
    if (!(await f.exists())) f = Bun.file(join(PUBLIC, "index.html"));
    const ext = extname(f.name || p);
    return new Response(f, { headers: { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": p === "sw.js" || ext === ".html" ? "no-cache" : "public, max-age=3600", ...SEC } });
  }

  const server = Bun.serve({ port, fetch: handle });
  log("Soon running on http://localhost:" + server.port);
  return { server, db, stop() { clearInterval(timer); server.stop(true); db.close(); }, sweep };
}

if (import.meta.main) createApp({ port: +process.env.PORT || 3000 });
