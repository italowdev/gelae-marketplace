const categories = [
  ["Cervejas","🍺"],["Destilados","🥃"],["Refrigerantes","🥤"],["Energéticos","⚡"],
  ["Águas","💧"],["Sucos","🧃"],["Gelos","🧊"],["Drinks prontos","🍹"]
];
const stores = [
  {id:1,name:"Depósito Central",description:"Bebidas geladas e variedade para todos os momentos.",address:"Centro",fee:6,eta:"25 a 40 min",rating:"4,8",open:true,emoji:"🏪"},
  {id:2,name:"Adega do Bairro",description:"Seu depósito de confiança, pertinho de você.",address:"Bairro Novo",fee:5,eta:"30 a 45 min",rating:"4,7",open:true,emoji:"🍻"},
  {id:3,name:"Distribuidora Avenida",description:"Preço bom e variedade para sua comemoração.",address:"Avenida principal",fee:7,eta:"35 a 50 min",rating:"4,9",open:false,emoji:"🛒"}
];
const products = [
  {id:101,storeId:1,name:"Heineken",volume:"Long neck 330ml",category:"Cervejas",price:6.99,emoji:"🍺",tag:"Mais pedido"},
  {id:102,storeId:1,name:"Brahma Duplo Malte",volume:"Lata 350ml",category:"Cervejas",price:4.49,emoji:"🍺"},
  {id:103,storeId:1,name:"Skol",volume:"Lata 350ml",category:"Cervejas",price:3.99,emoji:"🍺"},
  {id:104,storeId:1,name:"Vodka Smirnoff",volume:"Garrafa 998ml",category:"Destilados",price:59.90,emoji:"🥃"},
  {id:105,storeId:1,name:"Whisky Red Label",volume:"Garrafa 1L",category:"Destilados",price:119.90,emoji:"🥃"},
  {id:106,storeId:1,name:"Coca-Cola",volume:"Garrafa 2L",category:"Refrigerantes",price:11.99,emoji:"🥤"},
  {id:107,storeId:1,name:"Red Bull",volume:"Lata 250ml",category:"Energéticos",price:9.99,emoji:"⚡"},
  {id:108,storeId:1,name:"Água mineral",volume:"Garrafa 1,5L",category:"Águas",price:3.99,emoji:"💧"},
  {id:109,storeId:1,name:"Gelo em cubos",volume:"Pacote 3kg",category:"Gelos",price:12.00,emoji:"🧊"},
  {id:201,storeId:2,name:"Amstel",volume:"Lata 350ml",category:"Cervejas",price:4.29,emoji:"🍺"},
  {id:202,storeId:2,name:"Original",volume:"Lata 350ml",category:"Cervejas",price:5.49,emoji:"🍺"},
  {id:203,storeId:2,name:"Vodka Absolut",volume:"Garrafa 1L",category:"Destilados",price:89.90,emoji:"🥃"},
  {id:204,storeId:2,name:"Guaraná Antarctica",volume:"Garrafa 2L",category:"Refrigerantes",price:9.99,emoji:"🥤"},
  {id:205,storeId:2,name:"Suco de laranja",volume:"Garrafa 1L",category:"Sucos",price:8.50,emoji:"🧃"}
];
const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let cart = JSON.parse(localStorage.getItem("gelae-cart") || "[]");
let orders = JSON.parse(localStorage.getItem("gelae-orders") || "[]");
let activeStore = 1;
let activeCategory = "Todas";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function save(){localStorage.setItem("gelae-cart",JSON.stringify(cart));localStorage.setItem("gelae-orders",JSON.stringify(orders));}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600);}
function showView(name){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
  $$(".nav-link,.mobile-nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="orders")renderOrders();
  if(name==="stores")renderStores("#allStoreGrid");
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderCategories(){
  $("#categoryGrid").innerHTML=categories.map(([name,emoji])=>`<button class="category-card ${activeCategory===name?"selected":""}" data-category="${name}"><span class="emoji">${emoji}</span><b>${name}</b></button>`).join("");
  $$("#categoryGrid [data-category]").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;renderCategories();showStore(activeStore,activeCategory);});
}
function storeCard(s){return `<article class="store-card" data-store="${s.id}"><div class="store-photo">${s.emoji}</div><div class="store-info"><h3>${s.name}</h3><p>${s.description}</p><div class="store-meta"><span class="${s.open?"open-dot":"muted"}">● ${s.open?"Aberto agora":"Fechado"}</span><span>★ ${s.rating}</span><span>⌁ ${s.eta}</span></div></div></article>`;}
function renderStores(target="#storeGrid"){
  $(target).innerHTML=stores.map(storeCard).join("");
  $$(`${target} [data-store]`).forEach(el=>el.onclick=()=>showStore(Number(el.dataset.store)));
}
function productCard(p){
  const s=stores.find(x=>x.id===p.storeId);
  return `<article class="product-card"><div class="product-image">${p.emoji}</div><h3>${p.name}</h3><p>${p.volume}</p><div class="product-bottom"><strong>${money(p.price)}</strong><button class="add-btn" data-add="${p.id}" aria-label="Adicionar ${p.name}">+</button></div><div class="product-store">${s?.name||""}</div></article>`;
}
function renderFeatured(){
  const list=products.filter(p=>p.storeId===1).slice(0,4);
  $("#featuredGrid").innerHTML=list.map(productCard).join("");
  bindAddButtons();
}
function showStore(id,category="Todas"){
  activeStore=id;activeCategory=category;
  const s=stores.find(x=>x.id===id);
  const list=products.filter(p=>p.storeId===id&&(category==="Todas"||p.category===category));
  $("#storeDetail").innerHTML=`<div class="store-detail-head"><p class="eyebrow">DEPÓSITO PARCEIRO</p><h1>${s.name}</h1><p>${s.description}</p><div class="store-meta"><span class="${s.open?"open-dot":""}">● ${s.open?"Aberto agora":"Fechado"}</span><span>★ ${s.rating}</span><span>Entrega: ${s.eta}</span><span>Taxa: ${money(s.fee)}</span></div></div><div class="section-heading"><div><p class="eyebrow">ESCOLHA SEUS PRODUTOS</p><h2>Catálogo do depósito</h2></div><span class="pill">${list.length} produtos demonstrativos</span></div><div class="category-grid compact">${["Todas",...categories.map(c=>c[0])].map(c=>`<button class="category-card ${category===c?"selected":""}" data-filter="${c}"><b>${c}</b></button>`).join("")}</div><div class="product-grid store-products">${list.length?list.map(productCard).join(""):"<div class='empty-state'>Nenhum produto nesta categoria.</div>"}</div><p class="tiny muted">Cada depósito poderá cadastrar até 30 produtos ativos na plataforma.</p>`;
  $("#storeDetail").querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>showStore(id,b.dataset.filter));
  bindAddButtons();showView("store");
}
function bindAddButtons(){
  $$("[data-add]").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
}
function addToCart(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  if(cart.length && cart[0].storeId!==p.storeId){toast("Seu carrinho já tem itens de outro depósito. Finalize ou esvazie o carrinho primeiro.");return;}
  const item=cart.find(x=>x.id===id);if(item)item.quantity++;else cart.push({...p,quantity:1});
  save();renderCart();toast(`${p.name} adicionado ao carrinho!`);
}
function cartSubtotal(){return cart.reduce((sum,p)=>sum+p.price*p.quantity,0);}
function currentFee(){return cart.length?(stores.find(s=>s.id===cart[0].storeId)?.fee||0):0;}
function renderCart(){
  const count=cart.reduce((a,p)=>a+p.quantity,0);
  $("#cartCount").textContent=count;$("#drawerCount").textContent=`${count} ${count===1?"item":"itens"}`;
  $("#cartStoreNote").textContent=cart.length?`Pedido do ${stores.find(s=>s.id===cart[0].storeId)?.name}`:"Adicione produtos de um depósito para começar.";
  $("#cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-line"><div class="mini-product">${p.emoji}</div><div class="cart-line-main"><b>${p.name}</b><small>${p.volume}</small><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><b>${p.quantity}</b><button data-qty="${p.id}" data-delta="1">+</button></div></div><div class="cart-line-price">${money(p.price*p.quantity)}</div></div>`).join(""):`<div class="empty-state"><span>🛒</span>Seu carrinho está vazio.<br>Que tal escolher uma bebida?</div>`;
  $("#cartBottom").innerHTML=cart.length?`<div class="total-row"><span>Subtotal</span><b>${money(cartSubtotal())}</b></div><div class="total-row"><span>Entrega</span><b>${money(currentFee())}</b></div><div class="total-row total"><span>Total</span><span>${money(cartSubtotal()+currentFee())}</span></div><button class="btn btn-primary full" id="goCheckout">Continuar para entrega →</button>`:"";
  $$("[data-qty]").forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.qty),Number(b.dataset.delta)));
  $("#goCheckout")?.addEventListener("click",openCheckout);
}
function changeQty(id,delta){const p=cart.find(x=>x.id===id);if(!p)return;p.quantity+=delta;if(p.quantity<=0)cart=cart.filter(x=>x.id!==id);save();renderCart();}
function openCart(){renderCart();$("#cartDrawer").classList.add("open");$("#drawerBackdrop").classList.add("show");}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#drawerBackdrop").classList.remove("show");}
function openCheckout(){
  if(!cart.length)return;
  closeCart();
  $("#checkoutSummary").innerHTML=`<div class="total-row"><span>Produtos</span><b>${money(cartSubtotal())}</b></div><div class="total-row"><span>Entrega</span><b>${money(currentFee())}</b></div><div class="total-row total"><span>Total</span><span>${money(cartSubtotal()+currentFee())}</span></div>`;
  $("#checkoutBackdrop").classList.add("show");
}
function closeCheckout(){$("#checkoutBackdrop").classList.remove("show");}
function renderOrders(){
  $("#ordersList").innerHTML=orders.length?orders.map(o=>`<article class="order-card"><div class="order-card-head"><div><h3>Pedido #${o.id}</h3><p>${o.storeName} • ${o.date}</p></div><span class="pill green">${o.status}</span></div><p>${o.items} produto(s) • ${money(o.total)}</p><div class="status-track">${[0,1,2,3].map(i=>`<span class="status-step ${i<=o.step?"done":""}"></span>`).join("")}</div></article>`).join(""):`<div class="empty-state"><span>📦</span>Você ainda não fez nenhum pedido.<br>Seus pedidos aparecerão aqui.</div>`;
}
function renderAdmin(){
  $("#adminOrders").innerHTML=(orders.length?orders.slice(0,5).map(o=>`<div class="admin-row"><b>#${o.id} • ${o.customer}</b><span>${o.status}</span><strong>${money(o.total)}</strong></div>`):`<p class="muted">Os pedidos recebidos aparecerão aqui.</p>`);
}
function renderSearch(term){
  const found=products.filter(p=>(p.name+" "+p.category+" "+p.volume).toLowerCase().includes(term.toLowerCase()));
  if(!term.trim()){renderFeatured();return;}
  $("#featuredGrid").innerHTML=found.length?found.map(productCard).join(""):`<div class="empty-state">Não encontramos produtos com esse nome.</div>`;
  bindAddButtons();
}
function init(){
  renderCategories();renderStores();renderFeatured();renderCart();renderOrders();renderAdmin();
  $$(".nav-link,.mobile-nav button,[data-view],.brand").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();const v=b.dataset.view;if(v)showView(v);}));
  $("#ageYes").onclick=()=>{$("#ageGate").classList.add("hidden");localStorage.setItem("gelae-age-confirmed","yes");};
  $("#ageNo").onclick=()=>{$(".age-card").innerHTML="<div class='brand-mark'>G!</div><h1>Acesso não permitido</h1><p>Esta plataforma é destinada a maiores de 18 anos quando houver oferta de bebidas alcoólicas.</p>";};
  if(localStorage.getItem("gelae-age-confirmed")==="yes")$("#ageGate").classList.add("hidden");
  $("#openCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#drawerBackdrop").onclick=closeCart;
  $("#closeCheckout").onclick=closeCheckout;$("#checkoutBackdrop").addEventListener("click",e=>{if(e.target.id==="checkoutBackdrop")closeCheckout();});
  $("#searchInput").addEventListener("input",e=>renderSearch(e.target.value));
  $("#searchFocus").onclick=()=>$("#searchInput").focus();
  $("#heroExplore").onclick=()=>$("#searchInput").focus();
  $("#allCategories").onclick=()=>toast("Escolha uma categoria para filtrar os produtos.");
  $("#checkoutForm").onsubmit=e=>{
    e.preventDefault();if(!cart.length)return;
    const data=new FormData(e.target);
    const store=stores.find(s=>s.id===cart[0].storeId);
    const order={id:Math.floor(10000+Math.random()*89999),storeName:store.name,customer:data.get("name"),address:data.get("address"),payment:data.get("payment"),items:cart.reduce((a,p)=>a+p.quantity,0),total:cartSubtotal()+currentFee(),status:"Pedido recebido",step:0,date:new Date().toLocaleString("pt-BR")};
    orders.unshift(order);cart=[];save();renderCart();renderOrders();renderAdmin();closeCheckout();showView("orders");toast("Pedido registrado na demonstração!");
    e.target.reset();
  };
}
init();
