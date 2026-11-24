// Runs the real public/app.js against the real server inside a stubbed DOM.
// It proves the UI logic, API wiring and every screen's template render without throwing.
// It does NOT check how anything looks; that still needs a real browser.
import { test, expect, beforeAll, afterAll } from "bun:test";
import vm from "node:vm";
import { rmSync, readFileSync } from "node:fs";
import { createApp } from "../server.js";

const DB = (process.env.TEMP || "/tmp") + "/soon-ui-test.db";
for (const s of ["", "-wal", "-shm"]) try { rmSync(DB + s); } catch {}
let app, base;
beforeAll(() => { app = createApp({ dbPath: DB, port: 0, quiet: true }); base = "http://localhost:" + app.server.port; });
afterAll(() => app.stop());

function boot() {
  const el = { innerHTML: "", dataset: {}, scrollTop: 0, value: "" };
  const store = {};
  const ctx = {
    document: { getElementById: (id) => (id === "app" ? el : ["hmap", "tmap"].includes(id) ? null : { scrollTop: 0, value: "", innerHTML: "" }), documentElement: { dataset: {} }, createElement: () => ({}), head: { appendChild() {} }, addEventListener() {}, hidden: false, activeElement: null },
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] },
    navigator: {}, matchMedia: () => ({ matches: false }), addEventListener() {}, console,
    setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, L: undefined,
    fetch: (p, o) => fetch(base + p, o), encodeURIComponent, JSON, Math, Date, Object, Array, Number, String, parseInt, Promise,
  };
  vm.createContext(ctx);
  const src = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
  vm.runInContext(src + "\n;globalThis.X={get S(){return S},set S(v){S=v},sh,add,go,openShop,checkout,setStatus,setOn,openM,saveM,delItem,approve,rejectShop,suspend,sendOtp,login,logout,regShop,render,reorder,setSort,openDrawer,nav,wish,lastOrder,saveAddr,saveName,get html(){return document.getElementById('app').innerHTML}};", ctx);
  return ctx.X;
}
const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));
async function signIn(X, phone, role) {
  X.S.pick = role; X.S.lg.phone = phone; await X.sendOtp(); X.S.lg.code = "1234"; await X.login();
}

test("login screen renders and a wrong OTP shows an error toast", async () => {
  const X = boot();
  X.render();
  expect(X.html).toContain("Send OTP");
  expect(X.html).toContain("Groceries from the shop next door");
  X.S.pick = "customer"; X.S.lg.phone = "9000000001"; await X.sendOtp(); X.S.lg.code = "9999"; await X.login();
  expect(X.S.role).toBe(null);
  expect(X.S.toast).toContain("Wrong OTP");
});

test("customer: login, browse, add to cart, checkout, see order, reorder", async () => {
  const X = boot();
  await signIn(X, "9000000001", "customer");
  expect(X.S.role).toBe("customer");
  expect(X.html).toContain("Fresh Basket Mart");
  expect(X.html).not.toContain("Annapurna");
  X.openShop("s1");
  const milk = X.S.shops.find((s) => s.id === "s1").items.find((i) => i.name === "Milk 1L");
  X.add(milk.id, 2); X.add(milk.id, 1);
  expect(X.S.cart[milk.id]).toBe(3);
  X.go("cart"); expect(X.html).toContain("Milk 1L");
  await X.checkout();
  expect(X.S.view).toBe("track");
  expect(X.S.orders.length).toBe(1);
  expect(X.S.orders[0].status).toBe("placed");
  expect(X.html).toContain("Order placed");
  X.go("orders"); expect(X.html).toContain("Track order");
  const after = X.S.shops.find((s) => s.id === "s1").items.find((i) => i.name === "Milk 1L");
  expect(after.res).toBe(3);
  X.reorder(X.S.orders[0].id); expect(X.S.view).toBe("cart");
  X.S.q = "onion"; X.go("home"); expect(X.html).toContain("Onions");
  for (const k of ["best", "near", "cheap", "rated"]) { X.setSort(k); expect(X.html.length).toBeGreaterThan(500); }
  X.S.map = true; X.S.q = ""; X.render();
  X.openDrawer(); expect(X.html).toContain("My addresses"); expect(X.html).toContain("Order history");
  X.nav("addr"); expect(X.S.view).toBe("addr"); expect(X.html).toContain("Add a new address");
  X.S.af = { label: "Work", line: "Test Tower, MG Road", geo: false }; await X.saveAddr();
  expect(X.S.addrs.length).toBe(1); expect(X.html).toContain("Delivering here");
  X.nav("account"); expect(X.html).toContain("Save changes");
  X.S.nameDraft = "Test User"; await X.saveName(); expect(X.S.user.name).toBe("Test User");
  X.go("home"); X.openDrawer(); expect(X.html).toContain("Test User");
  X.go("cart"); X.S.cart = {}; X.render(); expect(X.html).toContain("Your cart is empty");
  X.go("wish"); expect(X.html).toContain("No favourites yet");
  X.openShop("s1"); const br = X.S.shops.find((s) => s.id === "s1").items.find((i) => i.name === "Bread");
  await X.wish(br.id); expect(X.S.wish).toContain(br.id); X.go("wish"); expect(X.html).toContain("Bread");
  expect(X.html).toContain("Wishlist"); expect(X.html).toContain("Cart");
  X.openDrawer(); expect(X.html).toContain("My wishlist"); expect(X.html).toContain("My last order");
  X.lastOrder(); expect(X.S.view).toBe("track");
  X.logout(); await wait(); expect(X.S.role).toBe(null);
});

