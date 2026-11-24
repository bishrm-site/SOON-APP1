import { test, expect, beforeAll, afterAll } from "bun:test";
import { createApp } from "../server.js";
import { rmSync } from "node:fs";

const DB = process.env.TEMP ? process.env.TEMP + "/soon-test.db" : "/tmp/soon-test.db";
process.env.RATE_ORDERS = "1000";
let app, base;
for (const s of ["", "-wal", "-shm"]) try { rmSync(DB + s); } catch {}
beforeAll(() => { app = createApp({ dbPath: DB, port: 0, quiet: true }); base = "http://localhost:" + app.server.port; });
afterAll(() => app.stop());

const call = async (path, { method = "GET", body, token } = {}) => {
  const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json() };
};
const cache = {};
const login = async (phone, role) => {
  if (cache[phone + role]) return cache[phone + role];
  await call("/api/otp/send", { method: "POST", body: { phone } });
  const r = await call("/api/otp/verify", { method: "POST", body: { phone, code: "1234", role } });
  if (r.status === 200) cache[phone + role] = r;
  return r;
};
const state = async (t) => (await call("/api/state", { token: t })).data;
const item = (st, shop, name) => st.shops.find((s) => s.id === shop).items.find((i) => i.name === name);

test("auth: wrong OTP rejected, right OTP gives session, no token is 401", async () => {
  await call("/api/otp/send", { method: "POST", body: { phone: "9111111111" } });
  expect((await call("/api/otp/verify", { method: "POST", body: { phone: "9111111111", code: "0000" } })).status).toBe(400);
  expect((await call("/api/otp/verify", { method: "POST", body: { phone: "9111111111", code: "1234" } })).status).toBe(200);
  expect((await call("/api/state")).status).toBe(401);
  expect((await call("/api/state", { token: "x".repeat(43) })).status).toBe(401);
});

test("auth: OTP locks after 5 wrong tries; invalid phone rejected; role mismatch blocked", async () => {
  await call("/api/otp/send", { method: "POST", body: { phone: "9222222222" } });
  for (let i = 0; i < 5; i++) await call("/api/otp/verify", { method: "POST", body: { phone: "9222222222", code: "9999" } });
  expect((await call("/api/otp/verify", { method: "POST", body: { phone: "9222222222", code: "1234" } })).status).toBe(429);
  expect((await call("/api/otp/send", { method: "POST", body: { phone: "12345" } })).status).toBe(400);
  expect((await login("9845000001", "admin")).status).toBe(403);
  expect((await login("9333333333", "shop")).status).toBe(403);
});

test("rate limit: OTP sends per phone are capped", async () => {
  let last;
  for (let i = 0; i < 7; i++) last = await call("/api/otp/send", { method: "POST", body: { phone: "9444444444" } });
  expect(last.status).toBe(429);
});

test("authorization: customer cannot use owner or admin routes", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  expect((await call("/api/items", { method: "POST", token: c, body: { name: "x", price: 1, on: 1 } })).status).toBe(403);
  expect((await call("/api/admin/shops/s5/approve", { method: "POST", token: c })).status).toBe(403);
  expect((await call("/api/orders/%231001/status", { method: "POST", token: c, body: { status: "accepted" } })).status).toBe(403);
});

test("customers only see approved shops; admin sees all", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const a = (await login("9000000000", "admin")).data.token;
  const ids = (await state(c)).shops.map((s) => s.id);
  expect(ids).toEqual(expect.arrayContaining(["s1", "s2", "s3", "s4", "s6", "s11"]));
  expect(ids).not.toContain("s5");
  expect((await state(a)).shops.length).toBe(61);
});

test("order: reserves stock, total computed on server, out-of-stock refused", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const before = item(await state(c), "s1", "Milk 1L");
  const r = await call("/api/orders", { method: "POST", token: c, body: { shopId: "s1", items: [{ id: before.id, q: 2 }], total: 1 } });
  expect(r.status).toBe(200);
  expect(r.data.total).toBe(58 * 2 + 25);
  const after = item(await state(c), "s1", "Milk 1L");
  expect(after.res).toBe(before.res + 2);
  const eggs = item(await state(c), "s1", "Eggs (6)");
  expect((await call("/api/orders", { method: "POST", token: c, body: { shopId: "s1", items: [{ id: eggs.id, q: 1 }] } })).status).toBe(409);
  expect((await call("/api/orders", { method: "POST", token: c, body: { shopId: "s1", items: [{ id: before.id, q: -1 }] } })).status).toBe(400);
  expect((await call("/api/orders", { method: "POST", token: c, body: { shopId: "s5", items: [] } })).status).toBe(400);
});

