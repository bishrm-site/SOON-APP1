import { Database } from "bun:sqlite";

export function openDb(path = process.env.DB_PATH || "soon.db") {
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
  db.exec(`
  CREATE TABLE IF NOT EXISTS users(
    phone TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN('customer','shop','admin')),
    name TEXT NOT NULL DEFAULT '', shop_id TEXT, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions(
    token_hash TEXT PRIMARY KEY, phone TEXT NOT NULL REFERENCES users(phone), expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS otps(
    phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at INTEGER NOT NULL, tries INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS shops(
    id TEXT PRIMARY KEY, name TEXT NOT NULL, em TEXT NOT NULL, bg TEXT NOT NULL, cats TEXT NOT NULL,
    prep INTEGER NOT NULL, rating REAL, lat REAL NOT NULL, lng REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN('pending','approved','rejected','suspended')),
    reason TEXT NOT NULL DEFAULT '', owner TEXT NOT NULL, phone TEXT NOT NULL, open INTEGER NOT NULL DEFAULT 1);
  CREATE TABLE IF NOT EXISTS items(
    id TEXT PRIMARY KEY, shop_id TEXT NOT NULL REFERENCES shops(id), name TEXT NOT NULL, em TEXT NOT NULL,
    price INTEGER NOT NULL CHECK(price>=0), on_hand INTEGER NOT NULL CHECK(on_hand>=0),
    reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved>=0), CHECK(reserved<=on_hand));
  CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT, shop_id TEXT NOT NULL REFERENCES shops(id),
    customer TEXT NOT NULL REFERENCES users(phone), status TEXT NOT NULL, total INTEGER NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS order_items(
    order_id INTEGER NOT NULL REFERENCES orders(id), item_id TEXT NOT NULL, name TEXT NOT NULL,
    qty INTEGER NOT NULL, price INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS addresses(
    id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL REFERENCES users(phone),
    label TEXT NOT NULL, line TEXT NOT NULL, lat REAL, lng REAL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS wishlist(
    phone TEXT NOT NULL REFERENCES users(phone), item_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(phone,item_id));
  CREATE INDEX IF NOT EXISTS ix_addr_phone ON addresses(phone);
  CREATE INDEX IF NOT EXISTS ix_items_shop ON items(shop_id);
  CREATE INDEX IF NOT EXISTS ix_orders_shop ON orders(shop_id, status);
  CREATE INDEX IF NOT EXISTS ix_orders_cust ON orders(customer);
  `);
  try { db.exec("ALTER TABLE orders ADD COLUMN address TEXT NOT NULL DEFAULT ''"); } catch {}
  seed(db);
  return db;
}

const S = [
 ["s1","Fresh Basket Mart","🛒","#FFE7A8",["Daily needs","Fresh"],8,4.6,12.9790,77.6405,"approved","Ravi Kumar","9845000001",
  [["Milk 1L","🥛",58,12],["Bread","🍞",40,3],["Eggs (6)","🥚",54,0],["Bananas 1kg","🍌",60,25],["Tomatoes 1kg","🍅",45,9],["Butter","🧈",56,7],["Onions 1kg","🧅",38,15],["Potatoes 1kg","🥔",30,20]]],
 ["s2","Sri Lakshmi Provisions","🏪","#FFD3C4",["Daily needs"],12,4.3,12.9500,77.6350,"approved","Lakshmi Devi","9845000002",
  [["Basmati Rice 1kg","🍚",110,20],["Toor Dal 1kg","🫘",145,6],["Sunflower Oil 1L","🫒",160,0],["Tea 250g","🍵",120,14],["Biscuits","🍪",30,40],["Salt 1kg","🧂",22,30],["Onions 1kg","🧅",34,40],["Potatoes 1kg","🥔",28,3]]],
 ["s3","Green Leaf Organics","🥬","#CDEBD6",["Fresh","Organic"],10,4.8,12.9360,77.6260,"approved","Meera Nair","9845000003",
  [["Spinach bunch","🥬",25,4],["Apples 1kg","🍎",180,10],["Carrots 500g","🥕",40,2],["Almond Milk","🥤",210,5],["Onions 1kg (organic)","🧅",55,4]]],
 ["s4","City Super Bazaar","🏬","#D3E2FF",["Supermarket","Daily needs"],15,4.1,12.9710,77.7480,"approved","Arun Shetty","9845000004",
  [["Pasta 500g","🍝",90,30],["Cheese slices","🧀",120,8],["Chips","🥔",20,50],["Cold Drink 2L","🥤",95,0],["Onions 1kg","🧅",42,0],["Potatoes 1kg","🥔",36,25]]],
 ["s5","Annapurna Stores","🏪","#FFE7A8",["Daily needs"],10,null,12.9655,77.7440,"pending","Suresh K","9845011223",[]],
];