test("shop owner: sees the customer's order, moves it through to delivered, edits stock", async () => {
  const X = boot();
  await signIn(X, "9845000001", "shop");
  expect(X.S.role).toBe("shop");
  expect(X.html).toContain("Fresh Basket Mart");
  const o = X.S.orders[0];
  expect(o).toBeTruthy();
  for (const st of ["accepted", "packing", "out", "delivered"]) { X.setStatus(o.id, st); await wait(80); }
  expect(X.S.orders[0].status).toBe("delivered");
  const milk = X.S.shops[0].items.find((i) => i.name === "Milk 1L");
  expect(milk.on).toBe(9); expect(milk.res).toBe(0);
  X.S.tab = "stock"; X.render(); expect(X.html).toContain("Milk 1L");
  X.setOn("s1", milk.id, 20); await wait(80);
  expect(X.S.shops[0].items.find((i) => i.name === "Milk 1L").on).toBe(20);
  X.openM(null); X.S.modal.name = "Curd 500g"; X.S.modal.price = "35"; X.S.modal.on = "10"; await X.saveM();
  expect(X.S.shops[0].items.some((i) => i.name === "Curd 500g")).toBe(true);
  const curd = X.S.shops[0].items.find((i) => i.name === "Curd 500g");
  X.openM(curd.id); await X.delItem();
  expect(X.S.shops[0].items.some((i) => i.name === "Curd 500g")).toBe(false);
});

test("shop registration then admin approval, rendered end to end", async () => {
  const S1 = boot();
  S1.S.pick = "shop"; S1.S.mode = "reg"; S1.render();
  expect(S1.html).toContain("Open your shop on Soon");
  S1.S.reg.name = "Test Fresh Mart"; S1.S.reg.owner = "Priya"; S1.S.lg.phone = "9777777777";
  await S1.sendOtp(); S1.S.lg.code = "1234"; await S1.regShop();
  expect(S1.S.role).toBe("shop");
  expect(S1.S.shops[0].status).toBe("pending");
  expect(S1.html.toLowerCase()).toContain("review");
  const A = boot();
  await signIn(A, "9000000000", "admin");
  expect(A.S.role).toBe("admin");
  const pend = A.S.shops.filter((s) => s.status === "pending");
  expect(pend.some((s) => s.name === "Test Fresh Mart")).toBe(true);
  expect(A.html).toContain("Test Fresh Mart");
  const id = pend.find((s) => s.name === "Test Fresh Mart").id;
  A.approve(id); await wait(100);
  expect(A.S.shops.find((s) => s.id === id).status).toBe("approved");
  A.suspend(id); await wait(100);
  expect(A.S.shops.find((s) => s.id === id).status).toBe("suspended");
  const C = boot(); await signIn(C, "9000000001", "customer");
  expect(C.html).not.toContain("Test Fresh Mart");
});

test("service worker, manifest and shell are served", async () => {
  for (const p of ["/", "/app.js", "/sw.js", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"]) {
    const r = await fetch(base + p); expect(r.status).toBe(200);
  }
  const m = await (await fetch(base + "/manifest.webmanifest")).json();
  expect(m.display).toBe("standalone");
});
