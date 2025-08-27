// ======================
// script.js (نسخة كاملة)
// ======================

// الحالة العامة
const STATE = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  category: 'الكل',
  query: '',
  sort: 'default'
};

// عناصر DOM
const els = {
  products: document.getElementById('products'),
  categories: document.getElementById('categories'),
  search: document.getElementById('searchInput'),
  sort: document.getElementById('sortSelect'),
  cartBtn: document.getElementById('cartBtn'),
  cartDrawer: document.getElementById('cartDrawer'),
  closeCart: document.getElementById('closeCart'),
  cartItems: document.getElementById('cartItems'),
  cartCount: document.getElementById('cartCount'),
  cartTotal: document.getElementById('cartTotal'),
  overlay: document.getElementById('overlay'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  checkoutDialog: document.getElementById('checkoutDialog'),
  cancelCheckout: document.getElementById('cancelCheckout'),
  checkoutForm: document.getElementById('checkoutForm'),
  name: document.getElementById('custName'),
  phone: document.getElementById('custPhone'),
  address: document.getElementById('custAddress'),
  note: document.getElementById('custNote'),
  storeName: document.getElementById('storeName'),
  currencyLabel: document.getElementById('currencyLabel'),
  subcats: document.getElementById('subcats'),
  checkoutMsg: document.getElementById('checkoutMsg')
};

// ===============
// إعدادات عامة
// ===============
function applyConfig() {
  if (window.APP_CONFIG) {
    const { storeName, currency } = window.APP_CONFIG;
    if (els.storeName) els.storeName.textContent = storeName;
    document.title = storeName || document.title;
    if (els.currencyLabel) els.currencyLabel.textContent = currency || 'EGP';
    const cpy = document.getElementById('copyright');
    if (cpy) cpy.textContent = `© ${new Date().getFullYear()} ${storeName || ''}`;
  }
}

// ======================
// تحميل المنتجات من JSON
// ======================
async function loadProducts() {
  try {
    const res = await fetch('products.json?cache=' + Date.now());
    STATE.products = await res.json();
    buildCategories();
    filterAndRender();
  } catch (e) {
    if (els.products) els.products.innerHTML = '<p class="muted">تعذر تحميل المنتجات.</p>';
    console.error('loadProducts error:', e);
  }
}

// ======================
// بناء أقسام الفلاتر
// ======================
function buildCategories() {
  const cats = Array.from(new Set(STATE.products.map(p => p.category))).filter(Boolean);
  const order = (window.APP_CONFIG?.categoryOrder) || [];
  let ordered = [];
  order.forEach(cat => { if (cats.includes(cat)) ordered.push(cat); });
  cats.forEach(cat => { if (!ordered.includes(cat)) ordered.push(cat); });

  if (!els.categories) return;
  els.categories.innerHTML = '';
  const frag = document.createDocumentFragment();

  // زر الكل
  const allBtn = document.createElement('button');
  allBtn.className = 'chip active';
  allBtn.dataset.cat = 'الكل';
  allBtn.textContent = 'الكل';
  frag.appendChild(allBtn);

  const icons = (window.APP_CONFIG?.categoryIcons) || {};
  ordered.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.dataset.cat = cat;
    b.textContent = (icons[cat] ? (icons[cat] + ' ') : '') + cat;
    frag.appendChild(b);
  });

  els.categories.appendChild(frag);
}