S.push(
 ["s6","Dessert Zone","🍰","#FFD3E4",["Desserts"],14,4.7,12.9719,77.6412,"approved","Neha Kapoor","9845000006",
  [["Chocolate Truffle Cake 500g","🍰",520,6],["Red Velvet Pastry","🧁",95,14],["Gulab Jamun (6 pcs)","🍮",120,18],["Rasmalai (4 pcs)","🥣",150,10],["Brownie with Ice Cream","🍫",140,12],["Vanilla Ice Cream 500ml","🍨",180,16],["Chocolate Donut","🍩",70,20],["Kulfi Stick","🍦",60,25],["Cheesecake Slice","🍰",160,8],["Jalebi 250g","🍥",90,15],["Cupcakes (4 pcs)","🧁",200,9],["Mysore Pak 250g","🍬",180,11],["Rasgulla (6 pcs)","⚪",130,0]]],
 ["s7","Nilgiris Supermarket","🏬","#D3E2FF",["Supermarket","Daily needs"],13,4.4,12.9279,77.6271,"approved","Karthik Rao","9845000007",
  [["Aashirvaad Atta 5kg","🌾",265,18],["Sugar 1kg","🍬",48,40],["Maggi Noodles 4 pack","🍜",56,35],["Refined Oil 1L","🫒",155,22],["Basmati Rice 5kg","🍚",520,10],["Peanut Butter","🥜",210,12],["Corn Flakes","🥣",190,14],["Orange Juice 1L","🧃",110,20],["Instant Coffee 100g","☕",290,9],["Cooking Salt 1kg","🧂",24,50]]],
 ["s8","Namma Kirana Store","🏪","#FFE7A8",["Daily needs"],9,4.5,12.9810,77.6380,"approved","Mahesh Gowda","9845000008",
  [["Sona Masoori Rice 1kg","🍚",62,60],["Moong Dal 1kg","🫘",130,25],["Pure Ghee 500ml","🧈",340,8],["Turmeric Powder 100g","🟡",38,30],["Red Chilli Powder 100g","🌶️",52,28],["Jaggery 500g","🟤",55,20],["Poha 500g","🍚",42,35],["Tea Dust 500g","🍵",150,16]]],
 ["s9","Fruit & Veg Junction","🍎","#CDEBD6",["Fresh"],8,4.6,12.9390,77.6200,"approved","Salma Begum","9845000009",
  [["Alphonso Mangoes 1kg","🥭",280,10],["Seedless Grapes 500g","🍇",90,14],["Cucumber 500g","🥒",28,25],["Capsicum 500g","🫑",46,18],["Coriander Bunch","🌿",15,40],["Lemons (6)","🍋",24,30],["Pomegranate 1kg","🍎",160,9],["Watermelon 1pc","🍉",75,6],["Spinach bunch","🥬",22,20],["Carrots 1kg","🥕",58,22]]],
 ["s10","Daily Dairy Depot","🥛","#E7F0FF",["Daily needs","Fresh"],7,4.5,12.9760,77.6450,"approved","Venkat Reddy","9845000010",
  [["Toned Milk 1L","🥛",54,40],["Fresh Paneer 200g","🧀",85,15],["Curd 500g","🥣",38,30],["Buttermilk 200ml","🥤",15,50],["Salted Butter 100g","🧈",58,20],["Cheese Slices 10","🧀",125,12],["Greek Yogurt 100g","🍶",45,18],["Fresh Cream 200ml","🥛",70,10]]],
 ["s11","Metro Hyper Supermarket","🛒","#FFD3C4",["Supermarket"],16,4.2,12.9340,77.6300,"approved","Rohit Jain","9845000011",
  [["Detergent Powder 1kg","🧺",130,24],["Shampoo 340ml","🧴",290,15],["Toothpaste 150g","🪥",95,30],["Dishwash Liquid 500ml","🧼",110,20],["Chocolate Bar","🍫",50,60],["Potato Chips Family Pack","🥔",60,40],["Soft Drink 2L","🥤",95,25],["Toilet Paper 4 roll","🧻",180,12],["Hand Wash 250ml","🧴",85,18]]],
);

