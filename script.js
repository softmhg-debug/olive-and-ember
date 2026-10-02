const menuItems = [
  {
    id: 'whipped-feta', name: 'Whipped feta', category: 'Small plates', price: 12,
    description: 'Hot honey, roasted grapes, torn herbs & warm pita.', badge: 'A little favorite',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=80', alt: 'Whipped feta dip with herbs and warm pita'
  },
  {
    id: 'crispy-artichokes', name: 'Crispy artichokes', category: 'Small plates', price: 14,
    description: 'Lemon, flaky salt & a very good green goddess dip.', badge: '',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', alt: 'Fresh greens and seasonal vegetables'
  },
  {
    id: 'market-salad', name: 'The market salad', category: 'Small plates', price: 16,
    description: 'Whatever looks loveliest today, tossed with our house vinaigrette.', badge: 'Seasonal',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', alt: 'A fresh market salad with colorful vegetables'
  },
  {
    id: 'lemon-chicken', name: 'Lemon-olive chicken', category: 'Mains', price: 26,
    description: 'Slow-roasted chicken, crispy potatoes, charred lemon jus.', badge: 'House favorite',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80', alt: 'Roasted chicken served with vegetables'
  },
  {
    id: 'crispy-salmon', name: 'Crispy-skin salmon', category: 'Mains', price: 28,
    description: 'Green lentils, dill yogurt & a bright little herb salad.', badge: '',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80', alt: 'Seared salmon with fresh herbs'
  },
  {
    id: 'mushroom-orzo', name: 'Wild mushroom orzo', category: 'Mains', price: 23,
    description: 'Creamy orzo, roasted mushrooms, parmesan & thyme.', badge: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80', alt: 'A warm bowl of pasta with herbs'
  },
  {
    id: 'olive-oil-cake', name: 'Olive oil cake', category: 'Sweets', price: 10,
    description: 'Citrus, good olive oil & a cloud of softly whipped cream.', badge: '',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80', alt: 'A slice of cake with cream and berries'
  },
  {
    id: 'blood-orange-soda', name: 'Blood orange soda', category: 'Drinks', price: 6,
    description: 'Fresh citrus, bubbles & just enough sweetness.', badge: 'House-made',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80', alt: 'A refreshing orange drink with citrus'
  }
];

const cart = new Map();
const menuGrid = document.querySelector('#menu-grid');
const categoryList = document.querySelector('#category-list');
const orderItems = document.querySelector('#order-items');
const orderSummary = document.querySelector('#order-summary');
const cartCount = document.querySelector('#cart-count');
const orderCount = document.querySelector('#order-count');
const orderPanel = document.querySelector('#order-panel');
const cartBackdrop = document.querySelector('#cart-backdrop');
const checkoutDialog = document.querySelector('#checkout-dialog');
const checkoutForm = document.querySelector('#checkout-form');
const toast = document.querySelector('#toast');
let toastTimeout;
let activeCategory = 'All';

const formatPrice = (amount) => `$${amount.toFixed(2)}`;

function renderMenu() {
  const visibleItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  menuGrid.innerHTML = visibleItems.map((item, index) => `
    <article class="menu-card" style="animation-delay:${index * 35}ms">
      <div class="dish-image">
        <img src="${item.image}" alt="${item.alt}" loading="lazy">
        ${item.badge ? `<span class="dish-badge">${item.badge}</span>` : ''}
      </div>
      <div class="dish-info"><h3 class="dish-name">${item.name}</h3><span class="dish-price">${formatPrice(item.price)}</span></div>
      <p class="dish-description">${item.description}</p>
      <button class="add-button" type="button" data-add="${item.id}" aria-label="Add ${item.name} to your order"><span aria-hidden="true">+</span> Add to order</button>
    </article>
  `).join('');
}

