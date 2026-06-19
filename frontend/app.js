// ─────────────────────────────────────────────────────────────
const BACKEND_URL = 'https://food-order-bistro.onrender.com';
const API_KEY = 'bistro-2026-x7k9';

// ── MENU DATA ─────────────────────────────────────────────────
// Each item supports an "icon" (emoji) by default.
// To use a real photo instead, add an "image" field with a URL —
// the card will use the photo automatically if present.
const menuItems = [
  {
    id: 1,
    category: 'Salads',
    icon: '🥗',
    name: 'Garden Salad',
    description: 'Fresh greens, cherry tomatoes, cucumber, and balsamic dressing.',
    price: 180,
    rating: 4.7,
    reviews: 120,
    time: '10 Mins',
  },
  {
    id: 2,
    category: 'Sandwiches',
    icon: '🥪',
    name: 'Grilled Chicken Sandwich',
    description: 'Juicy grilled chicken breast, lettuce, tomato on toasted sourdough.',
    price: 250,
    rating: 4.6,
    reviews: 95,
    time: '15 Mins',
  },
  {
    id: 3,
    category: 'Pasta',
    icon: '🍝',
    name: 'Mushroom Pasta',
    description: 'Creamy garlic pasta with sautéed button and shiitake mushrooms.',
    price: 220,
    rating: 4.5,
    reviews: 80,
    time: '18 Mins',
  },
  {
    id: 4,
    category: 'Burgers',
    icon: '🍔',
    name: 'Classic Cheeseburger',
    description: 'Beef patty, aged cheddar, pickles, onions, and our secret sauce.',
    price: 280,
    rating: 4.8,
    reviews: 210,
    time: '15 Mins',
  },
  {
    id: 5,
    category: 'Wraps',
    icon: '🌯',
    name: 'Veggie Wrap',
    description: 'Hummus, roasted peppers, spinach, and avocado in a whole wheat wrap.',
    price: 195,
    rating: 4.4,
    reviews: 64,
    time: '10 Mins',
  },
  {
    id: 6,
    category: 'Drinks',
    icon: '🧊',
    name: 'Mango Iced Tea',
    description: 'House-brewed black tea with real mango syrup, served over ice.',
    price: 95,
    rating: 4.9,
    reviews: 150,
    time: '5 Mins',
  },
];

// Build the category list automatically from menu items
const categories = ['All', ...new Set(menuItems.map(item => item.category))];
let activeCategory = 'All';

// ── CART STATE ────────────────────────────────────────────────
let cart = {};

// ── RENDER CATEGORY PILLS ────────────────────────────────────
function renderCategories() {
  const row = document.getElementById('category-row');
  row.innerHTML = categories.map(cat => {
    const icon = cat === 'All' ? '🍽️' : (menuItems.find(i => i.category === cat)?.icon || '🍽️');
    const activeClass = cat === activeCategory ? 'active' : '';
    return `
      <div class="category-pill ${activeClass}" onclick="setCategory('${cat}')">
        <span class="category-icon">${icon}</span>
        <span class="category-label">${cat}</span>
      </div>
    `;
  }).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderMenu();
}

// ── RENDER MENU ───────────────────────────────────────────────
function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  grid.innerHTML = filtered.map(item => `
    <div class="menu-card">
      <div class="menu-card-img" style="${item.image ? `background-image:url('${item.image}');background-size:cover;background-position:center;` : ''}">
        ${item.image ? '' : item.icon}
        <span class="menu-card-time">⏱ ${item.time}</span>
      </div>
      <div class="menu-card-body">
        <div class="item-name">${item.name}</div>
        <div class="item-rating"><span class="stars">★</span> ${item.rating} (${item.reviews})</div>
        <div class="item-desc">${item.description}</div>
        <div class="menu-card-footer">
          <span class="item-price">₱${item.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${item.id})" aria-label="Add ${item.name}">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── CART FUNCTIONS ────────────────────────────────────────────
function addToCart(itemId) {
  const item = menuItems.find(m => m.id === itemId);
  if (!item) return;

  if (cart[itemId]) {
    cart[itemId].quantity += 1;
  } else {
    cart[itemId] = { ...item, quantity: 1 };
  }
  renderCart();
}

function changeQuantity(itemId, delta) {
  if (!cart[itemId]) return;
  cart[itemId].quantity += delta;
  if (cart[itemId].quantity <= 0) delete cart[itemId];
  renderCart();
}

function renderCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const totalRowEl  = document.getElementById('cart-total-row');
  const totalEl     = document.getElementById('cart-total');
  const orderBtn    = document.getElementById('place-order-btn');
  const statusMsg   = document.getElementById('order-status');
  const navCount    = document.getElementById('nav-cart-count');
  const cartItems   = Object.values(cart);

  statusMsg.classList.add('hidden');

  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  navCount.textContent = totalCount;

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-msg">Your cart is empty. Add items from the menu!</p>';
    totalRowEl.classList.add('hidden');
    orderBtn.classList.add('hidden');
    return;
  }

  let html = '';
  let total = 0;

  cartItems.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    html += `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-controls">
          <button onclick="changeQuantity(${item.id}, -1)" aria-label="Remove one ${item.name}">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)" aria-label="Add one ${item.name}">+</button>
        </div>
        <span class="cart-item-subtotal">₱${subtotal.toFixed(2)}</span>
      </div>
    `;
  });

  cartItemsEl.innerHTML = html;
  totalEl.textContent = `₱${total.toFixed(2)}`;
  totalRowEl.classList.remove('hidden');
  orderBtn.classList.remove('hidden');
}

function scrollToCart() {
  document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' });
}

// ── PLACE ORDER ───────────────────────────────────────────────
async function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const note = document.getElementById('customer-note').value.trim();
  const cartItems = Object.values(cart);
  const statusEl = document.getElementById('order-status');
  const btn = document.getElementById('place-order-btn');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    alert('Please enter your name before placing an order.');
    document.getElementById('customer-name').focus();
    return;
  }
  if (!email || !emailPattern.test(email)) {
    alert('Please enter a valid email address before placing an order.');
    document.getElementById('customer-email').focus();
    return;
  }
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const orderData = {
    customerName: name,
    customerEmail: email,
    specialNote: note || 'None',
    items: cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
    })),
    total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    orderTime: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
  };

  btn.disabled = true;
  btn.textContent = '📨 Sending order...';
  statusEl.className = 'status-msg hidden';

  try {
    const response = await fetch(`${BACKEND_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (response.ok) {
      cart = {};
      renderCart();
      statusEl.textContent = `✅ Order placed! Thank you, ${name}! Check your email for confirmation.`;
      statusEl.className = 'status-msg success';
      statusEl.classList.remove('hidden');
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-email').value = '';
      document.getElementById('customer-note').value = '';
    } else {
      throw new Error(result.message || 'Server returned an error.');
    }
  } catch (err) {
    statusEl.textContent = `❌ Order failed: ${err.message}. Please call us directly.`;
    statusEl.className = 'status-msg error';
    statusEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}

// ── START ─────────────────────────────────────────────────────
renderCategories();
renderMenu();