
const PRODUCTS = [
  {id:'p1',name:'Zaizah Rose Essence',price:2500,desc:'Notas florais com toque de baunilha.',img:'assets/produtos/perfume1.jpg'},
  {id:'p2',name:'Golden Oud',price:3200,desc:'Aroma intenso e sofisticado.',img:'assets/produtos/perfume2.jpg'},
  {id:'p3',name:'Ocean Mist',price:2000,desc:'Fresco e leve, perfeito para o dia a dia.',img:'assets/produtos/perfume3.jpg'}
];

function currency(mzn){ return new Intl.NumberFormat('pt-MZ',{style:'currency',currency:'MZN'}).format(mzn); }

function renderProducts(){
  const grid = document.getElementById('prod-grid');
  if(!grid) return;
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="card-body">
        <h3 style="margin:0 0 8px">${p.name}</h3>
        <p style="margin:0 0 10px;color:#cfcfcf">${p.desc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="price">${currency(p.price)}</div>
          <button class="btn-cta" data-id="${p.id}">Adicionar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  document.querySelectorAll('.btn-cta[data-id]').forEach(b=>{
    b.addEventListener('click', e=>{
      addToCart(e.currentTarget.dataset.id);
    });
  });
}

function getCart(){ return JSON.parse(localStorage.getItem('zaizah_cart')||'[]'); }
function saveCart(c){ localStorage.setItem('zaizah_cart', JSON.stringify(c)); updateCartCount(); }
function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  const cart = getCart();
  const item = cart.find(i=>i.id===id);
  if(item) item.q++; else cart.push({id:prod.id,name:prod.name,price:prod.price,q:1});
  saveCart(cart);
  toast('Adicionado ao carrinho');
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.q,0);
  const el = document.getElementById('cart-count');
  if(el) el.textContent = count;
}

function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg; el.style.position='fixed'; el.style.right='20px'; el.style.bottom='20px'; el.style.background='#111';
  el.style.color='#fff'; el.style.padding='10px 14px'; el.style.borderRadius='8px'; el.style.boxShadow='0 8px 20px rgba(0,0,0,0.4)';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

// M-Pesa call from frontend to server (STK Push)
async function mpesaPay(phone,amount){
  const resp = await fetch('/api/mpesa/stkpush',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone,amount})});
  return resp.json();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  updateCartCount();
});
