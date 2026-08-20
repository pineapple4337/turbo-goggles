const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let cart = JSON.parse(localStorage.getItem("openjio-cart") || "[]");
let orders = JSON.parse(localStorage.getItem("openjio-orders") || "[]");
let selectedProduct = PRODUCTS[0].id;
let activeCategory = "All";
let selectedHub = HUBS[0].id;

const money = n => `$${n.toFixed(2)}`;
const saveState = () => { localStorage.setItem("openjio-cart", JSON.stringify(cart)); localStorage.setItem("openjio-orders", JSON.stringify(orders)); };
const product = id => PRODUCTS.find(p => p.id === id);
const cartQty = id => (cart.find(i => i.id === id) || {}).qty || 0;
const cartTotal = () => cart.reduce((a,i)=>a + product(i.id).group*i.qty,0);
const cartSavings = () => cart.reduce((a,i)=>a + (product(i.id).retail-product(i.id).group)*i.qty,0);

function progress(p){ return Math.min(100, Math.round(p.joined/p.target*100)); }
function card(p){
  const pct = progress(p), saved = p.retail-p.group;
  return `<article class="product-card" data-product="${p.id}">
    <div class="product-visual">${p.emoji}<span class="category-tag">${p.category}</span></div>
    <div class="product-info">
      <h3>${p.name}</h3><p class="unit">${p.unit}</p>
      <div class="price-row"><strong>${money(p.group)}</strong><del>${money(p.retail)}</del></div>
      <div class="save">Save ${money(saved)}</div>
      <div class="progress-label"><span>${p.joined >= p.target ? "Target reached!" : `${p.joined}/${p.target} households`}</span><span>${pct}%</span></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <p class="deadline">Closes ${p.deadline}</p>
      <button class="secondary-button view-product" data-id="${p.id}">View group buy</button>
    </div></article>`;
}
function renderProducts(){
  $("#featuredProducts").innerHTML = PRODUCTS.slice(0,3).map(card).join("");
  const cats = ["All", ...new Set(PRODUCTS.map(p=>p.category))];
  $("#filters").innerHTML = cats.map(c=>`<button class="filter ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
  $("#marketplaceProducts").innerHTML = PRODUCTS.filter(p=>activeCategory==="All"||p.category===activeCategory).map(card).join("");
}
function renderProduct(){
  const p=product(selectedProduct), pct=progress(p);
  $("#productDetail").innerHTML=`<div class="detail-layout">
    <div class="detail-visual">${p.emoji}</div>
    <div class="detail-info"><div class="category-tag">${p.category}</div><h1>${p.name}</h1><p class="detail-unit">${p.unit}</p><p class="description">${p.description}</p>
    <div class="detail-prices"><div><small>Usual price</small><del>${money(p.retail)}</del></div><div><small>OpenJio group price</small><strong>${money(p.group)}</strong></div><div class="save-box"><small>You save</small><strong>${money(p.retail-p.group)}</strong></div></div>
    <div class="group-status"><div><h3>${p.joined>=p.target?"Group target reached!":"Help unlock the group price"}</h3><p>${p.joined} of ${p.target} household commitments</p></div><div class="progress large"><span style="width:${pct}%"></span></div></div>
    <div class="quantity-box"><span>Quantity</span><div class="quantity-controls"><button data-quantity="-">−</button><strong id="detailQty">${cartQty(p.id)||1}</strong><button data-quantity="+">+</button></div><button class="primary-button" id="addProduct">Add to basket</button></div>
    <div class="collection-note">📍 Expected collection: ${p.collection} · Choose your hub at checkout.</div>
    </div></div>`;
}
function add(id, qty=1){
  const found=cart.find(i=>i.id===id);
  if(found) found.qty+=qty; else cart.push({id,qty});
  if(found && found.qty<=0) cart=cart.filter(i=>i.id!==id);
  saveState(); renderCart(); renderProduct();
}
function setQty(id,qty){ if(qty<=0) cart=cart.filter(i=>i.id!==id); else {let f=cart.find(i=>i.id===id); if(f)f.qty=qty;else cart.push({id,qty});} saveState(); renderCart(); }
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,i)=>a+i.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(i=>{const p=product(i.id);return `<div class="cart-item"><div class="cart-emoji">${p.emoji}</div><div class="cart-name"><strong>${p.name}</strong><small>${money(p.group)} each</small></div><div class="quantity-controls small"><button data-cart-minus="${p.id}">−</button><strong>${i.qty}</strong><button data-cart-plus="${p.id}">+</button></div><strong>${money(p.group*i.qty)}</strong></div>`}).join(""):`<div class="empty-state">Your basket is empty.<br><button class="text-button" data-go="marketplace">Browse group buys →</button></div>`;
  const summary=`<div><span>Subtotal</span><strong>${money(cartTotal())}</strong></div><div class="saving-line"><span>Potential savings</span><strong>${money(cartSavings())}</strong></div><div class="total"><span>Total</span><strong>${money(cartTotal())}</strong></div>`;
  $("#cartSummary").innerHTML=summary;
}
function renderCheckout(){
  $("#checkoutItems").innerHTML=cart.length?cart.map(i=>{const p=product(i.id);return `<div class="checkout-item"><span class="cart-emoji">${p.emoji}</span><div><strong>${p.name}</strong><small>${p.unit} · ${money(p.group)} each</small></div><div class="quantity-controls small"><button data-checkout-minus="${p.id}">−</button><strong>${i.qty}</strong><button data-checkout-plus="${p.id}">+</button></div><strong>${money(p.group*i.qty)}</strong></div>`}).join(""):`<div class="empty-state">Your basket is empty.</div>`;
  $("#hubOptions").innerHTML=HUBS.map(h=>`<label class="hub-option ${h.id===selectedHub?"selected":""}"><input type="radio" name="hub" value="${h.id}" ${h.id===selectedHub?"checked":""}><div><strong>${h.name}</strong><span>${h.address}</span><small>${h.hours}</small></div></label>`).join("");
  $("#checkoutSummary").innerHTML=`<div><span>Group-buy total</span><strong>${money(cartTotal())}</strong></div><div class="saving-line"><span>Potential savings</span><strong>${money(cartSavings())}</strong></div>`;
  $("#confirmOrder").disabled=!cart.length;
}
function renderOrders(){
  $("#ordersList").innerHTML=orders.length?orders.slice().reverse().map(o=>`<article class="order-card"><div><span class="status ${o.status.toLowerCase()}">${o.status}</span><h2>${o.code}</h2><p>${o.items.map(i=>`${product(i.id).name} × ${i.qty}`).join(" · ")}</p></div><div><small>COLLECT FROM</small><strong>${o.hub.name}</strong><p>${o.hub.hours}</p><small>Expected collection: 30–31 Aug 2026</small></div></article>`).join(""):`<div class="empty-state large-empty"><h2>No reservations yet.</h2><p>Join a group buy and it will appear here.</p><button class="primary-button" data-go="marketplace">Browse group buys</button></div>`;
}
function renderAdmin(){
  const total=orders.length, items=orders.reduce((a,o)=>a+o.items.reduce((b,i)=>b+i.qty,0),0), collected=orders.filter(o=>o.status==="Collected").length;
  $("#adminStats").innerHTML=`<div><span>Reservations</span><strong>${total}</strong></div><div><span>Items reserved</span><strong>${items}</strong></div><div><span>Collected</span><strong>${collected}</strong></div>`;
  $("#adminOrders").innerHTML=orders.length?orders.slice().reverse().map(o=>`<tr><td><strong>${o.code}</strong><br><small>${o.created}</small></td><td>${o.hub.name}</td><td>${o.items.map(i=>`${product(i.id).emoji} ${product(i.id).name} × ${i.qty}`).join("<br>")}</td><td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td><td><button class="text-button collect-order" data-code="${o.code}">${o.status==="Collected"?"Undo":"Mark collected"}</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty-table">No prototype reservations yet.</td></tr>`;
}
function showView(name){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===name));
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="product")renderProduct();
  if(name==="checkout")renderCheckout();
  if(name==="orders")renderOrders();
  if(name==="admin")renderAdmin();
  closeCart(); window.scrollTo({top:0,behavior:"smooth"});
}
function openCart(){ $("#cartDrawer").classList.add("open");$("#overlay").classList.add("show"); }
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show"); }