function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((total, [, quantity]) => total + quantity, 0);
  const subtotal = entries.reduce((total, [id, quantity]) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    return total + item.price * quantity;
  }, 0);
  const isDelivery = document.querySelector('input[name="fulfillment"]:checked')?.value === 'delivery';
  const total = subtotal + (isDelivery && count ? 3.5 : 0);

  cartCount.textContent = count;
  orderCount.textContent = `(${count})`;
  orderSummary.hidden = count === 0;
  document.querySelector('#subtotal').textContent = formatPrice(subtotal);
  document.querySelector('#total').textContent = formatPrice(total);
  document.querySelector('#checkout-total').textContent = formatPrice(total);
  document.querySelector('#delivery-line').hidden = !isDelivery || count === 0;

  if (count === 0) {
    orderItems.innerHTML = '<div class="empty-order"><span class="empty-plate" aria-hidden="true">✳</span><strong>Your table’s waiting.</strong><p>Add a little something from the menu to get started.</p><a href="#menu" class="text-link">Browse the menu <span aria-hidden="true">↗</span></a></div>';
    return;
  }

  orderItems.innerHTML = entries.map(([id, quantity]) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    return `
      <div class="order-item">
        <div><p class="order-item-name">${item.name}</p><p class="order-item-price">${formatPrice(item.price * quantity)}</p></div>
        <div class="quantity-control" aria-label="Quantity of ${item.name}">
          <button type="button" data-change="${id}" data-amount="-1" aria-label="Remove one ${item.name}">−</button>
          <span>${quantity}</span>
          <button type="button" data-change="${id}" data-amount="1" aria-label="Add one ${item.name}">+</button>
        </div>
      </div>
    `;
  }).join('');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 1900);
}

function setCartOpen(isOpen) {
  orderPanel.classList.toggle('is-open', isOpen);
  cartBackdrop.classList.toggle('is-visible', isOpen);
  document.body.classList.toggle('cart-open', isOpen);
  if (isOpen) document.querySelector('#close-cart').focus();
}

categoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryList.querySelector('.is-active')?.classList.remove('is-active');
  button.classList.add('is-active');
  renderMenu();
});

menuGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const id = button.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${menuItems.find((item) => item.id === id).name} added to your order`);
});

orderItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-change]');
  if (!button) return;
  const id = button.dataset.change;
  const quantity = (cart.get(id) || 0) + Number(button.dataset.amount);
  if (quantity <= 0) cart.delete(id);
  else cart.set(id, quantity);
  renderCart();
});

document.querySelector('#cart-trigger').addEventListener('click', () => setCartOpen(true));
document.querySelector('#close-cart').addEventListener('click', () => setCartOpen(false));
cartBackdrop.addEventListener('click', () => setCartOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setCartOpen(false);
});

document.querySelector('#checkout-button').addEventListener('click', () => {
  setCartOpen(false);
  checkoutDialog.showModal();
});
document.querySelector('#dialog-close').addEventListener('click', () => checkoutDialog.close());
document.querySelector('#success-close').addEventListener('click', () => checkoutDialog.close());
checkoutDialog.addEventListener('click', (event) => {
  if (event.target === checkoutDialog) checkoutDialog.close();
});

document.querySelectorAll('input[name="fulfillment"]').forEach((input) => {
  input.addEventListener('change', () => {
    const isDelivery = input.value === 'delivery' && input.checked;
    const address = document.querySelector('.address-field');
    address.hidden = !isDelivery;
    address.querySelector('input').required = isDelivery;
    renderCart();
  });
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity() || cart.size === 0) return;

  const formData = new FormData(checkoutForm);
  const name = String(formData.get('name')).trim().split(/\s+/)[0];
  const fulfillment = formData.get('fulfillment');
  const eta = fulfillment === 'delivery' ? '35–50 minutes' : '20–30 minutes';
  document.querySelector('#success-message').textContent = `Thanks, ${name}. Your ${fulfillment} order will be ready in about ${eta}. We’ll call if we need anything.`;
  checkoutForm.hidden = true;
  document.querySelector('#order-success').hidden = false;
  cart.clear();
  renderCart();
});

checkoutDialog.addEventListener('close', () => {
  checkoutForm.reset();
  checkoutForm.hidden = false;
  document.querySelector('#order-success').hidden = true;
  const address = document.querySelector('.address-field');
  address.hidden = true;
  address.querySelector('input').required = false;
  renderCart();
});

document.querySelectorAll('.main-nav a, .hero-actions a, .empty-order a').forEach((link) => {
  link.addEventListener('click', () => setCartOpen(false));
});

renderMenu();
renderCart();