// ---------- 50 generated demo shops across Bengaluru (500 items) ----------
const AREAS = [
  ["Indiranagar",12.9784,77.6408],["Koramangala",12.9352,77.6245],["Whitefield",12.9698,77.7500],["HSR Layout",12.9116,77.6474],
  ["Jayanagar",12.9250,77.5938],["JP Nagar",12.9063,77.5857],["BTM Layout",12.9166,77.6101],["Malleshwaram",13.0035,77.5643],
  ["Rajajinagar",12.9915,77.5520],["Yelahanka",13.1007,77.5963],["Hebbal",13.0358,77.5970],["Marathahalli",12.9591,77.6974],
  ["Electronic City",12.8452,77.6602],["Banashankari",12.9255,77.5468],["Basavanagudi",12.9422,77.5750],["Bellandur",12.9304,77.6784],
  ["Sarjapur Road",12.9100,77.6870],["Kalyan Nagar",13.0280,77.6400],["RT Nagar",13.0210,77.5950],["Vijayanagar",12.9710,77.5300],
  ["Bannerghatta Road",12.8890,77.5970],["Domlur",12.9609,77.6387],["Ulsoor",12.9810,77.6200],["MG Road",12.9756,77.6066],
  ["Frazer Town",12.9980,77.6130],["Yeshwanthpur",13.0285,77.5400],["Sadashivanagar",13.0068,77.5810],["KR Puram",13.0050,77.6950],
  ["CV Raman Nagar",12.9850,77.6640],["Banaswadi",13.0120,77.6500],
];
const POOLS = {
  Supermarket: [["Wheat Flour 5kg","🌾",265],["Sugar 1kg","🍬",48],["Instant Noodles 4 pack","🍜",56],["Refined Oil 1L","🫒",155],["Basmati Rice 5kg","🍚",520],["Peanut Butter 340g","🥜",210],["Corn Flakes 475g","🥣",190],["Fruit Juice 1L","🧃",110],["Instant Coffee 100g","☕",290],["Detergent Powder 1kg","🧺",130],["Shampoo 340ml","🧴",290],["Toothpaste 150g","🪥",95],["Dishwash Liquid 500ml","🧼",110],["Chocolate Bar","🍫",50],["Potato Chips Large","🥔",60],["Soft Drink 2L","🥤",95],["Toilet Paper 4 roll","🧻",180],["Pasta 500g","🍝",90],["Tomato Ketchup 500g","🍅",120],["Cream Biscuits","🍪",30]],
  Grocery: [["Sona Masoori Rice 1kg","🍚",62],["Toor Dal 1kg","🫘",145],["Moong Dal 1kg","🫘",130],["Pure Ghee 500ml","🧈",340],["Turmeric Powder 100g","🟡",38],["Red Chilli Powder 100g","🌶️",52],["Jaggery 500g","🟤",55],["Poha 500g","🍚",42],["Tea Powder 250g","🍵",120],["Salt 1kg","🧂",22],["Sunflower Oil 1L","🫒",160],["Rava 500g","🌾",36],["Besan 500g","🌾",58],["Mustard Seeds 100g","🟤",28],["Coriander Powder 100g","🌿",40],["Sambar Powder 100g","🌶️",48],["Idli Rice 1kg","🍚",58],["Groundnuts 500g","🥜",85],["Coconut Oil 500ml","🥥",150],["Cooking Soda 100g","🧂",18]],
  Fresh: [["Tomatoes 1kg","🍅",45],["Onions 1kg","🧅",38],["Potatoes 1kg","🥔",30],["Bananas 1kg","🍌",60],["Apples 1kg","🍎",180],["Carrots 1kg","🥕",58],["Cucumber 500g","🥒",28],["Capsicum 500g","🫑",46],["Coriander Bunch","🌿",15],["Lemons (6)","🍋",24],["Spinach bunch","🥬",22],["Grapes 500g","🍇",90],["Watermelon 1pc","🍉",75],["Mangoes 1kg","🥭",160],["Pomegranate 1kg","🍎",160],["Cauliflower 1pc","🥦",40],["Beans 500g","🫘",45],["Brinjal 500g","🍆",32],["Green Chillies 100g","🌶️",14],["Ginger 250g","🫚",30]],
  Dairy: [["Toned Milk 1L","🥛",54],["Full Cream Milk 1L","🥛",66],["Fresh Paneer 200g","🧀",85],["Curd 500g","🥣",38],["Buttermilk 200ml","🥤",15],["Salted Butter 100g","🧈",58],["Cheese Slices 10","🧀",125],["Greek Yogurt 100g","🍶",45],["Fresh Cream 200ml","🥛",70],["Eggs (6)","🥚",54],["Eggs (12)","🥚",102],["Flavoured Milk 200ml","🥛",30],["Ghee 200ml","🧈",140],["Cheese Spread 200g","🧀",110],["Lassi 200ml","🥤",25],["Milk Powder 200g","🥛",120],["Brown Bread","🍞",48],["White Bread","🍞",40],["Khoa 100g","🧈",70],["Condensed Milk","🥫",85]],
  Dessert: [["Chocolate Truffle Cake 500g","🍰",520],["Red Velvet Pastry","🧁",95],["Gulab Jamun (6 pcs)","🍮",120],["Rasmalai (4 pcs)","🥣",150],["Brownie","🍫",80],["Vanilla Ice Cream 500ml","🍨",180],["Chocolate Donut","🍩",70],["Kulfi Stick","🍦",60],["Cheesecake Slice","🍰",160],["Jalebi 250g","🍥",90],["Cupcakes (4 pcs)","🧁",200],["Mysore Pak 250g","🍬",180],["Kaju Katli 250g","🍬",260],["Soan Papdi 250g","🍬",120],["Butterscotch Ice Cream","🍨",170],["Fruit Cake 400g","🍰",240],["Cookies Box","🍪",150],["Rabri 200g","🥛",130],["Pineapple Pastry","🧁",85],["Chocolate Mousse","🍫",110]],
  Organic: [["Organic Spinach","🥬",35],["Organic Apples 1kg","🍎",220],["Organic Tomatoes 1kg","🍅",70],["Millet Mix 500g","🌾",95],["Cold Pressed Oil 500ml","🫒",320],["Organic Jaggery 500g","🟤",85],["Brown Rice 1kg","🍚",110],["Almond Milk 1L","🥤",210],["Quinoa 500g","🌾",290],["Raw Honey 250g","🍯",240],["Chia Seeds 200g","🌱",180],["Organic Turmeric 100g","🟡",75],["Oats 1kg","🥣",160],["Ragi Flour 1kg","🌾",90],["Herbal Tea 25 bags","🍵",190],["Dates 500g","🌴",230],["Walnuts 250g","🥜",340],["Coconut Water 1L","🥥",90],["Organic Carrots 500g","🥕",55],["Moringa Powder 100g","🌿",150]],
};
const TYPES = [
  ["Supermarket","🏬",["Supermarket","Daily needs"],["Mart","Supermarket","Hypermarket","Bazaar"],"#D3E2FF"],
  ["Grocery","🏪",["Daily needs"],["Provisions","Stores","Kirana","General Stores"],"#FFE7A8"],
  ["Fresh","🥬",["Fresh"],["Fruits & Veg","Fresh Hub","Farm Fresh","Greens"],"#CDEBD6"],
  ["Dairy","🥛",["Daily needs","Fresh"],["Dairy","Milk Depot","Dairy Fresh","Dairy Corner"],"#E7F0FF"],
  ["Dessert","🍰",["Desserts"],["Sweets","Dessert Hub","Bakery & Sweets","Cake House"],"#FFD3E4"],
  ["Organic","🌱",["Fresh","Organic"],["Organics","Organic Store","Natural Foods","Eco Mart"],"#CDEBD6"],
];
const PRE = ["Sri Ganesh","Lakshmi","Balaji","Anand","Mysore","Namma","Kaveri","Maruthi","Sagar","Ganga","Udupi","Vinayaka","Shanti","Hoysala","Karnataka","Basava","Chamundi","Bangalore","Raghavendra","Srinivasa","Venkatesh","Shiva","Durga","Annapoorna","Krishna","Sai Baba","Manjunatha","Nandi","Girija","Padma","Surya","Chandra","Ashok","Vijaya","Prakash","Amrutha","Bhavani","Dwaraka","Gokul","Harsha","Ishwari","Jai Hind","Kamat","Mahalakshmi","Nirmala","Om Sai","Pavan","Ramdev","Sapthagiri","Tulasi"];
const OWN = ["Ramesh","Suresh","Kavitha","Anitha","Prakash","Deepa","Mohan","Latha","Vijay","Sunita","Naveen","Rekha","Arjun","Divya","Manoj","Pooja","Rahul","Shilpa","Kiran","Asha"];
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function generated() {
  const r = rng(20261124), out = [];
  for (let i = 0; i < 50; i++) {
    const a = AREAS[i % AREAS.length], t = TYPES[i % TYPES.length];
    const pool = POOLS[t[0]].slice(); const items = [];
    for (let k = 0; k < 10; k++) { const [n, e, p] = pool.splice(Math.floor(r() * pool.length), 1)[0]; const stock = r() < 0.12 ? 0 : 3 + Math.floor(r() * 40); items.push([n, e, Math.max(10, Math.round(p * (0.92 + r() * 0.2))), stock]); }
    out.push(["d" + (i + 1), PRE[i] + " " + t[3][i % t[3].length] + " (" + a[0] + ")", t[1], t[4], t[2], 6 + Math.floor(r() * 13), +(3.9 + r() * 1).toFixed(1),
      +(a[1] + (r() - 0.5) * 0.014).toFixed(5), +(a[2] + (r() - 0.5) * 0.014).toFixed(5), "approved", OWN[i % OWN.length] + " " + ["K","R","S","N"][i % 4], String(9846000001 + i), items]);
  }
  return out;
}
S.push(...generated());

function seed(db) {
  const now = Date.now();
  const u = db.prepare("INSERT OR IGNORE INTO users(phone,role,name,shop_id,created_at) VALUES(?,?,?,?,?)");
  const sp = db.prepare("INSERT INTO shops(id,name,em,bg,cats,prep,rating,lat,lng,status,owner,phone) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
  const it = db.prepare("INSERT INTO items(id,shop_id,name,em,price,on_hand) VALUES(?,?,?,?,?,?)");
  db.transaction(() => {
    u.run("9000000000", "admin", "Soon Admin", null, now);
    u.run("9000000001", "customer", "Demo Customer", null, now);
    for (const s of S) {
      if (db.query("SELECT 1 FROM shops WHERE id=?").get(s[0])) continue;
      sp.run(s[0], s[1], s[2], s[3], JSON.stringify(s[4]), s[5], s[6], s[7], s[8], s[9], s[10], s[11]);
      u.run(s[11], "shop", s[10], s[0], now);
      s[12].forEach((x, i) => it.run(s[0] + i, s[0], x[0], x[1], x[2], x[3]));
    }
  })();
}
