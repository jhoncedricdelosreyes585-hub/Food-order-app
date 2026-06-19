// ─────────────────────────────────────────────────────────────
// IMPORTANT: Replace this URL with your actual Render server URL
// after you deploy. It will look like:
// https://your-app-name.onrender.com
// ─────────────────────────────────────────────────────────────
const BACKEND_URL = 'https://food-order-bistro.onrender.com';

// ── MENU DATA ─────────────────────────────────────────────────
// To add or change items, just edit this array!
const menuItems = [
  {
    id: 1,
    name: 'Garden Salad',
    description: 'Fresh greens, cherry tomatoes, cucumber, and balsamic dressing.',
    price: 180,
  },
  {
    id: 2,
    name: 'Grilled Chicken Sandwich',
    description: 'Juicy grilled chicken breast, lettuce, tomato on toasted sourdough.',
    price: 250,
  },
  {
    id: 3,
    name: 'Mushroom Pasta',
    description: 'Creamy garlic pasta with sautéed button and shiitake mushrooms.',
    price: 220,
  },
  {
    id: 4,
    name: 'Classic Cheeseburger',
    description: 'Beef patty, aged cheddar, pickles, onions, and our secret sauce.',
    price: 280,
  },
  {
    id: 5,
    name: 'Veggie Wrap',
    description: 'Hummus, roasted peppers, spinach, and avocado in a whole wheat wrap.',
    price: 195,
  },
  {
    id: 6,
    name: 'Mango Iced Tea',
    description: 'House-brewed black tea with real mango syrup, served over ice.',
    price: 95,
  },
];

// ── CART STATE ────────────────────────────────────────────────
// The cart is just a simple JavaScript object:
// { itemId: { ...itemData, quantity: N }, ... }
let cart = {};

// ── BUILD THE MENU ON PAGE LOAD ───────────────────────────────
function renderMenu() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = ''; // Clear first

  menuItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-desc">${item.description}</div>
      <div class="item-price">₱${item.price.toFixed(2)}</div>
      <button class="add-btn" onclick="addToCart(${item.id})">+ Add to Order</button>
    `;
    grid.appendChild(card);
  });
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

  if (cart[itemId].quantity <= 0) {
    delete cart[itemId]; // Remove item if quantity hits 0
  }
  renderCart();
}

function renderCart() {
  const cartItemsEl  = document.getElementById('cart-items');
  const totalRowEl   = document.getElementById('cart-total-row');
  const totalEl      = document.getElementById('cart-total');
  const orderBtn     = document.getElementById('place-order-btn');
  const statusMsg    = document.getElementById('order-status');
  const cartItems    = Object.values(cart);

  // Hide the status message whenever the cart changes
  statusMsg.classList.add('hidden');

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-msg">Your cart is empty. Add items from the menu above!</p>';
    totalRowEl.classList.add('hidden');
    orderBtn.classList.add('hidden');
    return;
  }

  // Build cart rows
  let html = '';
  let total = 0;

  cartItems.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    html += `
      <div class="cart-item">
        <span>${item.name}</span>
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
  totalEl.textContent   = `₱${total.toFixed(2)}`;
  totalRowEl.classList.remove('hidden');
  orderBtn.classList.remove('hidden');
}

// ── PLACE ORDER ───────────────────────────────────────────────
async function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const note = document.getElementById('customer-note').value.trim();
  const cartItems = Object.values(cart);
  const statusEl = document.getElementById('order-status');
  const btn = document.getElementById('place-order-btn');

  // Validation
  if (!name) {
    alert('Please enter your name before placing an order.');
    document.getElementById('customer-name').focus();
    return;
  }
  const email = document.getElementById('customer-email').value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailPattern.test(email)) {
    alert('Please enter a valid email address before placing an order.');
    document.getElementById('customer-email').focus();
    return;
  }
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Build the order object to send to the backend
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

  // Disable the button while sending
  btn.disabled = true;
  btn.textContent = '📨 Sending order...';
  statusEl.className = 'status-msg hidden';

  try {
    // Send the order to our backend server
    const response = await fetch(`${BACKEND_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'bistro-2026-x7k9',
        },
        body: JSON.stringify(orderData),
      });

    const result = await response.json();
    if (response.ok) {
      // Success! Clear the cart and show a success message.
      cart = {};
      renderCart();
      statusEl.textContent = `✅ Order placed! The restaurant has been notified. Thank you, ${name}!`;
      statusEl.className = 'status-msg success';
      statusEl.classList.remove('hidden');
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-email').value = '';
      document.getElementById('customer-note').value = '';
    } else {
      throw new Error(result.message || 'Server returned an error.');
    }
  } catch (err) {
    // Something went wrong
    statusEl.textContent = `❌ Order failed: ${err.message}. Please call us directly.`;
    statusEl.className = 'status-msg error';
    statusEl.classList.remove('hidden');
  } finally {
    // Always re-enable the button
    btn.disabled = false;
    btn.textContent = '✅ Place Order';
  }
}

// ── START ─────────────────────────────────────────────────────
renderMenu();