test("order lifecycle: reject releases stock, deliver reduces on-hand, bad transitions refused", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const o1 = (await login("9845000002", "shop")).data.token;
  const rice = item(await state(c), "s2", "Basmati Rice 1kg");
  const a = (await call("/api/orders", { method: "POST", token: c, body: { shopId: "s2", items: [{ id: rice.id, q: 3 }] } })).data;
  const b = (await call("/api/orders", { method: "POST", token: c, body: { shopId: "s2", items: [{ id: rice.id, q: 2 }] } })).data;
  const enc = (id) => encodeURIComponent(id);
  expect(item(await state(o1), "s2", "Basmati Rice 1kg").res).toBe(rice.res + 5);
  expect((await call(`/api/orders/${enc(a.id)}/status`, { method: "POST", token: o1, body: { status: "delivered" } })).status).toBe(409);
  expect((await call(`/api/orders/${enc(a.id)}/status`, { method: "POST", token: o1, body: { status: "rejected" } })).status).toBe(200);
  expect(item(await state(o1), "s2", "Basmati Rice 1kg").res).toBe(rice.res + 2);
  for (const s of ["accepted", "packing", "out", "delivered"]) expect((await call(`/api/orders/${enc(b.id)}/status`, { method: "POST", token: o1, body: { status: s } })).status).toBe(200);
  const fin = item(await state(o1), "s2", "Basmati Rice 1kg");
  expect(fin.on).toBe(rice.on - 2);
  expect(fin.res).toBe(rice.res);
  expect((await call(`/api/orders/${enc(a.id)}/status`, { method: "POST", token: o1, body: { status: "accepted" } })).status).toBe(409);
});

test("authorization: one shop owner cannot touch another shop's orders or items", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const s1 = (await login("9845000001", "shop")).data.token;
  const s3 = (await login("9845000003", "shop")).data.token;
  const spin = item(await state(c), "s3", "Spinach bunch");
  const o = (await call("/api/orders", { method: "POST", token: c, body: { shopId: "s3", items: [{ id: spin.id, q: 1 }] } })).data;
  expect((await call(`/api/orders/${encodeURIComponent(o.id)}/status`, { method: "POST", token: s1, body: { status: "accepted" } })).status).toBe(404);
  expect((await call(`/api/items/${spin.id}`, { method: "PUT", token: s1, body: { name: "Hacked", price: 1, on: 5 } })).status).toBe(404);
  expect((await call(`/api/items/${spin.id}`, { method: "DELETE", token: s1 })).status).toBe(404);
  expect((await call(`/api/items/${spin.id}`, { method: "DELETE", token: s3 })).status).toBe(409);
});

test("CONCURRENCY: 40 simultaneous orders for 5 units never oversell", async () => {
  const s = (await login("9845000004", "shop")).data.token;
  const pasta = item(await state(s), "s4", "Pasta 500g");
  expect((await call(`/api/items/${pasta.id}`, { method: "PUT", token: s, body: { name: "Pasta 500g", em: "🍝", price: 90, on: 5 } })).status).toBe(200);
  const c = (await login("9000000001", "customer")).data.token;
  const rs = await Promise.all(Array.from({ length: 40 }, () => call("/api/orders", { method: "POST", token: c, body: { shopId: "s4", items: [{ id: pasta.id, q: 1 }] } })));
  const ok = rs.filter((r) => r.status === 200).length;
  expect(ok).toBe(5);
  expect(rs.filter((r) => r.status === 409).length).toBe(35);
  const p = item(await state(s), "s4", "Pasta 500g");
  expect(p.res).toBe(5); expect(p.on).toBe(5);
});

test("owner item CRUD with validation and XSS sanitising", async () => {
  const s = (await login("9845000003", "shop")).data.token;
  const bad1 = await call("/api/items", { method: "POST", token: s, body: { name: "", price: 10, on: 1 } });
  expect(bad1.status).toBe(400);
  expect((await call("/api/items", { method: "POST", token: s, body: { name: "Ok", price: -5, on: 1 } })).status).toBe(400);
  const r = await call("/api/items", { method: "POST", token: s, body: { name: "<img src=x onerror=alert(1)>Mango's", em: "🥭", price: 90, on: 4 } });
  expect(r.status).toBe(200);
  const it = (await state(s)).shops[0].items.find((i) => i.id === r.data.id);
  expect(it.name).not.toContain("<");
  expect(it.name).toContain("\u2019");
  expect((await call(`/api/items/${r.data.id}`, { method: "DELETE", token: s })).status).toBe(200);
});