// ======================
// فلاتر + ترتيب + عرض
// ======================
function filterAndRender() {
  let arr = [...STATE.products];

  if (STATE.query.trim() !== '') {
    const q = STATE.query.toLowerCase();
    arr = arr.filter(p =>
      (p.name + ' ' + (p.description || '') + ' ' + (p.subcategory || ''))
        .toLowerCase()
        .includes(q)
    );
  }
  if (STATE.category !== 'الكل') {
    arr = arr.filter(p => p.category === STATE.category);
  }

  switch (STATE.sort) {
    case 'price_asc': arr.sort((a, b) => a.price - b.price); break;
    case 'price_desc': arr.sort((a, b) => b.price - a.price); break;
    case 'name_asc': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name_desc': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
  }

  renderProducts(arr);

  // أزرار فرعية للملابس
  if (!els.subcats) return;
  els.subcats.innerHTML = '';
  if (STATE.category === 'ملابس') {
    ['رجالي','حريمي'].forEach(sub => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = sub;
      b.onclick = () => {
        const filtered = STATE.products.filter(p => p.category === 'ملابس' && p.subcategory === sub);
        renderProducts(filtered);
      };
      els.subcats.appendChild(b);
    });
  }
}

// ======================
// توليد صورة Placeholder
// ======================
function svgPlaceholder(text){
  const label = (text || "منتج").slice(0, 22);
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#0b1226'/>
        <stop offset='100%' stop-color='#0a1020'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='300' cy='240' r='80' fill='#111827' />
    <text x='50%' y='65%' text-anchor='middle' font-family='Arial' font-size='28' fill='#e5e7eb'>${label}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function imgOnError(el, name){
  el.onerror = null;
  el.src = svgPlaceholder(name || "صورة غير متاحة");
}

// ======================
// دالة العرض بالـ Placeholder
// ======================
function renderProducts(arr) {
  if (!els.products) return;

  els.products.innerHTML = arr.map(p => {
    const imgSrc = (p.image && p.image.trim()) ? p.image : svgPlaceholder(p.name);
    const safeName = escapeHtml(p.name || 'منتج');
    const safeCat = escapeHtml(p.category || '');
    const safeSub = p.subcategory ? (' — ' + escapeHtml(p.subcategory)) : '';
    const safeDesc = escapeHtml(p.description || '');

    return `
      <article class="card">
        <img class="thumb"
             src="${imgSrc}"
             alt="${safeName}"
             onerror="imgOnError(this, '${(p.name||'منتج').replace(/'/g, "\\'")}')">
        <div class="body">
          <h3 style="margin:0">${safeName}</h3>
          <div class="muted small">${safeCat}${safeSub}</div>
          <div class="price">${formatPrice(p.price)}</div>
          <p class="muted small">${safeDesc}</p>
          <div class="actions">
            <button class="btn" onclick="showProduct('${p.id}')">تفاصيل</button>
            <button class="btn primary" onclick="addToCart('${p.id}')">إضافة للسلة</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ==============
// أدوات مساعدة
// ==============
function escapeHtml(str='') {
  return str.replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

function formatPrice(num) {
  const c = (window.APP_CONFIG?.currency) || 'EGP';
  try {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: c }).format(num);
  } catch {
    return Number(num).toFixed(2) + ' ' + c;
  }
}

function showProduct(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;
  alert(
    (p.name || 'منتج') + "\n\n" +
    (p.description || '') + "\n\n" +
    "السعر: " + formatPrice(p.price)
  );
}

// ====== السلة ======
function saveCart() { localStorage.setItem('cart', JSON.stringify(STATE.cart)); }
function cartCount() { return STATE.cart.reduce((s, it) => s + it.qty, 0); }
function cartTotal() {
  return STATE.cart.reduce((s, it) => {
    const p = STATE.products.find(x => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);
}
function updateCartUI() {
  if (els.cartCount) els.cartCount.textContent = cartCount();
  if (els.cartTotal) els.cartTotal.textContent = cartTotal().toFixed(2);

  if (!els.cartItems) return;
  if (!STATE.cart.length) {
    els.cartItems.innerHTML = '<p class="muted small">السلة فارغة.</p>';
    return;
  }
  els.cartItems.innerHTML = STATE.cart.map(it => {
    const p = STATE.products.find(x => x.id === it.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <img src="${(p.image && p.image.trim()) ? p.image : svgPlaceholder(p.name)}" alt="${escapeHtml(p.name||'')}"
             onerror="imgOnError(this, '${(p.name||'منتج').replace(/'/g, "\\'")}')" />
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:.5rem;">
            <strong>${escapeHtml(p.name||'منتج')}</strong>
            <button class="remove" onclick="removeFromCart('${p.id}')">حذف</button>
          </div>
          <div class="muted small">${formatPrice(p.price)}</div>
          <div class="qty">
            <button onclick="changeQty('${p.id}', 1)">＋</button>
            <span>${it.qty}</span>
            <button onclick="changeQty('${p.id}', -1)">－</button>
          </div>
        </div>
        <div class="muted small">${formatPrice(p.price * it.qty)}</div>
      </div>
    `;
  }).join('');
}
function addToCart(id){
  const item = STATE.cart.find(x => x.id === id);
  if (item) item.qty += 1; else STATE.cart.push({id, qty: 1});
  updateCartUI(); openCart(); saveCart();
}
function removeFromCart(id){
  STATE.cart = STATE.cart.filter(x => x.id !== id);
  updateCartUI(); saveCart();
}
function changeQty(id, delta){
  const it = STATE.cart.find(x => x.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) return removeFromCart(id);
  updateCartUI(); saveCart();
}

// ===== السلة (UI) =====
function openCart(){ if(els.cartDrawer){ els.cartDrawer.classList.add('open'); els.overlay?.classList.add('show'); } }
function closeCart(){ if(els.cartDrawer){ els.cartDrawer.classList.remove('open'); els.overlay?.classList.remove('show'); } }
els.cartBtn?.addEventListener('click', openCart);
els.closeCart?.addEventListener('click', closeCart);
els.overlay?.addEventListener('click', closeCart);

// ========== حفظ الطلب في Firestore ==========
async function saveOrderToFirestore(order){
  const db = firebase.firestore();
  await db.collection('orders').add(order);
}

function handleCheckout() {
  if (!STATE.cart.length) { alert('السلة فارغة'); return; }
  els.checkoutDialog?.showModal();
}
function cancelCheckout(){ els.checkoutDialog?.close(); }
function submitCheckout(e){
  e.preventDefault();
  const items = STATE.cart.map(it => {
    const p = STATE.products.find(x => x.id === it.id);
    return { id: it.id, name: p?.name || '', price: p?.price || 0, qty: it.qty, total: Number((p?.price||0) * it.qty).toFixed(2) };
  });
  const order = {
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    total: Number(cartTotal().toFixed(2)),
    items,
    customer: {
      name: els.name?.value || '',
      phone: els.phone?.value || '',
      address: els.address?.value || '',
      note: els.note?.value || ''
    }
  };
  if (els.checkoutMsg) els.checkoutMsg.textContent = '... جاري الحفظ';
  saveOrderToFirestore(order).then(() => {
    if (els.checkoutMsg) els.checkoutMsg.textContent = 'تم حفظ الطلب. شكرًا!';
    els.checkoutDialog?.close();
    STATE.cart = []; saveCart(); updateCartUI();
  }).catch(err => {
    if (els.checkoutMsg) els.checkoutMsg.textContent = 'حدث خطأ أثناء الحفظ';
    console.error(err);
  });
}

// أحداث عامة
function initEvents() {
  els.search?.addEventListener('input', (e) => { STATE.query = e.target.value; filterAndRender(); });
  els.sort?.addEventListener('change', (e) => { STATE.sort = e.target.value; filterAndRender(); });
  els.categories?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cat]'); if (!b) return;
    els.categories.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    b.classList.add('active');
    STATE.category = b.dataset.cat; filterAndRender();
  });
  els.checkoutBtn?.addEventListener('click', handleCheckout);
  els.cancelCheckout?.addEventListener('click', cancelCheckout);
  els.checkoutForm?.addEventListener('submit', submitCheckout);
}

// تشغيل
applyConfig();
loadProducts();
initEvents();
updateCartUI();