document.addEventListener("click",e=>{
  const go=e.target.closest("[data-go]"); if(go){showView(go.dataset.go); return;}
  const nav=e.target.closest("[data-view]"); if(nav){showView(nav.dataset.view);return;}
  const view=e.target.closest(".view-product"); if(view){selectedProduct=view.dataset.id;showView("product");return;}
  const filter=e.target.closest("[data-category]");if(filter){activeCategory=filter.dataset.category;renderProducts();return;}
  if(e.target.closest("#cartButton")){openCart();return;}
  if(e.target.closest("#closeCart")||e.target.id==="overlay"){closeCart();return;}
  const plus=e.target.closest("[data-cart-plus]");if(plus){add(plus.dataset.cartPlus,1);return;}
  const minus=e.target.closest("[data-cart-minus]");if(minus){add(minus.dataset.cartMinus,-1);return;}
  const cp=e.target.closest("[data-checkout-plus]");if(cp){add(cp.dataset.checkoutPlus,1);renderCheckout();return;}
  const cm=e.target.closest("[data-checkout-minus]");if(cm){add(cm.dataset.checkoutMinus,-1);renderCheckout();return;}
  if(e.target.closest("#checkoutButton")){if(cart.length)showView("checkout");return;}
  if(e.target.closest("#addProduct")){
    const qty=Number($("#detailQty").textContent); add(selectedProduct,qty); openCart();return;
  }
  const qb=e.target.closest("[data-quantity]");if(qb){
    const el=$("#detailQty");el.textContent=Math.max(1,Number(el.textContent)+(qb.dataset.quantity==="+"?1:-1));return;
  }
  const collect=e.target.closest(".collect-order");if(collect){const o=orders.find(x=>x.code===collect.dataset.code);o.status=o.status==="Collected"?"Ready":"Collected";saveState();renderAdmin();renderOrders();return;}
  if(e.target.closest("#resetDemo")){if(confirm("Reset all prototype cart and order data?")){cart=[];orders=[];saveState();renderCart();renderAdmin();renderOrders();}return;}
});
document.addEventListener("change",e=>{if(e.target.name==="hub"){selectedHub=e.target.value;renderCheckout();}});
$("#confirmOrder").addEventListener("click",()=>{
  if(!cart.length)return;
  const hub=HUBS.find(h=>h.id===selectedHub);
  const code="OJ-"+Math.floor(1000+Math.random()*9000);
  orders.push({code,items:JSON.parse(JSON.stringify(cart)),hub,status:"Ready",created:new Date().toLocaleDateString("en-GB")});
  cart=[];saveState();renderCart();
  $("#orderCode").textContent=code;
  $("#confirmationText").textContent=`Your reservation has been recorded. Collect your order from ${hub.name} during the collection window shown in My Orders.`;
  showView("confirmation");
});

renderProducts();renderCart();renderOrders();renderAdmin();