test("shop registration -> pending -> admin approve / reject -> visibility", async () => {
  const reg = { phone: "9555555555", code: "1234", name: "Test Kirana", owner: "Tester", cats: ["Daily needs"], em: "🏪", bg: 1, lat: 12.97, lng: 77.6 };
  expect((await call("/api/shops/register", { method: "POST", body: reg })).status).toBe(400);
  await call("/api/otp/send", { method: "POST", body: { phone: reg.phone } });
  expect((await call("/api/shops/register", { method: "POST", body: { ...reg, lat: 0, lng: 0 } })).status).toBe(400);
  const r = await call("/api/shops/register", { method: "POST", body: reg });
  expect(r.status).toBe(200);
  const t = r.data.token, id = r.data.user.shopId;
  expect((await call("/api/items", { method: "POST", token: t, body: { name: "Milk", price: 50, on: 5 } })).status).toBe(403);
  const a = (await login("9000000000", "admin")).data.token;
  const c = (await login("9000000001", "customer")).data.token;
  expect((await state(c)).shops.some((s) => s.id === id)).toBe(false);
  expect((await call(`/api/admin/shops/${id}/reject`, { method: "POST", token: a, body: { reason: "Photo unclear" } })).status).toBe(200);
  expect((await state(t)).shops[0].reason).toBe("Photo unclear");
  expect((await call("/api/shops/resubmit", { method: "POST", token: t })).status).toBe(200);
  expect((await call(`/api/admin/shops/${id}/approve`, { method: "POST", token: a })).status).toBe(200);
  expect((await state(c)).shops.some((s) => s.id === id)).toBe(true);
  expect((await call("/api/items", { method: "POST", token: t, body: { name: "Milk", price: 50, on: 5 } })).status).toBe(200);
  expect((await call(`/api/admin/shops/${id}/suspend`, { method: "POST", token: a })).status).toBe(200);
  expect((await state(c)).shops.some((s) => s.id === id)).toBe(false);
});

test("timeout: unaccepted orders auto-reject and release stock", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const o = (await login("9845000002", "shop")).data.token;
  const tea = item(await state(c), "s2", "Tea 250g");
  await call("/api/orders", { method: "POST", token: c, body: { shopId: "s2", items: [{ id: tea.id, q: 4 }] } });
  expect(item(await state(o), "s2", "Tea 250g").res).toBe(tea.res + 4);
  app.db.query("UPDATE orders SET created_at=? WHERE status='placed'").run(Date.now() - 3600_000);
  app.sweep();
  expect(item(await state(o), "s2", "Tea 250g").res).toBe(tea.res);
});

test("static: path traversal blocked, security headers set, logout kills session", async () => {
  const r = await fetch(base + "/..%2f..%2fserver.js");
  expect((await r.text()).includes("createApp")).toBe(false);
  const h = await fetch(base + "/");
  expect(h.headers.get("x-frame-options")).toBe("DENY");
  await call("/api/otp/send", { method: "POST", body: { phone: "9666666666" } });
  const c = (await call("/api/otp/verify", { method: "POST", body: { phone: "9666666666", code: "1234" } })).data.token;
  await call("/api/logout", { method: "POST", token: c });
  expect((await call("/api/state", { token: c })).status).toBe(401);
});

test("profile and addresses: save name, add/list/delete address, order stores address, isolation", async () => {
  await call("/api/otp/send", { method: "POST", body: { phone: "9888888888" } });
  const c = (await call("/api/otp/verify", { method: "POST", body: { phone: "9888888888", code: "1234" } })).data.token;
  expect((await call("/api/me", { method: "PUT", token: c, body: { name: "A" } })).status).toBe(400);
  expect((await call("/api/me", { method: "PUT", token: c, body: { name: "Asha Rao" } })).status).toBe(200);
  const ad = await call("/api/addresses", { method: "POST", token: c, body: { label: "Home", line: "12 Test Street, Indiranagar", lat: 12.97, lng: 77.64 } });
  expect(ad.status).toBe(200);
  expect((await call("/api/addresses", { method: "POST", token: c, body: { label: "Home", line: "x" } })).status).toBe(400);
  const st = await state(c);
  expect(st.user.name).toBe("Asha Rao"); expect(st.addresses.length).toBe(1);
  const milk = item(st, "s1", "Milk 1L");
  const o = await call("/api/orders", { method: "POST", token: c, body: { shopId: "s1", items: [{ id: milk.id, q: 1 }], addressId: ad.data.id } });
  expect(o.data.address).toContain("12 Test Street");
  const other = (await login("9000000001", "customer")).data.token;
  const o2 = await call("/api/orders", { method: "POST", token: other, body: { shopId: "s1", items: [{ id: milk.id, q: 1 }], addressId: ad.data.id } });
  expect(o2.data.address).toBe("");
  await call("/api/addresses/" + ad.data.id, { method: "DELETE", token: other });
  expect((await state(c)).addresses.length).toBe(1);
  await call("/api/addresses/" + ad.data.id, { method: "DELETE", token: c });
  expect((await state(c)).addresses.length).toBe(0);
});

test("wishlist: toggle on and off, listed in state, unknown item rejected, per user", async () => {
  const c = (await login("9000000001", "customer")).data.token;
  const other = (await login("9333333333", "customer").catch(() => null));
  const milk = item(await state(c), "s1", "Bread");
  expect((await call("/api/wishlist", { method: "POST", token: c, body: { itemId: milk.id } })).data.wished).toBe(true);
  expect((await state(c)).wishlist).toContain(milk.id);
  expect((await call("/api/wishlist", { method: "POST", token: c, body: { itemId: milk.id } })).data.wished).toBe(false);
  expect((await state(c)).wishlist).not.toContain(milk.id);
  expect((await call("/api/wishlist", { method: "POST", token: c, body: { itemId: "nope" } })).status).toBe(404);
  const s = (await login("9845000001", "shop")).data.token;
  expect((await call("/api/wishlist", { method: "POST", token: s, body: { itemId: milk.id } })).status).toBe(403);
});
