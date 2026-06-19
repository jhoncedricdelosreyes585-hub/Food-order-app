const BACKEND_URL = 'https://food-order-bistro.onrender.com';
const API_KEY = 'bistro-2026-x7k9';

// ── DISH ICON LIBRARY ───────────────────────────────────────
// Each is a hand-built SVG so the menu never depends on external photos.
const dishIcons = {
  salad: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="68" rx="38" ry="10" fill="#F4E4D5"/><path d="M20 60 Q22 35 50 30 Q78 35 80 60" stroke="#2D5C3F" stroke-width="3" fill="none"/><circle cx="35" cy="44" r="7" fill="#2D5C3F" opacity="0.85"/><circle cx="50" cy="38" r="8" fill="#3A7350" opacity="0.85"/><circle cx="65" cy="46" r="6" fill="#2D5C3F" opacity="0.85"/><circle cx="44" cy="54" r="5" fill="#C8753D"/><circle cx="58" cy="56" r="5" fill="#C8753D"/></svg>`,
  sandwich: `<svg viewBox="0 0 100 100" fill="none"><path d="M18 50 Q50 30 82 50 L78 62 Q50 48 22 62 Z" fill="#D9A15C"/><rect x="20" y="58" width="60" height="8" rx="3" fill="#7BA05B"/><rect x="20" y="64" width="60" height="7" rx="3" fill="#C8753D"/><path d="M18 70 Q50 86 82 70 L80 76 Q50 90 20 76 Z" fill="#E8B870"/></svg>`,
  pasta: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="62" rx="36" ry="22" fill="#FAF6EE" stroke="#E7DFCF" stroke-width="2"/><path d="M28 55 Q35 45 30 38 M40 58 Q48 46 44 35 M52 58 Q60 48 58 37 M64 55 Q70 44 66 36" stroke="#E8B870" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="38" cy="50" r="4" fill="#A32D2D" opacity="0.8"/><circle cx="58" cy="46" r="3.5" fill="#3A7350" opacity="0.8"/></svg>`,
  burger: `<svg viewBox="0 0 100 100" fill="none"><path d="M22 48 Q50 26 78 48 Z" fill="#D9A15C"/><rect x="20" y="48" width="60" height="6" rx="3" fill="#3A7350"/><rect x="20" y="55" width="60" height="9" rx="2" fill="#A45A28"/><rect x="20" y="65" width="60" height="6" rx="3" fill="#EFCB6E"/><path d="M20 72 Q50 86 80 72 L78 80 Q50 92 22 80 Z" fill="#E8B870"/></svg>`,
  wrap: `<svg viewBox="0 0 100 100" fill="none"><path d="M30 22 Q70 18 76 50 Q80 78 50 84 Q22 78 24 48 Q24 28 30 22 Z" fill="#F0DCAE"/><path d="M34 38 Q50 34 66 40 M32 50 Q50 46 68 52 M34 62 Q50 60 64 64" stroke="#3A7350" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.75"/></svg>`,
  drink: `<svg viewBox="0 0 100 100" fill="none"><path d="M34 28 H66 L60 80 Q50 86 40 80 Z" fill="#F4E4D5" stroke="#C8753D" stroke-width="2"/><rect x="38" y="40" width="24" height="32" fill="#E8924A" opacity="0.55"/><line x1="50" y1="14" x2="50" y2="46" stroke="#2D5C3F" stroke-width="3" stroke-linecap="round"/></svg>`,
};

const menuItems = [
  { id: 1, category: 'Salads', icon: 'salad', name: 'Garden Salad', description: 'Fresh greens, cherry tomatoes, cucumber, balsamic dressing.', price: 180, rating: 4.7, reviews: 120, time: '10 min' },
  { id: 2, category: 'Sandwiches', icon: 'sandwich', name: 'Grilled Chicken Sandwich', description: 'Grilled chicken, lettuce, tomato, toasted sourdough.', price: 250, rating: 4.6, reviews: 95, time: '15 min' },
  { id: 3, category: 'Pasta', icon: 'pasta', name: 'Mushroom Pasta', description: 'Creamy garlic pasta, sautéed button and shiitake mushrooms.', price: 220, rating: 4.5, reviews: 80, time: '18 min' },
  { id: 4, category: 'Burgers', icon: 'burger', name: 'Classic Cheeseburger', description: 'Beef patty, aged cheddar, pickles, secret sauce.', price: 280, rating: 4.8, reviews: 210, time: '15 min' },
  { id: 5, category: 'Wraps', icon: 'wrap', name: 'Veggie Wrap', description: 'Hummus, roasted peppers, spinach, avocado, whole wheat.', price: 195, rating: 4.4, reviews: 64, time: '10 min' },
  { id: 6, category: 'Drinks', icon: 'drink', name: 'Mango Iced Tea', description: 'House-brewed black tea, real mango syrup, served over ice.', price: 95, rating: 4.9, reviews: 150, time: '5 min' },
];

