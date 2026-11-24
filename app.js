const P={home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',receipt:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6"/>',box:'<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;
const PIN='<path d="M24 2C13.5 2 6 9.6 6 19.2 6 31.5 24 46 24 46s18-14.5 18-26.8C42 9.6 34.5 2 24 2z" fill="url(#lgr)"/><path d="M31.5 14.2c-2.2-2.2-5.300-2.800-8.100-1.900-3.700 1.200-4.300 5.300-.7 6.500l4.200 1.400c3.800 1.300 3.100 5.900-.8 6.800-3 .7-5.800-.1-8.100-2.300" stroke="#082f23" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
const DEF='<defs><linearGradient id="lgr" x1="8" y1="2" x2="40" y2="46" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE27A"/><stop offset="1" stop-color="#FFB300"/></linearGradient></defs>';
const pin=(s=40)=>`<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none">${DEF}${PIN}</svg>`;
const logo=(s=30)=>`<span class="lgo" style="font-size:${s}px">${pin(s*1.25)}<span>soon<i>.</i></span></span>`;
try{const f=document.createElement('link');f.rel='icon';f.href='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${DEF}${PIN}</svg>`);document.head.appendChild(f)}catch(e){}
let T='light';try{T=localStorage.getItem('soon-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch(e){}
function applyT(){document.documentElement.dataset.theme=T}applyT();
function toggleT(){T=T==='dark'?'light':'dark';try{localStorage.setItem('soon-theme',T)}catch(e){}applyT();render()}
const tbtn=()=>`<button class="sq" title="Toggle dark mode" onclick="toggleT()">${ic(T==='dark'?'sun':'moon')}</button>`;
const LOC=[{n:'Indiranagar',lat:12.9784,lng:77.6408},{n:'Koramangala',lat:12.9352,lng:77.6245},{n:'Whitefield',lat:12.9698,lng:77.7500},{n:'HSR Layout',lat:12.9116,lng:77.6474},{n:'Jayanagar',lat:12.9250,lng:77.5938},{n:'Malleshwaram',lat:13.0035,lng:77.5643},{n:'Hebbal',lat:13.0358,lng:77.5970},{n:'Marathahalli',lat:12.9591,lng:77.6974},{n:'Electronic City',lat:12.8452,lng:77.6602},{n:'Yelahanka',lat:13.1007,lng:77.5963},{n:'JP Nagar',lat:12.9063,lng:77.5857}];
const LOCS=LOC.map(x=>x.n);
const hav=(a,b,c,d)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const dkm=s=>+(hav(LOC[S.loc].lat,LOC[S.loc].lng,s.lat,s.lng)*1.3).toFixed(1);
const areaOf=s=>LOC.slice().sort((a,b)=>hav(a.lat,a.lng,s.lat,s.lng)-hav(b.lat,b.lng,s.lat,s.lng))[0].n;
const CATM={'Grocery store':['🏪',['Daily needs']],'Supermarket':['🏬',['Supermarket','Daily needs']],'Fruits and vegetables':['🥬',['Fresh']],'Dairy':['🥛',['Daily needs','Fresh']],'Bakery':['🍞',['Daily needs']],'Dessert shop':['🍰',['Desserts']]};
const BGS=['#FFE7A8','#FFD3C4','#CDEBD6','#D3E2FF'];
const blankReg=()=>({name:'',owner:'',phone:'',area:0,cat:'Grocery store'});
const CATS=['All','Daily needs','Fresh','Organic','Supermarket','Desserts'];
const EMS=['🥛','🍞','🥚','🍌','🍅','🧈','🍚','🫘','🍪','🥬','🍎','🥕','🧀','🥔','🥤','🍝','🍫','🍋','🥭','🍇','🧅','🥦','🐟','🍗'];
const mk=(id,name,em,bg,cats,prep,rating,lat,lng,items,status='approved',owner='Shop owner',phone='98450 00000')=>({id,name,em,bg,cats,prep,rating,lat,lng,status,owner,phone,open:true,items:items.map((x,i)=>({id:id+i,name:x[0],em:x[1],price:x[2],on:x[3],res:0}))});
function seed(){return [
mk('s1','Fresh Basket Mart','🛒','#FFE7A8',['Daily needs','Fresh'],8,4.6,12.9790,77.6405,[['Milk 1L','🥛',58,12],['Bread','🍞',40,3],['Eggs (6)','🥚',54,0],['Bananas 1kg','🍌',60,25],['Tomatoes 1kg','🍅',45,9],['Butter','🧈',56,7],['Onions 1kg','🧅',38,15],['Potatoes 1kg','🥔',30,20]]),
mk('s2','Sri Lakshmi Provisions','🏪','#FFD3C4',['Daily needs'],12,4.3,12.9500,77.6350,[['Basmati Rice 1kg','🍚',110,20],['Toor Dal 1kg','🫘',145,6],['Sunflower Oil 1L','🫒',160,0],['Tea 250g','🍵',120,14],['Biscuits','🍪',30,40],['Salt 1kg','🧂',22,30],['Onions 1kg','🧅',34,40],['Potatoes 1kg','🥔',28,3]]),
mk('s3','Green Leaf Organics','🥬','#CDEBD6',['Fresh','Organic'],10,4.8,12.9360,77.6260,[['Spinach bunch','🥬',25,4],['Apples 1kg','🍎',180,10],['Carrots 500g','🥕',40,2],['Almond Milk','🥤',210,5],['Onions 1kg (organic)','🧅',55,4]]),
mk('s4','City Super Bazaar','🏬','#D3E2FF',['Supermarket','Daily needs'],15,4.1,12.9710,77.7480,[['Pasta 500g','🍝',90,30],['Cheese slices','🧀',120,8],['Chips','🥔',20,50],['Cold Drink 2L','🥤',95,0],['Onions 1kg','🧅',42,0],['Potatoes 1kg','🥔',36,25]]),
mk('s5','Annapurna Stores','🏪','#FFE7A8',['Daily needs'],10,'New',12.9655,77.7440,[],'pending','Suresh K','98450 11223')
]}
const fresh=()=>({role:null,pick:'customer',shops:[],token:null,user:null,lg:{phone:'',code:'',sent:false,hint:''},orders:[],loc:0,view:'home',shopId:null,cart:{},oid:null,owner:'s1',toast:'',q:'',cat:'All',tab:'over',modal:null,from:'home',sort:'best',map:false,mode:'login',reg:blankReg(),atab:'apps'});
let S=fresh();
const RADIUS=5,av=i=>i.on-i.res,sh=id=>S.shops.find(s=>s.id===id),inr=n=>'₹'+n;
const eta=s=>Math.round(s.prep+dkm(s)*4.5+5);
const STAT=['placed','accepted','packing','out','delivered'];
const LAB={placed:'Order placed',accepted:'Shop accepted',packing:'Packing your items',out:'Out for delivery',delivered:'Delivered'};
const PCT={placed:4,accepted:22,packing:42,out:72,delivered:100};
function say(t){S.toast=t;render();setTimeout(()=>{S.toast='';render()},2000)}
function setLoc(i){S.loc=i;S.cart={};render()}
function openShop(id){S.shopId=id;S.cart={};S.view='shop';render()}
function go(v){S.view=v;render()}
function add(id,d){if(d>0&&dkm(sh(S.shopId))>RADIUS){say('Outside delivery range, choose a nearer shop');return}const it=sh(S.shopId).items.find(x=>x.id===id);if(!it){S.cart={};render();return}const q=(S.cart[id]||0)+d;
 if(q>av(it)){say('Only '+av(it)+' available');return}
 if(q<=0)delete S.cart[id];else S.cart[id]=q;render()}
const cartList=()=>{const s=sh(S.shopId);return Object.entries(S.cart).map(([id,q])=>({it:s.items.find(x=>x.id===id),q})).filter(c=>c.it)};
const total=()=>cartList().reduce((a,c)=>a+c.it.price*c.q,0),count=()=>cartList().reduce((a,c)=>a+c.q,0),fee=()=>total()<199?25:0;
function checkout(){const s=sh(S.shopId),L=cartList();
 if(L.some(c=>c.q>av(c.it))){S.cart={};S.view='shop';say('Stock changed, please review your cart');return}
 L.forEach(c=>c.it.res+=c.q);
 const o={id:'#'+(1001+S.orders.length),shopId:s.id,items:L.map(c=>({id:c.it.id,name:c.it.name,q:c.q,p:c.it.price})),status:'placed',total:total()+fee()};
 S.orders.unshift(o);S.oid=o.id;S.from='home';S.cart={};S.view='track';render()}
function setStatus(id,st){const o=S.orders.find(x=>x.id===id),s=sh(o.shopId);
 const f=l=>s.items.find(x=>x.id===l.id);
 if(st==='rejected')o.items.forEach(l=>{const it=f(l);if(it)it.res-=l.q});
 if(st==='delivered')o.items.forEach(l=>{const it=f(l);if(it){it.res-=l.q;it.on-=l.q}});
 o.status=st;render()}
function setOn(sid,iid,v){const it=sh(sid).items.find(x=>x.id===iid);it.on=Math.max(it.res,Math.max(0,parseInt(v)||0));render()}
function login(){S.role=S.pick;S.view='home';S.cart={};S.tab='over';render()}
function logout(){S.role=null;render()}
function setTab(t){S.tab=t;render()}
function openM(id){const s=sh(S.owner),it=id?s.items.find(x=>x.id===id):null;
 S.modal=it?{id,name:it.name,em:it.em,price:it.price,on:it.on}:{id:null,name:'',em:'🥛',price:'',on:''};render()}
function closeM(){S.modal=null;render()}
function saveM(){const m=S.modal,s=sh(S.owner),price=parseInt(m.price),on=parseInt(m.on);
 if(!m.name.trim()||!(price>=0)||!(on>=0)){say('Fill name, price and stock');return}
 if(m.id){const it=s.items.find(x=>x.id===m.id);if(on<it.res){say(it.res+' units are reserved, stock cannot go lower');return}Object.assign(it,{name:m.name.trim(),em:m.em,price,on})}
 else s.items.push({id:s.id+'n'+Date.now(),name:m.name.trim(),em:m.em,price,on,res:0});
 S.modal=null;say(m.id?'Item updated':'Item added, customers can see it now')}
function delItem(){const m=S.modal,s=sh(S.owner),it=s.items.find(x=>x.id===m.id);
 if(it.res>0){say('Cannot delete: '+it.res+' reserved by open orders');return}
 s.items=s.items.filter(x=>x!==it);S.modal=null;say('Item removed')}

Object.assign(P,{heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',map:'<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',store:'<path d="M3 9l1-5h16l1 5M3 9h18M3 9v11h18V9M9 20v-6h6v6"/>',check:'<path d="M20 6L9 17l-5-5"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>'});
function regShop(){const r=S.reg;if(!r.name.trim()||!r.owner.trim()||r.phone.replace(/\D/g,'').length<10){say('Enter shop name, owner name and a 10 digit phone');return}
 const c=CATM[r.cat],a=LOC[r.area],id='sx'+Date.now()%100000;
 S.shops.push({id,name:r.name.trim(),owner:r.owner.trim(),phone:r.phone,em:c[0],bg:BGS[S.shops.length%4],cats:c[1],prep:10,rating:'New',lat:a.lat+(Math.random()-.5)*.012,lng:a.lng+(Math.random()-.5)*.012,status:'pending',open:true,items:[]});
 S.owner=id;S.role='shop';S.tab='over';S.reg=blankReg();S.mode='login';render()}
function approve(id){const s=sh(id);s.status='approved';s.reason='';say(s.name+' approved, now visible to customers')}
function rejectShop(id){const s=sh(id),r=document.getElementById('rr-'+id);s.status='rejected';s.reason=r?r.value:'Not specified';say('Application rejected')}
function suspend(id){sh(id).status='suspended';say('Shop suspended and hidden from customers')}
function resubmit(id){const s=sh(id);s.status='pending';s.reason='';render()}
function reorder(id){const o=S.orders.find(x=>x.id===id),s=sh(o.shopId);S.shopId=s.id;S.cart={};let miss=0;
 o.items.forEach(l=>{const it=s.items.find(x=>x.id===l.id);if(!it){miss++;return}const q=Math.min(l.q,av(it));if(q>0)S.cart[it.id]=q;if(q<l.q)miss++});
 S.view='cart';render();if(miss)say(miss+' item(s) limited or unavailable')}

function setSort(k){S.sort=k;render()}
function addFrom(sid,iid){S.shopId=sid;S.cart={};S.view='shop';add(iid,1)}

function loginView(){const p=S.pick,reg=p==='shop'&&S.mode==='reg',R=S.reg,L=S.lg;
 const fe=[['🍅','8%','22%','0s'],['🥛','72%','10%','1s'],['🍞','62%','62%','2s'],['🥑','12%','72%','.5s'],['🍎','86%','42%','1.5s']].map(f=>`<span class="fe" style="left:${f[1]};top:${f[2]};animation-delay:${f[3]}">${f[0]}</span>`).join('');
 const role=(k,e,t,s)=>`<div class="role ${p==k?'on':''}" onclick="S.pick='${k}';render()"><span>${e}</span><b>${t}</b><small>${s}</small></div>`;
 let form='';
 if(reg)form=`<div class="lab" style="margin-top:0">Shop name</div><input class="inp" placeholder="e.g. Annapurna Stores" value="${R.name}" oninput="S.reg.name=this.value">
  <div class="g2"><div><div class="lab">Owner name</div><input class="inp" value="${R.owner}" oninput="S.reg.owner=this.value"></div><div><div class="lab">Mobile</div><input class="inp" placeholder="98450 12345" value="${L.phone}" inputmode="tel" oninput="S.lg.phone=this.value"></div></div>
  <div class="lab">Shop location</div><div class="locbox" style="display:flex;gap:8px;align-items:center;padding:10px 12px;border:1.5px dashed var(--line);border-radius:12px"><span style="flex:1;font-size:13px">${R.geo?'📍 <b>'+R.geo.name+'</b><br><small>'+R.geo.lat.toFixed(4)+', '+R.geo.lng.toFixed(4)+'</small>':(R.geoBusy?'Detecting your location...':'Not set. Detect it, or pick an area below')}</span><button class="sec" style="white-space:nowrap" onclick="detectShopLoc()">${R.geo?'Refresh':'Detect'}</button></div><div class="g2"><div><div class="lab">Area</div><select class="inp" onchange="if(this.value==='gps'){detectShopLoc()}else{S.reg.area=+this.value;S.reg.geo=null;render()}"><option value="gps" ${R.geo||R.geoBusy?'selected':''}>${R.geo?'📍 '+R.geo.name+' (detected)':R.geoBusy?'Detecting...':'📍 Use my current location'}</option>${LOC.filter(l=>!l.live).map((l,i)=>`<option value="${i}" ${!R.geo&&!R.geoBusy&&i==R.area?'selected':''}>${l.n}</option>`).join('')}</select></div>
  <div><div class="lab">Shop type</div><select class="inp" onchange="S.reg.cat=this.value">${Object.keys(CATM).map(k=>`<option ${k==R.cat?'selected':''}>${k}</option>`).join('')}</select></div></div>
  <div class="docs"><span>✓ FSSAI licence (demo)</span><span>✓ GST certificate (demo)</span><span>✓ Shop photo (demo)</span></div><div class="lab">OTP</div><div style="display:flex;gap:8px"><input class="inp" inputmode="numeric" maxlength="6" placeholder="4 digit OTP" value="${L.code}" oninput="S.lg.code=this.value" onkeydown="if(event.key==='Enter')${reg?'regShop()':'login()'}"><button class="sec" style="white-space:nowrap" onclick="sendOtp()">${L.sent?'Resend':'Send OTP'}</button></div>${L.hint?`<small style="display:block;margin-top:6px">${L.hint}</small>`:''}`;
 else form=`<div class="lab" style="margin-top:0">Mobile number</div><input class="inp" inputmode="tel" placeholder="98450 00001" value="${L.phone}" oninput="S.lg.phone=this.value"><div class="lab">OTP</div><div style="display:flex;gap:8px"><input class="inp" inputmode="numeric" maxlength="6" placeholder="4 digit OTP" value="${L.code}" oninput="S.lg.code=this.value" onkeydown="if(event.key==='Enter')${reg?'regShop()':'login()'}"><button class="sec" style="white-space:nowrap" onclick="sendOtp()">${L.sent?'Resend':'Send OTP'}</button></div>${L.hint?`<small style="display:block;margin-top:6px">${L.hint}</small>`:''}`;
 const btn=reg?'Submit for approval →':'Continue as '+({customer:'customer',shop:'shop owner',admin:'admin'}[p])+' →';
 return `<div class="lg"><div class="hero2">${fe}<div style="color:#fff">${logo(38)}</div>
 <div><div class="big d">Groceries from the shop next door. <em>Soon.</em></div><p style="margin-top:16px;color:#cfeadb;max-width:430px;font-size:17px;line-height:1.5">Order from supermarkets and grocery shops around you. The nearest shop delivers first, and stock is always live.</p></div>
 <div class="stats"><div><b>25 min</b><small>avg delivery</small></div><div><b>120+</b><small>local shops</small></div><div><b>Live</b><small>stock updates</small></div></div></div>
 <div class="fm"><div class="tt">${tbtn()}</div><div class="fc"><h2 class="d">${reg?'Open your shop on Soon':'Welcome back'}</h2><small>${reg?'We review every shop before it goes live':'Choose how you want to continue'}</small>
 <div class="roles roles3">${role('customer','🛍️','Customer','Order')}${role('shop','🏪','Shop owner','Sell')}${role('admin','🛡️','Admin','Approve')}</div>
 ${p=='shop'?`<div class="tabs"><b class="${!reg?'on':''}" onclick="S.mode='login';render()">Login</b><b class="${reg?'on':''}" onclick="S.mode='reg';render();detectShopLoc(true)">Register new shop</b></div>`:''}
 ${form}<button class="pri" style="width:100%;padding:16px;margin-top:22px;font-size:16px" onclick="${reg?'regShop()':'login()'}">${btn}</button>
 <p style="margin-top:14px;text-align:center"><small>Demo mode: no SMS is sent, the OTP is 1234.<br>Try: customer 90000 00001, shop owner 98450 00001, admin 90000 00000</small></p></div></div></div>${S.toast?`<div class="toast gt">${S.toast}</div>`:''}`}
const rtg=r=>typeof r==='number'?r:4;
function searchProducts(q){
 const rows=[];S.shops.filter(s=>s.status==='approved').forEach(s=>s.items.forEach(i=>{if(i.name.toLowerCase().includes(q)){const d=dkm(s);rows.push({s,i,a:av(i),d,e:eta(s),p:i.price,r:rtg(s.rating),ok:d<=RADIUS&&s.open})}}));
 if(!rows.length)return null;
 const live=rows.filter(r=>r.ok&&r.a>0),rest=rows.filter(r=>!(r.ok&&r.a>0)).sort((a,b)=>a.d-b.d);
 const mxE=Math.max(...live.map(r=>r.e),1),mxP=Math.max(...live.map(r=>r.p),1);
 const score=r=>.45*r.e/mxE+.35*r.p/mxP+.2*(5-r.r)/2;
 const by={best:(a,b)=>score(a)-score(b),near:(a,b)=>a.d-b.d,cheap:(a,b)=>a.p-b.p||a.d-b.d,rated:(a,b)=>b.r-a.r||a.d-b.d}[S.sort];
 const best=live.slice().sort(by);
 const near=live.slice().sort((a,b)=>a.d-b.d)[0],cheap=live.slice().sort((a,b)=>a.p-b.p)[0],top=live.slice().sort((a,b)=>b.r-a.r)[0],bst=live.slice().sort((a,b)=>score(a)-score(b))[0];
 const tip=near&&cheap&&near!==cheap&&near.p>cheap.p?`<div class="notice" style="margin:0 18px 12px">Nearest shop charges ₹${near.p-cheap.p} more than the cheapest (${cheap.s.name}, ${cheap.d} km away).</div>`:'';
 const bd=(r)=>[r===bst?'<span class="b1">BEST MATCH</span>':'',r===near?'<span class="b2">NEAREST</span>':'',r===cheap?'<span class="b3">CHEAPEST</span>':'',r===top&&live.length>1?'<span class="b4">TOP RATED</span>':''].join('');
 const card=(r,k)=>{const {s,i}=r,live1=r.ok&&r.a>0;
  const note=!r.ok?(s.open?'Too far':'Closed'):r.a<=0?'Out of stock':r.a<=5?'Only '+r.a+' left':'In stock';
  return `<div class="sr ${live1?'':'dis'}" style="animation-delay:${k*50}ms"><div class="im2" style="background-color:${s.bg}">${i.em}</div>
  <div style="flex:1;min-width:0"><b style="font-size:14px">${i.name}</b><div class="m2">${s.em} ${s.name}</div>
  <div class="m2"><span class="rt">★ ${s.rating}</span><span>${r.d} km</span><span>${r.e}-${r.e+8} min</span></div><div class="bdg">${live1?bd(r):''}</div></div>
  <div class="rp"><b>${inr(i.price)}</b><small style="color:${r.a>0&&r.a<=5?'var(--coral)':'var(--mut)'};font-weight:700">${note}</small>${live1?`<button class="add" onclick="addFrom('${s.id}','${i.id}')">Add</button>`:''}</div></div>`};
 const sg=(k,l)=>`<span class="chip ${S.sort===k?'on':''}" onclick="setSort('${k}')">${l}</span>`;
 return `<div class="h3" style="font-size:15px;margin-bottom:2px">${rows.length} shop${rows.length>1?'s':''} sell “${S.q.trim()}”</div><div class="chips" style="padding-top:6px">${sg('best','Best match')}${sg('near','Nearest')}${sg('cheap','Cheapest')}${sg('rated','Top rated')}</div>${tip}`
  +best.map(card).join('')+(rest.length?`<div class="h3" style="font-size:13px;color:var(--mut);margin-top:14px">Unavailable right now</div>`+rest.map((r,k)=>card(r,k)).join(''):'');
}
function shopList(){const q=S.q.trim().toLowerCase();if(q){const pr=searchProducts(q);if(pr)return pr}
 const L=S.shops.filter(s=>s.status==='approved'&&(S.cat==='All'||s.cats.includes(S.cat))&&(!q||s.name.toLowerCase().includes(q)||s.items.some(i=>i.name.toLowerCase().includes(q))))
 .map(s=>({s,e:eta(s),ok:dkm(s)<=RADIUS})).sort((a,b)=>(b.ok-a.ok)||(b.s.open-a.s.open)||(a.e-b.e));
 if(!L.length)return '<div class="emp">No shops found</div>';
 return L.map(({s,e,ok},k)=>{const off=!ok||!s.open;
  return `<div class="sc ${off?'dis':''}" style="animation-delay:${k*70}ms" onclick="${!s.open?`say('Shop is closed')`:`openShop('${s.id}')`}">
  <div class="cov" style="background-color:${s.bg}">${k==0&&!off?'<span class="bd">FASTEST</span>':''}${s.em}<span class="e ${off?'off':e>30?'slow':''}">${!ok?'Too far':!s.open?'Closed':e+'-'+(e+8)+' min'}</span></div>
  <div class="sbd"><b>${s.name}</b><div class="m"><span class="rt">★ ${s.rating}</span><span>${dkm(s)} km</span><span>${s.cats.join(' · ')}</span></div></div></div>`}).join('')}
function renderList(){const e=document.getElementById('shoplist');if(e)e.innerHTML=shopList()}
function setCat(c){S.cat=c;render()}
const navItems=()=>{const n=S.orders.filter(o=>!['delivered','rejected'].includes(o.status)).length,c=cartCount(),w=(S.wish||[]).length;
 const l=(v,i,t,b)=>`<a class="${S.view===v?'on':''}" onclick="go('${v}')">${ic(i,22)}<span>${t}</span>${b?`<em>${b}</em>`:''}</a>`;
 return l('home','home','Home')+l('wish','heart','Wishlist',w)+l('cart','cart','Cart',c)+l('orders','receipt','Orders',n)};
const bnav=()=>`<div class="bnav">${navItems()}</div>`;
const cartCount=()=>{try{return Object.values(S.cart).reduce((a,b)=>a+b,0)}catch(e){return 0}};
function phone(){let h='';if(S.view==='wish')return wishView();if(S.view==='cart'&&(!S.shopId||!sh(S.shopId)||!cartCount()))return emptyCart();if(S.view==='account'||S.view==='addr')return acctView();
 if(S.view==='home'){
  h=`<div class="top"><div class="sb"><span>9:41</span><span>5G ▮▮▮</span></div>
  <div class="greet"><small>${greeting()}</small><b class="d">${(S.user&&S.user.name)||'Welcome'} 👋</b></div><div class="lr"><div><small>Deliver to</small><br><b onclick="useMyLoc()" style="cursor:pointer">📍 ${S.geoBusy?'Detecting location...':LOCS[S.loc]}${S.loc===LIVEI&&LIVEI>=0?' <span style="font-size:9px;background:#C8F169;color:#082f23;padding:2px 6px;border-radius:6px;vertical-align:middle">LIVE</span>':' ▾'}</b></div><div class="av" onclick="openDrawer()" style="cursor:pointer">${(S.user&&S.user.name||'U')[0].toUpperCase()}</div></div>
  <div class="search"><span>🔍</span><input id="q" placeholder="Search shops or items" value="${S.q}" oninput="S.q=this.value;renderList()"></div></div>
  <div class="areabar"><div class="ab1"><label>Choose your area</label><select class="areasel" onchange="setLoc(+this.value)">${LOCS.map((l,i)=>`<option value="${i}" ${i==S.loc?'selected':''}>${i==LIVEI&&LIVEI>=0?'📍 '+l+' (live)':l}</option>`).join('')}</select></div><div class="ab2"><label>&nbsp;</label><button class="locbtn ${S.loc===LIVEI&&LIVEI>=0?'on':''}" onclick="useMyLoc()">${S.geoBusy?'Locating...':'🎯 Current location'}</button></div></div>
  <div class="promo"><h3 class="d">Nearest shop delivers first</h3><small>Free delivery over ₹199</small><i>🛵</i></div>
  <div class="chips">${CATS.map(c=>`<span class="chip ${c==S.cat?'on':''}" onclick="setCat('${c}')">${c}</span>`).join('')}</div>
  <div class="h3" style="display:flex;justify-content:space-between;align-items:center">Shops near you<span class="seg"><b class="${!S.map?'on':''}" onclick="S.map=false;render()">List</b><b class="${S.map?'on':''}" onclick="S.map=true;render()">Map</b></span></div>
  ${S.map?'<div class="mapbox" id="hmap"></div>':''}<div id="shoplist">${shopList()}</div>`+bnav()}
 if(S.view==='orders'){
  h=`<div class="tp"><h2 class="d">My orders</h2></div>`+(S.orders.length?S.orders.map((o,k)=>{const s=sh(o.shopId),act=!['delivered','rejected'].includes(o.status);
   return `<div class="cd oc" style="animation-delay:${k*60}ms" onclick="S.oid='${o.id}';S.from='orders';go('track')"><div class="ln" style="padding-top:0"><div class="im2" style="background-color:${s.bg}">${s.em}</div><div style="flex:1"><b>${s.name}</b><br><small>${o.id} · ${oline(o)}</small></div></div>
   <div class="rw"><b>${inr(o.total)}</b><span class="pill ${o.status==='rejected'?'p-out':o.status==='delivered'?'p-in':'p-low'}">${o.status==='rejected'?'Rejected':LAB[o.status]}</span></div>
   <div class="bt2">${act?'<button class="pri">Track order</button>':''}<button class="sec" onclick="event.stopPropagation();reorder('${o.id}')">Reorder</button></div></div>`}).join(''):'<div class="emp" style="padding:60px 20px"><div style="font-size:50px">🧺</div><b style="font-size:16px;color:var(--ink)">No orders yet</b><br>Your past orders will show up here.</div>')+bnav()}
 if(S.view==='shop'){const s=sh(S.shopId);
  h=`<div class="sh" style="background-color:${s.bg}"><button class="bk" onclick="go('home')">←</button><span class="big">${s.em}</span><h2 class="d">${s.name}</h2>
  <div class="row2"><span class="pl">★ ${s.rating}</span><span class="pl">⏱ ${eta(s)}-${eta(s)+8} min</span><span class="pl">${dkm(s)} km</span></div></div>
  ${dkm(s)>RADIUS?`<div class="notice" style="margin:14px 18px 0">This shop is ${dkm(s)} km away, outside the ${RADIUS} km delivery range. You can look around, but ordering is switched off. Pick a nearer area or use another shop.</div>`:''}<div class="h3" style="margin-top:18px">Items</div>${s.items.length?'':'<div class="emp">This shop has not added items yet</div>'}<div class="grid">${s.items.map((i,k)=>{const a=av(i),q=S.cart[i.id]||0;
  return `<div class="it ${a<=0?'out':''}" style="animation-delay:${k*50}ms"><div class="im">${i.em}</div><button class="hrt ${isW(i.id)?'on':''}" onclick="wish('${i.id}')">${isW(i.id)?'♥':'♡'}</button>${a<=0?'<span class="oos">OUT OF STOCK</span>':''}${a>0&&a<=5?`<span class="lowb">Only ${a} left</span>`:''}<b>${i.name}</b>
  <div class="pr"><span>${inr(i.price)}</span>${a<=0?`<button class="nm" onclick="say('We will notify you')">Notify me</button>`:q?`<div class="q"><button onclick="add('${i.id}',-1)">−</button><span>${q}</span><button onclick="add('${i.id}',1)">+</button></div>`:`<button class="add" onclick="add('${i.id}',1)">Add</button>`}</div></div>`}).join('')}</div>`;
  if(count())h+=`<div class="bar" onclick="go('cart')"><span><span class="c">${count()}</span>${inr(total())}</span><b>View cart →</b></div>`}
if(S.view==='cart'){
  h=`<div class="tp"><button class="ghost" onclick="go('shop')" style="font-size:20px">←</button><h2 class="d">Your cart</h2></div>
  <div class="cd"><small>Delivering to</small><div style="font-weight:700;margin-top:3px">${selAddr()}</div></div>
  <div class="notice">Stock is held for you for 10 minutes after you place the order.</div>
  <div class="cd">${cartList().map(c=>`<div class="ln"><div class="im2">${c.it.em}</div><div style="flex:1"><b style="font-size:14px">${c.it.name}</b><br><small>${inr(c.it.price)}</small></div><div class="q"><button onclick="add('${c.it.id}',-1)">−</button><span>${c.q}</span><button onclick="add('${c.it.id}',1)">+</button></div></div>`).join('')||'<div class="emp">Cart is empty</div>'}</div>
  <div class="cd"><div class="rw"><span>Items</span><span>${inr(total())}</span></div><div class="rw"><span>Delivery</span><span>${fee()?inr(fee()):'<b style="color:var(--g)">Free</b>'}</span></div><div class="rw"><b>Total</b><b>${inr(total()+fee())}</b></div></div>
  <button class="pri cta" ${count()?'':'disabled'} onclick="checkout()">Place order · ${inr(total()+fee())}</button>`}
 if(S.view==='track'){const o=S.orders.find(x=>x.id===S.oid),s=sh(o.shopId),idx=STAT.indexOf(o.status);
  h=`<div class="tp"><button class="ghost" onclick="go(S.from||'home')" style="font-size:20px">←</button><h2 class="d">Order ${o.id}</h2></div>`;
  if(o.status==='rejected')h+=`<div class="cd" style="border:2px solid var(--coral)"><b style="color:var(--dangt)">Shop could not fulfil this order</b><p style="margin:6px 0 12px"><small>Your items were released. We can try the next nearest shop.</small></p><button class="pri" onclick="go('home')">Find another shop</button></div>`;
  else{const p=PCT[o.status];
   h+=`<div class="eta-b"><small>${o.status==='delivered'?'Enjoy your groceries':'Arriving in'}</small><br><b>${o.status==='delivered'?'Delivered 🎉':eta(s)+' min'}</b></div>
   <div class="map" id="tmap"><div class="route"><i style="width:${p}%"></i></div><span class="pin" style="left:14%">${s.em}</span><span class="pin" style="left:86%">🏠</span><span class="rider" style="left:${14+72*p/100}%">🛵</span></div>
   <div class="cd">${STAT.map((k,i)=>`<div class="st ${i<idx||o.status==='delivered'?'done':i==idx?'now':''}"><i>${i<idx||o.status==='delivered'?'✓':''}</i>${LAB[k]}</div>`).join('')}</div>
   ${o.status==='placed'?'<div class="notice">Waiting for the shop. Log out and log in as this shop owner to accept the order.</div>':''}`}
  h+=`<div class="cd"><b>${s.name}</b><br><small>${o.items.map(l=>l.q+'× '+l.name).join(', ')}</small><div class="rw" style="margin-top:8px"><span>Total paid</span><b>${inr(o.total)}</b></div></div>
  <button class="${o.status==='delivered'||o.status==='rejected'?'pri':'sec'} cta" onclick="go(S.from==='orders'?'orders':'home')">${S.from==='orders'?'Back to orders':'Back to shops'}</button>`}
 return h+(S.toast?`<div class="toast">${S.toast}</div>`:'')}

const NX={placed:['accepted','Accept'],accepted:['packing','Start packing'],packing:['out','Out for delivery'],out:['delivered','Mark delivered']};
const oline=o=>o.items.map(l=>l.q+'× '+l.name).join(', ');
function ocard(o){const n=NX[o.status];return `<div class="ord"><div class="t"><b>${o.id}</b><b>${inr(o.total)}</b></div><small>${oline(o)}</small>${o.address?`<br><small>📍 ${o.address}</small>`:''}
 <div class="a">${n?`<button class="pri" onclick="setStatus('${o.id}','${n[0]}')">${n[1]}</button>`:`<span class="pill ${o.status==='rejected'?'p-out':'p-in'}">${o.status==='rejected'?'Rejected':'Delivered'}</span>`}${o.status==='placed'?`<button class="dng" onclick="setStatus('${o.id}','rejected')">Reject</button>`:''}</div></div>`}
function chart(rev){const v=[820,1140,960,1380,1100,1560,400+rev],mx=Math.max(...v)*1.15,d=['Tue','Wed','Thu','Fri','Sat','Sun','Today'];
 const pts=v.map((y,i)=>[30+i*90,190-y/mx*160]);const ln=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
 return `<svg viewBox="0 0 600 230" style="width:100%"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34c38b" stop-opacity=".35"/><stop offset="1" stop-color="#34c38b" stop-opacity="0"/></linearGradient></defs>
 ${[0,1,2,3].map(i=>`<line x1="20" x2="580" y1="${30+i*53}" y2="${30+i*53}" stroke="var(--line)"/>`).join('')}
 <path d="${ln} L570 190 L30 190Z" fill="url(#ar)"/><path d="${ln}" fill="none" stroke="var(--g)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
 ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i==6?6:3.5}" fill="${i==6?'var(--g)':'var(--card)'}" stroke="var(--g)" stroke-width="2.5"/>`).join('')}
 ${d.map((t,i)=>`<text x="${30+i*90}" y="218" text-anchor="middle" font-size="13" fill="var(--mut)" font-family="DM Sans">${t}</text>`).join('')}
 <text x="${pts[6][0]-8}" y="${pts[6][1]-14}" text-anchor="end" font-size="13" font-weight="700" fill="var(--ink)" font-family="DM Sans">${inr(v[6])}</text></svg>`}
function stockTable(s){return `<table><tr><th>Item</th><th>Price</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Status</th><th></th></tr>
 ${s.items.map(i=>{const a=av(i);return `<tr><td><span class="iim">${i.em}</span><b>${i.name}</b></td><td>${inr(i.price)}</td>
 <td><button class="sm" onclick="setOn('${s.id}','${i.id}',${i.on-1})">−</button> <input class="num" value="${i.on}" onchange="setOn('${s.id}','${i.id}',this.value)"> <button class="sm" onclick="setOn('${s.id}','${i.id}',${i.on+1})">+</button></td><td>${i.res}</td>
 <td><b>${a}</b><div class="mt"><i class="${a<=0?'o':a<=5?'l':''}" style="width:${Math.min(100,a*4)}%"></i></div></td><td><span class="pill ${a<=0?'p-out':a<=5?'p-low':'p-in'}">${a<=0?'Out of stock':a<=5?'Low stock':'In stock'}</span></td>
 <td style="white-space:nowrap"><button class="sq" title="Edit" onclick="openM('${i.id}')">${ic('edit',16)}</button></td></tr>`}).join('')}</table>
 <p style="margin-top:14px"><small>Available = on hand − reserved. At 0 the item shows Out of stock on the customer app automatically.</small></p>`}
function modal(){const m=S.modal;if(!m)return '';
 return `<div class="mo" onclick="closeM()"><div class="md" onclick="event.stopPropagation()"><h3 class="d">${m.id?'Edit item':'Add new item'}</h3><small>${m.id?'Changes show to customers instantly':'It appears in your shop on the customer app'}</small>
 <div class="lab">Pick an icon</div><div class="em9">${EMS.map(e=>`<span class="${e==m.em?'on':''}" onclick="S.modal.em='${e}';render()">${e}</span>`).join('')}</div>
 <div class="lab">Item name</div><input class="inp" placeholder="e.g. Fresh Paneer 200g" value="${m.name.replace(/"/g,'&quot;')}" oninput="S.modal.name=this.value">
 <div class="g2"><div><div class="lab">Price (₹)</div><input class="inp" type="number" min="0" value="${m.price}" oninput="S.modal.price=this.value"></div><div><div class="lab">Stock quantity</div><input class="inp" type="number" min="0" value="${m.on}" oninput="S.modal.on=this.value"></div></div>
 <div style="display:flex;gap:10px;margin-top:22px">${m.id?`<button class="dng ib" onclick="delItem()">${ic('trash',16)} Delete</button>`:''}<span style="flex:1"></span><button class="sec" onclick="closeM()">Cancel</button><button class="pri" onclick="saveM()">${m.id?'Save changes':'Add item'}</button></div></div></div>`}
function owner(){const s=sh(S.owner);if(s.status!=='approved')return gate(s);const orders=S.orders.filter(o=>o.shopId===s.id);
 const lows=s.items.filter(i=>av(i)>0&&av(i)<=5),outs=s.items.filter(i=>av(i)<=0),ok=s.items.length-lows.length-outs.length,rev=orders.filter(o=>o.status==='delivered').reduce((a,o)=>a+o.total,0),nw=orders.filter(o=>o.status==='placed').length;
 const col=(t,f)=>{const l=orders.filter(f);return `<div class="col"><h4>${t} (${l.length})</h4>${l.map(ocard).join('')||'<div class="emp">Nothing here</div>'}</div>`};
 const board=`<div class="board">${col('New',o=>o.status==='placed')}${col('In progress',o=>['accepted','packing','out'].includes(o.status))}${col('Done',o=>['delivered','rejected'].includes(o.status))}</div>`;
 const tt={over:'Overview',orders:'Orders',stock:'Stock and items'}[S.tab];
 const nav=(k,i,l,b)=>`<a class="${S.tab==k?'on':''}" onclick="setTab('${k}')">${ic(i)}${l}${b?`<em>${b}</em>`:''}</a>`;
 let body='';
 if(S.tab==='over')body=`<div class="kp"><div class="k g"><span>📦</span><small>Orders</small><b>${orders.length}</b></div><div class="k"><span>💰</span><small>Revenue</small><b>${inr(rev)}</b></div><div class="k w"><span>⚠️</span><small>Low stock</small><b>${lows.length}</b></div><div class="k r"><span>🚫</span><small>Out of stock</small><b>${outs.length}</b></div></div>
  ${lows.length?`<div class="al">Low stock alert: ${lows.map(i=>i.name+' ('+av(i)+' left)').join(', ')}</div>`:''}
  <div class="two"><div class="card2"><h3 class="d">Sales, last 7 days</h3>${chart(rev)}</div>
  <div class="card2"><h3 class="d">Stock health</h3><div class="hb"><div><span>In stock</span><span>${ok}</span></div><div class="mt" style="margin-top:-8px"><i style="width:${ok/s.items.length*100}%"></i></div>
  <div><span>Low stock</span><span>${lows.length}</span></div><div class="mt" style="margin-top:-8px"><i class="l" style="width:${lows.length/s.items.length*100}%"></i></div>
  <div><span>Out of stock</span><span>${outs.length}</span></div><div class="mt" style="margin-top:-8px"><i class="o" style="width:${outs.length/s.items.length*100}%"></i></div></div>
  <button class="pri ib" style="width:100%;margin-top:20px" onclick="setTab('stock');openM()">${ic('plus',16)} Add new item</button></div></div>
  <div class="card2"><h3 class="d">Recent orders <button class="sec" onclick="setTab('orders')">View all</button></h3>${orders.slice(0,4).map(o=>`<div class="rl"><b>${o.id}</b><span style="flex:1"><small>${oline(o)}</small></span><b>${inr(o.total)}</b><span class="pill ${o.status==='rejected'?'p-out':o.status==='delivered'?'p-in':'p-low'}">${o.status==='rejected'?'Rejected':LAB[o.status]}</span></div>`).join('')||'<div class="emp">No orders yet. Place one from the customer app.</div>'}</div>`;
 if(S.tab==='orders')body=`<div class="card2"><h3 class="d">Order board</h3>${board}</div>`;
 if(S.tab==='stock')body=`<div class="card2"><h3 class="d">Items and stock <button class="pri ib" onclick="openM()">${ic('plus',16)} Add item</button></h3><div style="overflow:auto">${stockTable(s)}</div></div>`;
 return `<div class="od"><div class="side"><div>${logo(30)}</div>
 <div class="shop"><small>Your shop</small><b>${s.em} ${s.name}</b></div>
 <div class="nv">${nav('over','home','Overview')}${nav('orders','receipt','Orders',nw||'')}${nav('stock','box','Stock and items')}</div>
 <div class="bt"><button class="ib" onclick="toggleT()">${ic(T==='dark'?'sun':'moon')} ${T==='dark'?'Light mode':'Dark mode'}</button><button class="ib" onclick="logout()">${ic('out')} Logout</button></div></div>
 <div class="main"><div class="mh"><div><small>Shop owner dashboard</small><h1 class="d">${tt}</h1></div>
 <div class="sw">${s.open?'Accepting orders':'Shop closed'}<div class="tg ${s.open?'on':''}" onclick="sh('${s.id}').open=!sh('${s.id}').open;render()"></div></div></div>${body}</div>
 ${modal()}${S.toast?`<div class="toast gt">${S.toast}</div>`:''}</div>`}

function gate(s){const pend=s.status==='pending',rej=s.status==='rejected';
 const step=(t,st)=>`<div class="st ${st}"><i>${st==='done'?'✓':''}</i>${t}</div>`;
 return `<div class="gate"><div class="gc"><div style="margin-bottom:6px">${logo(26)}</div>
 <div class="bigi">${pend?'⏳':rej?'📝':'⛔'}</div><h2 class="d">${pend?'Application under review':rej?'Application needs changes':'Shop suspended'}</h2>
 <p class="mut" style="color:var(--mut)"><b style="color:var(--ink)">${s.name}</b> · ${s.owner}</p>
 ${pend?`<div class="tl card2" style="box-shadow:none;border:1px solid var(--line)">${step('Application submitted','done')}${step('Documents under check','now')}${step('Approved and live','')}</div><small>Usually takes 24 hours. For this demo, log out and log in as <b>Admin</b> to approve it.</small>`:''}
 ${rej?`<div class="notice" style="margin:16px 0"><b>Reason:</b> ${s.reason||'Not specified'}</div><button class="pri" onclick="resubmit('${s.id}')">Fix details and resubmit</button>`:''}
 ${s.status==='suspended'?`<p style="margin:12px 0;color:var(--mut)">Your shop is hidden from customers. Contact Soon support.</p>`:''}
 <div style="display:flex;gap:10px;justify-content:center;margin-top:22px">${tbtn()}<button class="sec ib" onclick="logout()">${ic('out',16)} Logout</button></div></div></div>`}
function admin(){const sp=S.shops,pend=sp.filter(s=>s.status==='pending'),ap=sp.filter(s=>s.status==='approved').length,rj=sp.filter(s=>s.status==='rejected'||s.status==='suspended').length;
 const nav=(k,i,l,b)=>`<a class="${S.atab==k?'on':''}" onclick="S.atab='${k}';render()">${ic(i)}${l}${b?`<em>${b}</em>`:''}</a>`;
 const pill=s=>`<span class="pill ${s.status==='approved'?'p-in':s.status==='pending'?'p-low':'p-out'}">${s.status[0].toUpperCase()+s.status.slice(1)}</span>`;
 let body=`<div class="kp"><div class="k g"><span>🏪</span><small>Total shops</small><b>${sp.length}</b></div><div class="k w"><span>⏳</span><small>Pending review</small><b>${pend.length}</b></div><div class="k"><span>✅</span><small>Live shops</small><b>${ap}</b></div><div class="k r"><span>🚫</span><small>Rejected or suspended</small><b>${rj}</b></div></div>`;
 if(S.atab==='apps')body+=`<div class="card2"><h3 class="d">Applications waiting for review</h3>${pend.map(s=>`<div class="apc"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">${s.em} ${s.name}</b>${pill(s)}</div>
  <div class="gr"><div><small>Owner</small><b>${s.owner}</b></div><div><small>Phone</small><b>${s.phone}</b></div><div><small>Area</small><b>${areaOf(s)}</b></div><div><small>Location</small><b>${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</b></div></div>
  <div class="docs" style="margin:0 0 14px"><span>FSSAI licence ✓</span><span>GST certificate ✓</span><span>Shop photo ✓</span></div>
  <div class="ac"><button class="pri ib" onclick="approve('${s.id}')">${ic('check',16)} Approve</button><select id="rr-${s.id}"><option>Documents unclear</option><option>Outside service area</option><option>Incomplete details</option><option>Duplicate shop</option></select><button class="dng ib" onclick="rejectShop('${s.id}')">${ic('x',16)} Reject</button></div></div>`).join('')||'<div class="emp">All caught up. No applications waiting.</div>'}</div>`;
 else body+=`<div class="card2"><h3 class="d">All shops</h3><div style="overflow:auto"><table><tr><th>Shop</th><th>Area</th><th>Items</th><th>Status</th><th></th></tr>${sp.map(s=>`<tr><td><span class="iim" style="background-color:${s.bg}">${s.em}</span><b>${s.name}</b><br><small style="margin-left:50px">${s.owner}</small></td><td>${areaOf(s)}</td><td>${s.items.length}</td><td>${pill(s)}${s.reason?`<br><small>${s.reason}</small>`:''}</td>
  <td>${s.status==='approved'?`<button class="dng" onclick="suspend('${s.id}')">Suspend</button>`:s.status!=='pending'?`<button class="sec" onclick="approve('${s.id}')">Approve</button>`:''}</td></tr>`).join('')}</table></div></div>`;
 return `<div class="od"><div class="side"><div>${logo(30)}</div><div class="shop"><small>Signed in as</small><b>${ic('shield',16)} Soon Admin</b></div>
 <div class="nv">${nav('apps','shield','Applications',pend.length||'')}${nav('all','store','All shops')}</div>
 <div class="bt"><button class="ib" onclick="toggleT()">${ic(T==='dark'?'sun':'moon')} ${T==='dark'?'Light mode':'Dark mode'}</button><button class="ib" onclick="logout()">${ic('out')} Logout</button></div></div>
 <div class="main"><div class="mh"><div><small>Platform admin</small><h1 class="d">${S.atab==='apps'?'Shop approvals':'All shops'}</h1></div></div>${body}</div>${S.toast?`<div class="toast gt">${S.toast}</div>`:''}</div>`}
let MAP=null;
const tile=m=>L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);
const mkIcon=(h,w=40)=>L.divIcon({className:'',html:h,iconSize:[w,w],iconAnchor:[w/2,w]});
function initMaps(){const hm=document.getElementById('hmap'),tm=document.getElementById('tmap');
 if(typeof L==='undefined'){if(hm)hm.innerHTML='<div class="emp" style="padding:90px 20px">The map needs an internet connection.</div>';return}
 if(hm){const c=LOC[S.loc];MAP=L.map(hm,{zoomControl:false}).setView([c.lat,c.lng],12);tile(MAP);
  L.circle([c.lat,c.lng],{radius:RADIUS/1.3*1000,color:'#16805f',weight:1.5,fillOpacity:.07}).addTo(MAP);
  L.marker([c.lat,c.lng],{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[18,18]})}).addTo(MAP);
  S.shops.filter(s=>s.status==='approved').forEach(s=>{const ok=dkm(s)<=RADIUS,e=eta(s);
   L.marker([s.lat,s.lng],{icon:mkIcon(`<div class="mk" style="background:${s.bg};opacity:${ok&&s.open?1:.5}"><i>${s.em}</i></div>`)}).addTo(MAP)
   .bindPopup(`<b>${s.name}</b><br>${ok?(s.open?e+'-'+(e+8)+' min · '+dkm(s)+' km':'Closed now'):'Too far to deliver · '+dkm(s)+' km'}${ok&&s.open?`<br><button class="pri" style="margin-top:8px;padding:7px 14px" onclick="openShop('${s.id}')">Open shop</button>`:''}`)})}
 if(tm&&S.view==='track'){const o=S.orders.find(x=>x.id===S.oid),s=sh(o.shopId),c=LOC[S.loc],p=(PCT[o.status]||0)/100;
  tm.innerHTML='';MAP=L.map(tm,{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false}).fitBounds([[s.lat,s.lng],[c.lat,c.lng]],{padding:[34,34]});tile(MAP);
  L.polyline([[s.lat,s.lng],[c.lat,c.lng]],{color:'#16805f',weight:4,dashArray:'2 9',lineCap:'round'}).addTo(MAP);
  L.marker([s.lat,s.lng],{icon:mkIcon(`<div class="mk" style="background:${s.bg}"><i>${s.em}</i></div>`)}).addTo(MAP);
  L.marker([c.lat,c.lng],{icon:mkIcon('<div class="mk" style="background:#fff"><i>🏠</i></div>')}).addTo(MAP);
  if(o.status!=='delivered')L.marker([s.lat+(c.lat-s.lat)*p,s.lng+(c.lng-s.lng)*p],{icon:mkIcon('<div style="font-size:30px;line-height:30px;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4))">🛵</div>',30)}).addTo(MAP)}}
function render(){const A=document.getElementById('app');
 if(MAP){try{MAP.remove()}catch(e){}MAP=null}
 if(!S.role){A.innerHTML=loginView();return}
 if(S.role==='customer'){const o=document.getElementById('scr'),t=o?o.scrollTop:0,same=A.dataset.v===S.view;
  A.innerHTML=`<div class="cs"><div class="tb"><div style="color:#fff">${logo(24)}</div><div class="dnav">${navItems()}</div><div style="display:flex;gap:8px;align-items:center">${tbtn()}<button class="ghost ib" onclick="logout()">${ic('out',16)} Logout</button></div></div><div class="phone"><div class="scr" id="scr">${phone()}</div>${drawer()}</div></div>`;
  if(same)document.getElementById('scr').scrollTop=t;A.dataset.v=S.view;initMaps();return}
 A.innerHTML=S.role==='admin'?admin():owner()}

/* ===== Real backend layer (replaces in-memory demo logic) ===== */
const TOKEN_KEY='soon-token';
let POLL=null,LASTSIG='';
async function api(path,method='GET',body){
 const h={'Content-Type':'application/json'};const t=S.token||localStorage.getItem(TOKEN_KEY);if(t)h.Authorization='Bearer '+t;
 let r;try{r=await fetch(path,{method,headers:h,body:body?JSON.stringify(body):undefined})}catch(e){throw new Error('No internet connection')}
 let d={};try{d=await r.json()}catch(e){}
 if(r.status===401&&S.role){localStorage.removeItem(TOKEN_KEY);const th=S.toast;S=fresh();S.toast='Session expired, please log in again';render();setTimeout(()=>{S.toast='';render()},2500);throw new Error('expired')}
 if(!r.ok)throw new Error(d.error||'Something went wrong');return d}
async function sync(silent){
 try{const d=await api('/api/state');
  const sig=JSON.stringify([d.shops,d.orders,d.addresses,d.user,d.wishlist]);
  S.shops=d.shops;S.orders=d.orders;S.addrs=d.addresses||[];S.wish=d.wishlist||[];if(S.addrs.length&&!S.addrs.some(x=>x.id===S.addrId))S.addrId=S.addrs[0].id;S.role=d.user.role;S.owner=d.user.shopId||S.owner;S.user=d.user;
  if(sig!==LASTSIG){LASTSIG=sig;const ae=document.activeElement;
   const typing=ae&&(ae.tagName==='INPUT'||ae.tagName==='SELECT'||ae.tagName==='TEXTAREA');
   if(!silent||!(typing||S.modal))render()}
  return true}catch(e){return false}}
function startPoll(){stopPoll();POLL=setInterval(()=>{if(S.role&&!document.hidden)sync(true)},4000)}
function stopPoll(){if(POLL){clearInterval(POLL);POLL=null}}
async function act(fn,okMsg){try{await fn();if(okMsg)S.toast=okMsg;await sync();if(okMsg){render();setTimeout(()=>{S.toast='';render()},2000)}return true}catch(e){if(e.message!=='expired'){await sync();say(e.message)}return false}}
async function enter(d){S.token=d.token;localStorage.setItem(TOKEN_KEY,d.token);S.lg={phone:'',code:'',sent:false,hint:''};S.view='home';S.cart={};S.tab='over';await sync();startPoll();if(S.role==='customer'&&navigator.geolocation&&window.isSecureContext)setTimeout(useMyLoc,400)}

async function sendOtp(){
 try{const d=await api('/api/otp/send','POST',{phone:S.lg.phone});S.lg.sent=true;S.lg.hint=d.hint;render()}catch(e){say(e.message)}}
async function login(){
 try{const d=await api('/api/otp/verify','POST',{phone:S.lg.phone,code:S.lg.code,role:S.pick});await enter(d)}catch(e){say(e.message)}}
async function regShop(){const r=S.reg,c=CATM[r.cat],a=LOC[r.area],g=r.geo;
 if(!r.name.trim()||!r.owner.trim()){say('Enter shop name and owner name');return}
 try{const d=await api('/api/shops/register','POST',{phone:S.lg.phone,code:S.lg.code,name:r.name,owner:r.owner,cats:c[1],em:c[0],bg:Math.floor(Math.random()*4),lat:g?g.lat:a.lat+(Math.random()-.5)*.012,lng:g?g.lng:a.lng+(Math.random()-.5)*.012});
  S.reg=blankReg();S.mode='login';await enter(d)}catch(e){say(e.message)}}
async function logout(){try{await api('/api/logout','POST')}catch(e){}localStorage.removeItem(TOKEN_KEY);stopPoll();LASTSIG='';S=fresh();render()}

async function checkout(){const s=sh(S.shopId),L=cartList();
 if(!L.length)return;
 try{const o=await api('/api/orders','POST',{shopId:s.id,items:L.map(c=>({id:c.it.id,q:c.q})),addressId:S.addrId});
  await sync(true);S.oid=o.id;S.from='home';S.cart={};S.view='track';render()}
 catch(e){S.cart={};S.view='shop';await sync(true);say(e.message)}}
function setStatus(id,st){act(()=>api('/api/orders/'+encodeURIComponent(id)+'/status','POST',{status:st}))}
function setOn(sid,iid,v){const it=sh(sid).items.find(x=>x.id===iid);if(!it)return;
 const on=Math.max(it.res,Math.max(0,parseInt(v)||0));
 act(()=>api('/api/items/'+iid,'PUT',{name:it.name,em:it.em,price:it.price,on}))}
async function saveM(){const m=S.modal,price=parseInt(m.price),on=parseInt(m.on);
 if(!m.name.trim()||!(price>=0)||!(on>=0)){say('Fill name, price and stock');return}
 const body={name:m.name,em:m.em,price,on};
 if(await act(()=>m.id?api('/api/items/'+m.id,'PUT',body):api('/api/items','POST',body))){S.modal=null;say(m.id?'Item updated':'Item added, customers can see it now')}}
async function delItem(){const m=S.modal;
 if(await act(()=>api('/api/items/'+m.id,'DELETE'))){S.modal=null;say('Item removed')}}
function approve(id){act(()=>api('/api/admin/shops/'+id+'/approve','POST'),'Shop approved, now visible to customers')}
function rejectShop(id){const r=document.getElementById('rr-'+id);act(()=>api('/api/admin/shops/'+id+'/reject','POST',{reason:r?r.value:'Not specified'}),'Application rejected')}
function suspend(id){act(()=>api('/api/admin/shops/'+id+'/suspend','POST'),'Shop suspended and hidden from customers')}
function resubmit(id){act(()=>api('/api/shops/resubmit','POST'))}



/* ===== Side drawer, My account, My addresses ===== */
function openDrawer(){S.drawer=true;render()}
function closeDrawer(){S.drawer=false;render()}
function nav(v){S.drawer=false;S.from='home';go(v)}
function drawer(){if(!S.drawer)return '';const u=S.user||{},n=u.name||'Add your name',ini=(u.name||'U')[0].toUpperCase();
 const act=S.orders.filter(o=>!['delivered','rejected'].includes(o.status)).length;
 const it=(e,t,f,b)=>`<a class="dri" onclick="${f}"><span>${e}</span><b>${t}</b>${b?`<em>${b}</em>`:''}</a>`;
 return `<div class="dov" onclick="closeDrawer()"></div><div class="dpn"><div class="dh"><div class="av" style="width:54px;height:54px;font-size:22px">${ini}</div><div><b class="d" style="font-size:18px">${n}</b><br><small style="color:#cfeadb">+91 ${u.phone||''}</small></div></div>
 <div class="dl">${it('🏠','Home',"nav('home')")}${it('👤','My account',"nav('account')")}${it('📍','My addresses',"nav('addr')",(S.addrs||[]).length||'')}${it('🛒','My cart',"nav('cart')",cartCount()||'')}${it('♥','My wishlist',"nav('wish')",(S.wish||[]).length||'')}${it('🧾','Order history',"nav('orders')",act?act+' active':'')}${it('📦','My last order',"lastOrder()")}${it(T==='dark'?'☀️':'🌙','Dark mode',"toggleT()")}${it('💬','Help & support',"say('Support: help@soon.app (demo)')")}</div>
 <div class="df"><a class="dri" onclick="logout()"><span>🚪</span><b>Log out</b></a><small>Soon v0.1 pilot</small></div></div>`}
function backHdr(t){return `<div class="tp"><button class="ghost" onclick="go('home')" style="font-size:20px">←</button><h2 class="d">${t}</h2></div>`}
function acctView(){const u=S.user||{};let h='';
 if(S.view==='account'){const done=S.orders.filter(o=>o.status==='delivered'),spent=done.reduce((a,o)=>a+o.total,0);
  h=backHdr('My account')+`<div class="cd" style="padding:18px"><div class="lab" style="margin-top:0">Name</div><input class="inp" id="nm" value="${u.name||''}" placeholder="Your name" oninput="S.nameDraft=this.value">
  <div class="lab">Mobile</div><input class="inp" value="+91 ${u.phone||''}" disabled>
  <button class="pri" style="width:100%;margin-top:16px;padding:14px" onclick="saveName()">Save changes</button></div>
  <div class="cd" style="padding:16px;display:flex;justify-content:space-around;text-align:center"><div><b class="d" style="font-size:22px">${S.orders.length}</b><br><small>Orders</small></div><div><b class="d" style="font-size:22px">${done.length}</b><br><small>Delivered</small></div><div><b class="d" style="font-size:22px">${inr(spent)}</b><br><small>Spent</small></div></div>`}
 else{const L=S.addrs||[],F=S.af||(S.af={label:'Home',line:'',geo:false});
  h=backHdr('My addresses')+(L.length?L.map(x=>`<div class="cd" style="padding:14px;display:flex;gap:12px;align-items:center" onclick="S.addrId=${x.id};render()"><span style="font-size:22px">${x.label==='Home'?'🏠':x.label==='Work'?'🏢':'📌'}</span><div style="flex:1"><b>${x.label}</b>${x.id===S.addrId?' <span class="pill p-in">Delivering here</span>':''}<br><small>${x.line}</small></div><button class="ghost" onclick="event.stopPropagation();delAddr(${x.id})">${ic('x',16)}</button></div>`).join(''):'<div class="emp" style="padding:30px 20px"><div style="font-size:42px">📍</div>No saved addresses yet</div>')+
  `<div class="cd" style="padding:16px"><b>Add a new address</b><div class="chips" style="padding:10px 0 0">${['Home','Work','Other'].map(l=>`<span class="chip ${F.label===l?'on':''}" onclick="S.af.label='${l}';render()">${l}</span>`).join('')}</div>
  <textarea class="inp" id="adl" rows="3" placeholder="Flat, building, street, landmark" oninput="S.af.line=this.value" style="margin-top:8px;resize:none">${F.line}</textarea>
  <button class="sec" style="width:100%;margin-top:8px" onclick="addrHere()">${F.geo?'✓ Pinned to your current location':'🎯 Pin my current location'}</button>
  <button class="pri" style="width:100%;margin-top:10px;padding:14px" onclick="saveAddr()">Save address</button></div>`}
 return h+bnav()}
async function saveName(){const n=String(S.nameDraft!=null?S.nameDraft:((S.user&&S.user.name)||'')).trim();if(n.length<2){say('Enter your name');return}
 try{await api('/api/me','PUT',{name:n});await sync(true);say('Saved')}catch(e){say(e.message)}}
function addrHere(){const i=LIVEI;if(i>=0){S.af.geo=true;S.af.lat=LOC[i].lat;S.af.lng=LOC[i].lng;render();return}
 if(!navigator.geolocation||!window.isSecureContext){say('Location needs https or localhost');return}
 navigator.geolocation.getCurrentPosition(p=>{S.af.geo=true;S.af.lat=p.coords.latitude;S.af.lng=p.coords.longitude;render()},()=>say('Could not get your location'),{timeout:12000})}
async function saveAddr(){const F=S.af;if(!F.line.trim()||F.line.trim().length<6){say('Enter a full address');return}
 try{const r=await api('/api/addresses','POST',{label:F.label,line:F.line,lat:F.geo?F.lat:null,lng:F.geo?F.lng:null});S.addrId=r.id;S.af=null;await sync(true);say('Address saved')}catch(e){say(e.message)}}
async function delAddr(id){try{await api('/api/addresses/'+id,'DELETE');await sync(true)}catch(e){say(e.message)}}


/* ===== Wishlist, cart page, last order ===== */
const isW=id=>(S.wish||[]).includes(id);
function selAddr(){const x=(S.addrs||[]).find(y=>y.id===S.addrId);return x?`${x.label==='Home'?'🏠':x.label==='Work'?'🏢':'📌'} ${x.label}, ${x.line}`:`📍 ${LOCS[S.loc]} <a style="color:var(--g);font-weight:700" onclick="go('addr')">Add address</a>`}
async function wish(id){try{const r=await api('/api/wishlist','POST',{itemId:id});S.wish=r.wished?[id].concat(S.wish||[]):(S.wish||[]).filter(x=>x!==id);render();sync(true)}catch(e){say(e.message)}}
function lastOrder(){S.drawer=false;const o=S.orders[0];if(!o){say('You have not placed an order yet');return}S.oid=o.id;S.from='home';go('track')}
function emptyCart(){return `<div class="tp"><button class="ghost" onclick="go('home')" style="font-size:20px">←</button><h2 class="d">Your cart</h2></div><div class="emp" style="padding:60px 20px"><div style="font-size:50px">🛒</div><b style="font-size:16px;color:var(--ink)">Your cart is empty</b><br>Pick a shop and add some items.<br><button class="pri" style="margin-top:16px;padding:12px 22px" onclick="go('home')">Browse shops</button></div>`+bnav()}
function wishView(){const rows=[];(S.wish||[]).forEach(id=>{for(const s of S.shops){const i=s.items.find(x=>x.id===id);if(i&&s.status==='approved'){rows.push({s,i});break}}});
 return `<div class="tp"><h2 class="d">My wishlist</h2></div>`+(rows.length?rows.map(({s,i})=>{const a=av(i);return `<div class="cd" style="padding:14px;display:flex;gap:12px;align-items:center"><div class="im2" style="background-color:${s.bg}">${i.em}</div><div style="flex:1;min-width:0"><b>${i.name}</b><br><small>${s.em} ${s.name} · ${inr(i.price)}</small><br><small style="color:${a>0?'var(--g)':'var(--dangt)'}">${a>0?(a<=5?'Only '+a+' left':'In stock'):'Out of stock'}</small></div>
  ${a>0?`<button class="pri" style="padding:9px 14px" onclick="addFrom('${s.id}','${i.id}')">Add</button>`:''}<button class="ghost" onclick="wish('${i.id}')" style="color:var(--coral)">♥</button></div>`}).join(''):'<div class="emp" style="padding:60px 20px"><div style="font-size:50px">♡</div><b style="font-size:16px;color:var(--ink)">No favourites yet</b><br>Tap the heart on any item to save it here.</div>')+bnav()}

const greeting=()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'};
/* ===== Live location ===== */
let GEOW=null,LIVEI=-1;
function placeLive(lat,lng,name){
 if(LIVEI<0){LOC.push({n:name||'Current location',lat,lng,live:true});LOCS.push(name||'Current location');LIVEI=LOC.length-1}
 else{LOC[LIVEI].lat=lat;LOC[LIVEI].lng=lng;if(name){LOC[LIVEI].n=name;LOCS[LIVEI]=name}}}
async function nameFor(lat,lng){
 try{const r=await fetch('https://nominatim.openstreetmap.org/reverse?format=json&zoom=16&lat='+lat+'&lon='+lng);const d=await r.json();const x=d.address||{};
  return x.suburb||x.neighbourhood||x.city_district||x.village||x.town||x.city||'Current location'}catch(e){return 'Current location'}}
function useMyLoc(){
 if(!navigator.geolocation){say('Location is not supported on this device');return}
 if(!window.isSecureContext){say('Location needs https or localhost');return}
 S.geoBusy=true;render();
 navigator.geolocation.getCurrentPosition(async p=>{
  const lat=p.coords.latitude,lng=p.coords.longitude;S.geoBusy=false;
  placeLive(lat,lng,await nameFor(lat,lng));S.loc=LIVEI;S.cart={};render();
  if(!S.shops.some(s=>s.status==='approved'&&dkm(s)<=RADIUS)){
   const far=Math.min(...S.shops.map(s=>dkm(s)));
   if(far>40){S.loc=0;render();say('No Soon shops near you yet. Showing the Indiranagar demo shops')}
   else say('No Soon shops within 5 km of you yet')}
  if(GEOW==null)GEOW=navigator.geolocation.watchPosition(q=>{
   const l=LOC[LIVEI];if(!l)return;
   if(hav(l.lat,l.lng,q.coords.latitude,q.coords.longitude)>0.15&&S.role==='customer'&&S.loc===LIVEI){l.lat=q.coords.latitude;l.lng=q.coords.longitude;if(!S.modal&&S.view==='home')render()}},()=>{},{enableHighAccuracy:false,maximumAge:30000})
 },e=>{S.geoBusy=false;render();say(e.code===1?'Location blocked. Allow it in your browser settings':'Could not get your location')},{enableHighAccuracy:true,timeout:12000,maximumAge:60000})}

function detectShopLoc(quiet){const R=S.reg;
 if(!navigator.geolocation||!window.isSecureContext){if(!quiet)say('Location needs https or localhost');return}
 R.geoBusy=true;render();
 navigator.geolocation.getCurrentPosition(async p=>{const lat=p.coords.latitude,lng=p.coords.longitude;R.geo={lat,lng,name:await nameFor(lat,lng)};R.geoBusy=false;render()},
  e=>{R.geoBusy=false;render();if(!quiet)say(e.code===1?'Location blocked. Allow it in browser settings':'Could not get location')},{enableHighAccuracy:true,timeout:12000})}

/* ===== Swipe navigation (touch) ===== */
(function(){let x0,y0,t0,tgt=null;
 const BACK={wish:'home',shop:'home',cart:'shop',track:null,account:'home',addr:'home'};
 document.addEventListener('touchstart',e=>{tgt=e.target.closest&&e.target.closest('#scr');if(!tgt||S.role!=='customer'||e.target.closest('.chips,.mapbox,input,select,textarea,.leaflet-container')){tgt=null;return}
  const t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=Date.now()},{passive:true});
 document.addEventListener('touchend',e=>{if(!tgt)return;const sc=tgt;tgt=null;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0,ax=Math.abs(dx),ay=Math.abs(dy);
  if(Date.now()-t0>700)return;
  if(ax>70&&ax>ay*1.6){
   const v=S.view;
   if(S.drawer){if(dx<0)closeDrawer()}
   else if(v==='home'&&dx>0)openDrawer();
   else if(v==='home'&&dx<0)go('orders');
   else if(v==='orders'&&dx>0)go('home');
   else if(dx>0&&v in BACK){go(v==='track'?(S.from||'home'):BACK[v])}}
  else if(dy>110&&ay>ax*1.6&&sc.scrollTop<=0){say('Refreshing...');sync(true)}},{passive:true})})();

/* ===== Boot ===== */
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.role)sync(true)});
(async()=>{render();if(localStorage.getItem(TOKEN_KEY)){S.token=localStorage.getItem(TOKEN_KEY);if(await sync()){startPoll();if(S.role==='customer'&&navigator.geolocation&&window.isSecureContext)setTimeout(useMyLoc,400)}else{localStorage.removeItem(TOKEN_KEY);render()}}})();
