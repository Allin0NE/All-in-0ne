// الحالة
const STATE = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  category: 'الكل',
  query: '',
  sort: 'default'
};

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

function applyConfig() {
  if (window.APP_CONFIG) {
    const { storeName, currency } = window.APP_CONFIG;
    els.storeName.textContent = storeName;
    document.title = storeName;
    if (els.currencyLabel) els.currencyLabel.textContent = currency;
    const cpy = document.getElementById('copyright');
    if (cpy) cpy.textContent = `© ${new Date().getFullYear()} ${storeName}`;
  }
}

async function loadProducts() {
  try {
    const res = await fetch('products.json?cache=' + Date.now());
    STATE.products = await res.json();
    buildCategories();
    filterAndRender();
  } catch (e) {
    els.products.innerHTML = '<p class="muted">تعذر تحميل المنتجات.</p>';
  }
}

function buildCategories() {
  const cats = Array.from(new Set(STATE.products.map(p => p.category))).filter(Boolean);
  const order = (window.APP_CONFIG?.categoryOrder) || [];
  let ordered = [];
  order.forEach(cat => { if (cats.includes(cat)) ordered.push(cat); });
  cats.forEach(cat => { if (!ordered.includes(cat)) ordered.push(cat); });

  els.categories.innerHTML = '';
  const frag = document.createDocumentFragment();

  const allBtn = document.createElement('button');
  allBtn.className = 'chip active'; allBtn.dataset.cat = 'الكل'; allBtn.textContent = 'الكل';
  frag.appendChild(allBtn);

  const icons = (window.APP_CONFIG?.categoryIcons) || {};
  ordered.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.cat = cat;
    b.textContent = (icons[cat] ? (icons[cat] + ' ') : '') + cat;
    frag.appendChild(b);
  });
  els.categories.appendChild(frag);
}

function filterAndRender() {
  let arr = [...STATE.products]()