const categories = ['All', ...new Set(menuItems.map(i => i.category))];
let activeCategory = 'All';
let cart = {};

const clockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;
const starIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/></svg>`;

function renderCategories() {
  const row = document.getElementById('category-row');
  row.innerHTML = categories.map(cat => {
    const ref = cat === 'All' ? null : menuItems.find(i => i.category === cat);
    const icon = ref ? dishIcons[ref.icon] : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
    const active = cat === activeCategory ? 'active' : '';
    return `<div class="category-pill ${active}" onclick="setCategory('${cat}')">${icon}<span>${cat}</span></div>`;
  }).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderMenu();
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);
  grid.innerHTML = filtered.map(item => `
    <div class="menu-card">
      <div class="menu-card-art">
        ${dishIcons[item.icon]}
        <span class="menu-card-time">${clockIcon}${item.time}</span>
      </div>
      <div class="menu-card-body">
        <div class="item-name">${item.name}</div>
        <div class="item-rating">${starIcon} ${item.rating} · ${item.reviews} reviews</div>
        <div class="item-desc">${item.description}</div>
        <div class="menu-card-footer">
          <span class="item-price">₱${item.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${item.id}, this)" aria-label="Add ${item.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(itemId, btn) {
  const item = menuItems.find(m => m.id === itemId);
  if (!item) return;
  cart[itemId] ? cart[itemId].quantity++ : (cart[itemId] = { ...item, quantity: 1 });
  renderCart();
  if (btn) {
    btn.classList.remove('pop');
    requestAnimationFrame(() => btn.classList.add('pop'));
    setTimeout(() => btn.classList.remove('pop'), 460);
  }
}

function changeQuantity(itemId, delta) {
  if (!cart[itemId]) return;
  cart[itemId].quantity += delta;
  if (cart[itemId].quantity <= 0) delete cart[itemId];
  renderCart();
}

function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const totalRowEl = document.getElementById('cart-total-row');
  const totalEl = document.getElementById('cart-total');
  const orderBtn = document.getElementById('place-order-btn');
  const statusMsg = document.getElementById('order-status');
  const navCount = document.getElementById('nav-cart-count');
  const headerCount = document.getElementById('cart-header-count');
  const cartItems = Object.values(cart);

  statusMsg.classList.add('hidden');
  const totalCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  navCount.textContent = totalCount;
  headerCount.textContent = totalCount > 0 ? `${totalCount} item${totalCount > 1 ? 's' : ''}` : '';

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-msg">Your cart is empty. Tap a dish to add it.</p>';
    totalRowEl.classList.add('hidden');
    orderBtn.classList.add('hidden');
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cartItems.map(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-controls">
          <button onclick="changeQuantity(${item.id}, -1)" aria-label="Remove one ${item.name}">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)" aria-label="Add one ${item.name}">+</button>
        </div>
        <span class="cart-item-subtotal">₱${subtotal.toFixed(2)}</span>
      </div>`;
  }).join('');

  totalEl.textContent = `₱${total.toFixed(2)}`;
  totalRowEl.classList.remove('hidden');
  orderBtn.classList.remove('hidden');
}

function scrollToCart() {
  document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' });
}

async function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const note = document.getElementById('customer-note').value.trim();
  const cartItems = Object.values(cart);
  const statusEl = document.getElementById('order-status');
  const btn = document.getElementById('place-order-btn');
  const label = btn.querySelector('.btn-label');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) { alert('Please enter your name before placing an order.'); document.getElementById('customer-name').focus(); return; }
  if (!email || !emailPattern.test(email)) { alert('Please enter a valid email address.'); document.getElementById('customer-email').focus(); return; }
  if (cartItems.length === 0) { alert('Your cart is empty!'); return; }

  const orderData = {
    customerName: name,
    customerEmail: email,
    specialNote: note || 'None',
    items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, subtotal: i.price * i.quantity })),
    total: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    orderTime: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
  };

  btn.disabled = true;
  label.textContent = 'Sending order…';
  statusEl.className = 'status-msg hidden';

  try {
    const response = await fetch(`${BACKEND_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(orderData),
    });
    const result = await response.json();
    if (response.ok) {
      cart = {};
      renderCart();
      statusEl.textContent = `Order placed! Thank you, ${name} — check your email for confirmation.`;
      statusEl.className = 'status-msg success';
      statusEl.classList.remove('hidden');
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-email').value = '';
      document.getElementById('customer-note').value = '';
    } else {
      throw new Error(result.message || 'Server returned an error.');
    }
  } catch (err) {
    statusEl.textContent = `Order failed: ${err.message}. Please call us directly.`;
    statusEl.className = 'status-msg error';
    statusEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    label.textContent = 'Place order';
  }
}

renderCategories();
renderMenu();