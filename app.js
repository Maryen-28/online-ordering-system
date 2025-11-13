// Application State
let cart = [];
let favorites = new Set();
let currentItem = null;
let basePrice = 0;
let deliveryFee = 50;
let discount = 0;
let appliedPromo = null;

// Menu items with inventory
const menuItems = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, fresh mozzarella, and basil',
    basePrice: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    stock: 45,
    category: 'pizza'
  },
  {
    id: 2,
    name: 'Pepperoni Deluxe',
    description: 'Loaded with pepperoni and extra cheese',
    basePrice: 349,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    stock: 12,
    category: 'pizza'
  },
  {
    id: 3,
    name: 'Veggie Supreme',
    description: 'Fresh vegetables with olive oil base',
    basePrice: 329,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    stock: 0,
    category: 'pizza'
  },
  {
    id: 4,
    name: 'BBQ Chicken',
    description: 'Grilled chicken with BBQ sauce',
    basePrice: 379,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    stock: 28,
    category: 'pizza'
  },
  {
    id: 5,
    name: 'Hawaiian Paradise',
    description: 'Ham and pineapple classic',
    basePrice: 319,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    stock: 35,
    category: 'pizza'
  },
  {
    id: 6,
    name: 'Meat Lovers',
    description: 'Loaded with assorted meats',
    basePrice: 399,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
    stock: 20,
    category: 'pizza'
  }
];

// Orders database
let orders = [
  {
    id: 12345,
    customerId: 'customer@pizza.com',
    customerName: 'John Doe',
    items: [
      { name: 'Margherita Pizza', size: 'medium', price: 349, quantity: 1 },
      { name: 'Pepperoni Deluxe', size: 'large', price: 449, quantity: 1 }
    ],
    subtotal: 798,
    deliveryFee: 50,
    discount: 0,
    total: 848,
    status: 'out-for-delivery',
    paymentMethod: 'cod',
    deliveryAddress: '123 Main St, Manila',
    phone: '09123456789',
    schedule: 'asap',
    zone: 'zone1',
    createdAt: new Date(Date.now() - 1800000),
    estimatedDelivery: '20-30 min'
  }
];

// Load Browse Menu
function loadBrowseMenu() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <!-- About Section -->
    <div class="bg-white rounded-lg p-8 border border-gray-200 mb-8">
      <div class="flex items-center gap-4 mb-6">
        <img src="${businessSettings.logo}" alt="Logo" class="h-16 w-16 object-contain">
        <div>
          <h2 class="text-h2 font-bold text-primary">${businessSettings.name}</h2>
          <p class="text-gray-600">Delivering Excellence Since 2024</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-neutral rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🎯</span>
            <h5 class="font-semibold text-neutral-foreground">Our Mission</h5>
          </div>
          <p class="text-label text-gray-600 leading-body">${businessSettings.mission}</p>
        </div>

        <div class="bg-neutral rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🌟</span>
            <h5 class="font-semibold text-neutral-foreground">Our Vision</h5>
          </div>
          <p class="text-label text-gray-600 leading-body">${businessSettings.vision}</p>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-4">Our Menu</h2>
      <div class="flex gap-4 mb-6">
        <input
          type="search"
          id="menu-search"
          placeholder="Search pizzas..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded text-neutral-foreground"
        />
        <select
          id="menu-filter"
          class="px-4 py-2 border border-gray-300 rounded text-neutral-foreground"
        >
          <option value="all">All Items</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
        </select>
      </div>
    </div>
    <div id="menu-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
  `;
  
  renderMenuItems();
  
  // Add search and filter handlers
  document.getElementById('menu-search').addEventListener('input', renderMenuItems);
  document.getElementById('menu-filter').addEventListener('change', renderMenuItems);
}

function renderMenuItems() {
  const searchTerm = document.getElementById('menu-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('menu-filter')?.value || 'all';
  
  let filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                         item.description.toLowerCase().includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (filter === 'in-stock') return item.stock > 10;
    if (filter === 'low-stock') return item.stock > 0 && item.stock <= 10;
    
    return true;
  });
  
  const menuGrid = document.getElementById('menu-grid');
  
  if (filteredItems.length === 0) {
    menuGrid.innerHTML = '<p class="text-gray-600 col-span-full text-center py-16">No items found</p>';
    return;
  }
  
  menuGrid.innerHTML = filteredItems.map(item => {
    const isFavorite = favorites.has(item.id);
    const stockStatus = item.stock === 0 ? 'Out of Stock' : 
                       item.stock <= 10 ? 'Low Stock' : 'In Stock';
    const stockClass = item.stock === 0 ? 'text-error' : 
                      item.stock <= 10 ? 'text-warning' : 'text-success';
    
    return `
      <article
        class="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary ${item.stock === 0 ? 'opacity-60' : 'cursor-pointer'}"
        ${item.stock > 0 ? `onclick="openItemModal(${item.id})"` : ''}
      >
        <img
          src="${item.image}"
          alt="${item.name}"
          class="w-full h-48 object-cover"
          loading="lazy"
        />
        <div class="p-6">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-h3 font-sans font-semibold text-neutral-foreground">
              ${item.name}
            </h3>
            <button
              class="favorite-btn bg-transparent border-none text-2xl cursor-pointer"
              aria-label="Add to favorites"
              onclick="event.stopPropagation(); toggleFavorite(${item.id})"
            >
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <p class="text-gray-600 mb-4 leading-body">
            ${item.description}
          </p>
          <div class="flex justify-between items-center">
            <span class="text-h3 font-semibold text-primary">₱${item.basePrice.toFixed(2)}</span>
            <span class="text-label ${stockClass} font-medium">${stockStatus}</span>
          </div>
          ${item.stock > 0 && item.stock <= 10 ? `
            <p class="text-label text-warning mt-2">Only ${item.stock} left!</p>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// Item Modal Functions
function openItemModal(itemId) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item || item.stock === 0) return;
  
  currentItem = item;
  basePrice = item.basePrice;
  
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-description').textContent = item.description;
  document.getElementById('modal-price').textContent = `₱${basePrice.toFixed(2)}`;
  document.getElementById('modal-image').src = item.image;
  document.getElementById('modal-image').alt = item.name;
  document.getElementById('item-modal').classList.remove('hidden');
  
  // Reset form
  document.querySelectorAll('#item-modal input[type="radio"]')[0].checked = true;
  document.querySelectorAll('#item-modal input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('special-instructions').value = '';
  
  // Add listeners for price updates
  document.querySelectorAll('#item-modal input[type="radio"], #item-modal input[type="checkbox"]')
    .forEach(input => {
      input.addEventListener('change', updateModalPrice);
    });
}

function closeItemModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

function updateModalPrice() {
  let total = basePrice;
  
  // Add size price
  const sizeRadio = document.querySelector('#item-modal input[name="size"]:checked');
  total += parseFloat(sizeRadio.dataset.price);
  
  // Add add-ons
  document.querySelectorAll('#item-modal input[type="checkbox"]:checked').forEach(cb => {
    total += parseFloat(cb.dataset.price);
  });
  
  document.getElementById('modal-price').textContent = `₱${total.toFixed(2)}`;
}

function addToCart() {
  const size = document.querySelector('#item-modal input[name="size"]:checked').value;
  const sizePrice = parseFloat(document.querySelector('#item-modal input[name="size"]:checked').dataset.price);
  
  const addons = [];
  let addonsPrice = 0;
  document.querySelectorAll('#item-modal input[type="checkbox"]:checked').forEach(cb => {
    addons.push(cb.dataset.addon);
    addonsPrice += parseFloat(cb.dataset.price);
  });
  
  const instructions = document.getElementById('special-instructions').value;
  const finalPrice = basePrice + sizePrice + addonsPrice;
  
  cart.push({
    ...currentItem,
    size,
    addons,
    instructions,
    finalPrice,
    quantity: 1
  });
  
  updateCart();
  closeItemModal();
  showToast('Item added to cart!', 'success');
}

// Cart Functions
function updateCart() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');
  
  cartCount.textContent = cart.length;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-600 text-center py-8">Your cart is empty</p>';
    cartSubtotal.textContent = '₱0.00';
    cartTotal.textContent = `₱${deliveryFee.toFixed(2)}`;
    document.getElementById('points-to-earn').textContent = '0';
    return;
  }
  
  let subtotal = 0;
  cartItems.innerHTML = cart.map((item, index) => {
    subtotal += item.finalPrice;
    return `
      <div class="flex gap-4 p-4 bg-neutral rounded-lg">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
        <div class="flex-1">
          <h4 class="font-semibold text-neutral-foreground">${item.name}</h4>
          <p class="text-label text-gray-600">${item.size}</p>
          ${item.addons.length > 0 ? `<p class="text-label text-gray-600">${item.addons.join(', ')}</p>` : ''}
          <p class="text-primary font-semibold">₱${item.finalPrice.toFixed(2)}</p>
        </div>
        <button onclick="removeFromCart(${index})" class="text-error hover:text-error bg-transparent border-none cursor-pointer text-xl" aria-label="Remove item">×</button>
      </div>
    `;
  }).join('');
  
  cartSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
  
  const total = subtotal + deliveryFee - discount;
  cartTotal.textContent = `₱${total.toFixed(2)}`;
  
  // Update points to earn
  document.getElementById('points-to-earn').textContent = Math.floor(total);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
  showToast('Item removed from cart', 'success');
}

function updateDeliveryFee() {
  const zoneSelect = document.getElementById('delivery-zone');
  const selectedOption = zoneSelect.options[zoneSelect.selectedIndex];
  deliveryFee = parseFloat(selectedOption.dataset.fee);
  const estimatedTime = selectedOption.dataset.time;
  
  document.getElementById('cart-delivery-fee').textContent = `₱${deliveryFee.toFixed(2)}`;
  document.getElementById('asap-time').textContent = `ASAP (${estimatedTime} min)`;
  
  updateCart();
}

function applyPromo() {
  const promoCode = document.getElementById('promo-code').value.toUpperCase();
  const promoMessage = document.getElementById('promo-message');
  
  if (!promoCode) {
    promoMessage.textContent = 'Please enter a promo code';
    promoMessage.className = 'text-label mt-2 text-error';
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + item.finalPrice, 0);
  
  if (promoCode === 'FIRST20') {
    discount = subtotal * 0.2;
    appliedPromo = 'FIRST20';
    promoMessage.textContent = '20% discount applied!';
    promoMessage.className = 'text-label mt-2 text-success';
  } else if (promoCode === 'BUKO50') {
    discount = 50;
    appliedPromo = 'BUKO50';
    promoMessage.textContent = '₱50 discount applied!';
    promoMessage.className = 'text-label mt-2 text-success';
  } else {
    discount = 0;
    appliedPromo = null;
    promoMessage.textContent = 'Invalid promo code';
    promoMessage.className = 'text-label mt-2 text-error';
  }
  
  if (discount > 0) {
    document.getElementById('discount-section').classList.remove('hidden');
    document.getElementById('cart-discount').textContent = `-₱${discount.toFixed(2)}`;
  } else {
    document.getElementById('discount-section').classList.add('hidden');
  }
  
  updateCart();
}

document.getElementById('cart-toggle').addEventListener('click', () => {
  document.getElementById('cart-drawer').classList.remove('hidden');
});

function closeCart() {
  document.getElementById('cart-drawer').classList.add('hidden');
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
  // Populate checkout modal
  const subtotal = cart.reduce((sum, item) => sum + item.finalPrice, 0);
  const total = subtotal + deliveryFee - discount;
  
  document.getElementById('checkout-items').innerHTML = cart.map(item => `
    <div class="flex justify-between text-neutral-foreground">
      <span>${item.name} (${item.size})</span>
      <span>₱${item.finalPrice.toFixed(2)}</span>
    </div>
  `).join('');
  
  document.getElementById('checkout-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById('checkout-delivery').textContent = `₱${deliveryFee.toFixed(2)}`;
  
  if (discount > 0) {
    document.getElementById('checkout-discount-row').classList.remove('hidden');
    document.getElementById('checkout-discount').textContent = `-₱${discount.toFixed(2)}`;
  } else {
    document.getElementById('checkout-discount-row').classList.add('hidden');
  }
  
  document.getElementById('checkout-total').textContent = `₱${total.toFixed(2)}`;
  
  // Populate delivery info
  document.getElementById('checkout-address').textContent = currentUser.address;
  document.getElementById('checkout-phone').textContent = currentUser.phone;
  
  const schedule = document.querySelector('input[name="schedule"]:checked').value;
  const scheduleText = schedule === 'asap' ? 'ASAP' : 
                      schedule === '1-3hours' ? '1-3 hours from now' : 
                      'Tomorrow morning (8-10 AM)';
  document.getElementById('checkout-schedule').textContent = scheduleText;
  
  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function placeOrder() {
  const subtotal = cart.reduce((sum, item) => sum + item.finalPrice, 0);
  const total = subtotal + deliveryFee - discount;
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const schedule = document.querySelector('input[name="schedule"]:checked').value;
  const zone = document.getElementById('delivery-zone').value;
  const deliveryInstructions = document.getElementById('delivery-instructions').value;
  
  const order = {
    id: Date.now(),
    customerId: currentUser.email,
    customerName: currentUser.name,
    items: cart.map(item => ({
      name: item.name,
      size: item.size,
      addons: item.addons,
      instructions: item.instructions,
      price: item.finalPrice,
      quantity: 1
    })),
    subtotal,
    deliveryFee,
    discount,
    total,
    status: 'confirmed',
    paymentMethod,
    deliveryAddress: currentUser.address,
    phone: currentUser.phone,
    schedule,
    zone,
    deliveryInstructions,
    createdAt: new Date(),
    estimatedDelivery: document.getElementById('asap-time').textContent.match(/\(([^)]+)\)/)[1]
  };
  
  orders.push(order);
  
  // Update loyalty points
  const pointsEarned = Math.floor(total);
  currentUser.loyaltyPoints += pointsEarned;
  users[currentUser.email].loyaltyPoints = currentUser.loyaltyPoints;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  document.getElementById('header-loyalty-points').textContent = currentUser.loyaltyPoints;
  
  // Update inventory
  cart.forEach(cartItem => {
    const menuItem = menuItems.find(m => m.id === cartItem.id);
    if (menuItem) {
      menuItem.stock = Math.max(0, menuItem.stock - 1);
    }
  });
  
  // Clear cart
  cart = [];
  discount = 0;
  appliedPromo = null;
  updateCart();
  
  closeCheckout();
  closeCart();
  
  showToast(`Order placed successfully! You earned ${pointsEarned} points!`, 'success');
  
  // Navigate to orders page
  setTimeout(() => {
    navigateToSection('orders');
  }, 1500);
  
  // Simulate order progression
  simulateOrderProgression(order.id);
}

function simulateOrderProgression(orderId) {
  const statuses = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
  let currentStatusIndex = 0;
  
  const interval = setInterval(() => {
    currentStatusIndex++;
    if (currentStatusIndex >= statuses.length) {
      clearInterval(interval);
      return;
    }
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = statuses[currentStatusIndex];
      
      // Refresh if on orders page
      if (document.getElementById('page-title').textContent === 'My Orders') {
        loadCustomerOrders();
      }
    }
  }, 30000); // Progress every 30 seconds
}

// Favorites Functions
function toggleFavorite(itemId) {
  if (favorites.has(itemId)) {
    favorites.delete(itemId);
    showToast('Removed from favorites', 'success');
  } else {
    favorites.add(itemId);
    showToast('Added to favorites', 'success');
  }
  
  renderMenuItems();
}

function loadFavorites() {
  const mainContent = document.getElementById('main-content');
  
  const favoriteItems = menuItems.filter(item => favorites.has(item.id));
  
  if (favoriteItems.length === 0) {
    mainContent.innerHTML = `
      <div class="text-center py  -16">
        <p class="text-gray-600 text-h3 mb-4">No favorites yet</p>
        <p class="text-gray-600">Start adding items from the menu!</p>
        <button
          onclick="navigateToSection('browse-menu')"
          class="mt-6 px-6 py-3 rounded bg-primary text-primary-foreground font-medium cursor-pointer border-none hover:bg-primary-hover"
        >
          Browse Menu
        </button>
      </div>
    `;
    return;
  }
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Your Favorites</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${favoriteItems.map(item => {
        const stockStatus = item.stock === 0 ? 'Out of Stock' : 
                           item.stock <= 10 ? 'Low Stock' : 'In Stock';
        const stockClass = item.stock === 0 ? 'text-error' : 
                          item.stock <= 10 ? 'text-warning' : 'text-success';
        
        return `
          <article
            class="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-primary ${item.stock === 0 ? 'opacity-60' : 'cursor-pointer'}"
            ${item.stock > 0 ? `onclick="openItemModal(${item.id})"` : ''}
          >
            <img
              src="${item.image}"
              alt="${item.name}"
              class="w-full h-48 object-cover"
              loading="lazy"
            />
            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-h3 font-sans font-semibold text-neutral-foreground">
                  ${item.name}
                </h3>
                <button
                  class="favorite-btn bg-transparent border-none text-2xl cursor-pointer"
                  onclick="event.stopPropagation(); toggleFavorite(${item.id})"
                >
                  ❤️
                </button>
              </div>
              <p class="text-gray-600 mb-4 leading-body">
                ${item.description}
              </p>
              <div class="flex justify-between items-center">
                <span class="text-h3 font-semibold text-primary">₱${item.basePrice.toFixed(2)}</span>
                <span class="text-label ${stockClass} font-medium">${stockStatus}</span>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

// Customer Orders
function loadCustomerOrders() {
  const mainContent = document.getElementById('main-content');
  
  const customerOrders = orders.filter(o => o.customerId === currentUser.email);
  
  if (customerOrders.length === 0) {
    mainContent.innerHTML = `
      <div class="text-center py-16">
        <p class="text-gray-600 text-h3 mb-4">No orders yet</p>
        <p class="text-gray-600">Place your first order now!</p>
        <button
          onclick="navigateToSection('browse-menu')"
          class="mt-6 px-6 py-3 rounded bg-primary text-primary-foreground font-medium cursor-pointer border-none hover:bg-primary-hover"
        >
          Browse Menu
        </button>
      </div>
    `;
    return;
  }
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">My Orders</h2>
    <div class="space-y-6">
      ${customerOrders.map(order => renderOrderCard(order)).join('')}
    </div>
  `;
}

function renderOrderCard(order) {
  const statusSteps = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;
  
  const statusIcons = {
    'confirmed': '✓',
    'preparing': '✓',
    'out-for-delivery': '🚗',
    'delivered': '📦'
  };
  
  const statusLabels = {
    'confirmed': 'Confirmed',
    'preparing': 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered'
  };
  
  return `
    <div class="bg-white rounded-lg p-8 border border-gray-200">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-2">
            Order #${order.id}
          </h3>
          <p class="text-gray-600">${new Date(order.createdAt).toLocaleString()}</p>
          <p class="text-gray-600">Estimated delivery: ${order.estimatedDelivery}</p>
        </div>
        <div class="text-right">
          <p class="text-h3 font-bold text-primary">₱${order.total.toFixed(2)}</p>
          <p class="text-label text-gray-600">${order.paymentMethod.toUpperCase()}</p>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="font-semibold text-neutral-foreground mb-3">Items</h4>
        <div class="space-y-2">
          ${order.items.map(item => `
            <div class="flex justify-between text-neutral-foreground">
              <span>${item.name} (${item.size})</span>
              <span>₱${item.price.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="relative mb-8">
        <div class="flex justify-between mb-4">
          ${statusSteps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return `
              <div class="flex flex-col items-center flex-1">
                <div class="w-12 h-12 rounded-full ${isActive ? 'bg-success' : 'bg-gray-300'} ${isCurrent && step !== 'delivered' ? 'bg-primary' : ''} text-white flex items-center justify-center mb-2 text-xl">
                  ${isActive ? statusIcons[step] : '○'}
                </div>
                <span class="text-label text-neutral-foreground font-medium text-center">${statusLabels[step]}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div class="h-full bg-primary transition-all duration-500" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          onclick="reorderItems(${order.id})"
          class="flex-1 py-3 rounded bg-secondary text-secondary-foreground font-medium cursor-pointer border-none hover:bg-secondary"
        >
          Reorder
        </button>
        <button
          onclick="viewOrderDetails(${order.id})"
          class="flex-1 py-3 rounded border border-primary text-primary font-medium cursor-pointer bg-transparent hover:bg-primary hover:text-primary-foreground"
        >
          View Details
        </button>
      </div>
    </div>
  `;
}

function reorderItems(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  order.items.forEach(orderItem => {
    const menuItem = menuItems.find(m => m.name === orderItem.name);
    if (menuItem && menuItem.stock > 0) {
      cart.push({
        ...menuItem,
        size: orderItem.size,
        addons: orderItem.addons || [],
        instructions: orderItem.instructions || '',
        finalPrice: orderItem.price,
        quantity: 1
      });
    }
  });
  
  updateCart();
  showToast('Items added to cart!', 'success');
  document.getElementById('cart-drawer').classList.remove('hidden');
}

function viewOrderDetails(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  showToast('Order details loaded', 'success');
}

// Loyalty Points
function loadLoyaltyPoints() {
  const mainContent = document.getElementById('main-content');
  
  const customerOrders = orders.filter(o => o.customerId === currentUser.email);
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Loyalty Points</h2>
    
    <div class="bg-white rounded-lg p-8 border border-gray-200 mb-8">
      <div class="text-center mb-8">
        <div class="text-6xl font-bold text-primary mb-2">${currentUser.loyaltyPoints}</div>
        <p class="text-gray-600">Total Points</p>
      </div>

      <div class="bg-tertiary text-tertiary-foreground rounded-lg p-6 mb-8">
        <p class="text-center font-medium">
          Earn 1 point for every peso spent!
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-neutral rounded-lg p-6 text-center">
          <p class="text-h3 font-bold text-primary mb-2">500</p>
          <p class="text-label text-gray-600">Points for ₱50 off</p>
        </div>
        <div class="bg-neutral rounded-lg p-6 text-center">
          <p class="text-h3 font-bold text-primary mb-2">1000</p>
          <p class="text-label text-gray-600">Points for ₱120 off</p>
        </div>
        <div class="bg-neutral rounded-lg p-6 text-center">
          <p class="text-h3 font-bold text-primary mb-2">2000</p>
          <p class="text-label text-gray-600">Points for Free Pizza</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg p-8 border border-gray-200">
      <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-4">
        Points History
      </h3>
      <div class="space-y-4">
        ${customerOrders.length === 0 ? `
          <p class="text-gray-600 text-center py-8">No points history yet</p>
        ` : customerOrders.map(order => `
          <div class="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p class="font-medium text-neutral-foreground">Order #${order.id}</p>
              <p class="text-label text-gray-600">${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span class="text-success font-semibold">+${Math.floor(order.total)} pts</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Staff Functions
function loadStaffOrders() {
  const mainContent = document.getElementById('main-content');
  
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Manage Orders</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Pending</p>
        <p class="text-h2 font-bold text-warning">${orders.filter(o => o.status === 'confirmed').length}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Preparing</p>
        <p class="text-h2 font-bold text-primary">${orders.filter(o => o.status === 'preparing').length}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Out for Delivery</p>
        <p class="text-h2 font-bold text-secondary">${orders.filter(o => o.status === 'out-for-delivery').length}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Completed Today</p>
        <p class="text-h2 font-bold text-success">${orders.filter(o => o.status === 'delivered').length}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral">
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Order ID</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Customer</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Items</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Total</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Status</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${activeOrders.length === 0 ? `
              <tr>
                <td colspan="6" class="py-8 text-center text-gray-600">No active orders</td>
              </tr>
            ` : activeOrders.map(order => `
              <tr class="border-b border-gray-200 hover:bg-neutral">
                <td class="py-3 px-4 text-neutral-foreground">#${order.id}</td>
                <td class="py-3 px-4 text-neutral-foreground">${order.customerName}</td>
                <td class="py-3 px-4 text-neutral-foreground">${order.items.length}</td>
                <td class="py-3 px-4 text-neutral-foreground">₱${order.total.toFixed(2)}</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 rounded-full ${getStatusColor(order.status)} text-label">
                    ${order.status.replace('-', ' ')}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    onclick="updateOrderStatus(${order.id})"
                    class="px-3 py-1 rounded bg-primary text-primary-foreground text-label font-normal cursor-pointer border-none hover:bg-primary-hover"
                  >
                    Update
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function loadStaffTracking() {
  const mainContent = document.getElementById('main-content');
  
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Order Tracking</h2>
    <div class="space-y-6">
      ${activeOrders.length === 0 ? `
        <div class="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p class="text-gray-600">No active orders to track</p>
        </div>
      ` : activeOrders.map(order => renderOrderCard(order)).join('')}
    </div>
  `;
}

function updateOrderStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const statusFlow = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.status);
  
  if (currentIndex < statusFlow.length - 1) {
    order.status = statusFlow[currentIndex + 1];
    showToast(`Order #${orderId} updated to ${order.status}`, 'success');
    loadStaffOrders();
  } else {
    showToast('Order already delivered', 'error');
  }
}

function getStatusColor(status) {
  const colors = {
    'confirmed': 'bg-warning text-neutral-foreground',
    'preparing': 'bg-primary text-white',
    'out-for-delivery': 'bg-secondary text-white',
    'delivered': 'bg-success text-white'
  };
  return colors[status] || 'bg-gray-300 text-neutral-foreground';
}

// Admin Functions
function loadAdminDashboard() {
  const mainContent = document.getElementById('main-content');
  
  const todaySales = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered').length;
  const totalCustomers = Object.values(users).filter(u => u.role === 'customer').length;
  const avgOrderValue = orders.length > 0 ? todaySales / orders.length : 0;
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Admin Dashboard</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Today's Sales</p>
        <p class="text-h2 font-bold text-primary">₱${todaySales.toFixed(2)}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Active Orders</p>
        <p class="text-h2 font-bold text-secondary">${activeOrders}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Total Customers</p>
        <p class="text-h2 font-bold text-tertiary">${totalCustomers}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Avg Order Value</p>
        <p class="text-h2 font-bold text-neutral-foreground">₱${avgOrderValue.toFixed(2)}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg p-8 border border-gray-200 mb-8">
      <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-6">Sales Overview</h3>
      <div class="h-64 flex items-end justify-around gap-4">
        ${[120, 180, 150, 220, 190, 250, 280].map((value, index) => `
          <div class="flex-1 flex flex-col items-center">
            <div class="w-full bg-primary rounded-t" style="height: ${(value / 300) * 100}%"></div>
            <p class="text-label text-gray-600 mt-2">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-4">Recent Orders</h3>
        <div class="space-y-3">
          ${orders.slice(-5).reverse().map(order => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <p class="font-medium text-neutral-foreground">#${order.id}</p>
                <p class="text-label text-gray-600">${order.customerName}</p>
              </div>
              <span class="text-primary font-semibold">₱${order.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-4">Low Stock Items</h3>
        <div class="space-y-3">
          ${menuItems.filter(item => item.stock <= 10).map(item => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <p class="font-medium text-neutral-foreground">${item.name}</p>
                <p class="text-label ${item.stock === 0 ? 'text-error' : 'text-warning'}">
                  ${item.stock === 0 ? 'Out of Stock' : `Only ${item.stock} left`}
                </p>
              </div>
              <button
                onclick="restockItem(${item.id})"
                class="px-3 py-1 rounded bg-secondary text-secondary-foreground text-label cursor-pointer border-none hover:bg-secondary"
              >
                Restock
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function loadAdminOrders() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Order Management</h2>
    
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral">
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Order ID</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Customer</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Items</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Total</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Status</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Date</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr class="border-b border-gray-200 hover:bg-neutral">
                <td class="py-3 px-4 text-neutral-foreground">#${order.id}</td>
                <td class="py-3 px-4 text-neutral-foreground">${order.customerName}</td>
                <td class="py-3 px-4 text-neutral-foreground">${order.items.length}</td>
                <td class="py-3 px-4 text-neutral-foreground">₱${order.total.toFixed(2)}</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 rounded-full ${getStatusColor(order.status)} text-label">
                    ${order.status.replace('-', ' ')}
                  </span>
                </td>
                <td class="py-3 px-4 text-neutral-foreground">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="py-3 px-4">
                  <button
                    onclick="viewOrderDetails(${order.id})"
                    class="px-3 py-1 rounded bg-primary text-primary-foreground text-label font-normal cursor-pointer border-none hover:bg-primary-hover"
                  >
                    View
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function loadAdminInventory() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Inventory Management</h2>
    
    <div class="space-y-4">
      ${menuItems.map(item => `
        <div class="bg-white rounded-lg p-6 border border-gray-200 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
            <div>
              <p class="font-semibold text-neutral-foreground text-h3">${item.name}</p>
              <p class="text-label text-gray-600">Stock: ${item.stock} units</p>
              <p class="text-label text-gray-600">Price: ₱${item.basePrice.toFixed(2)}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="px-4 py-2 rounded-full ${item.stock === 0 ? 'bg-error text-white' : item.stock <= 10 ? 'bg-warning text-neutral-foreground' : 'bg-success text-white'} text-label font-medium">
              ${item.stock === 0 ? 'Out of Stock' : item.stock <= 10 ? 'Low Stock' : 'In Stock'}
            </span>
            <div class="flex gap-2">
              <button
                onclick="adjustStock(${item.id}, -10)"
                class="px-4 py-2 rounded bg-error text-white text-label cursor-pointer border-none hover:bg-error"
              >
                -10
              </button>
              <button
                onclick="adjustStock(${item.id}, 10)"
                class="px-4 py-2 rounded bg-success text-white text-label cursor-pointer border-none hover:bg-success"
              >
                +10
              </button>
              <button
                onclick="restockItem(${item.id})"
                class="px-4 py-2 rounded bg-secondary text-secondary-foreground text-label cursor-pointer border-none hover:bg-secondary"
              >
                Restock to 50
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function adjustStock(itemId, amount) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;
  
  item.stock = Math.max(0, item.stock + amount);
  showToast(`Stock updated for ${item.name}`, 'success');
  loadAdminInventory();
}

function restockItem(itemId) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;
  
  item.stock = 50;
  showToast(`${item.name} restocked to 50 units`, 'success');
  
  if (document.getElementById('page-title').textContent === 'Inventory Management') {
    loadAdminInventory();
  } else if (document.getElementById('page-title').textContent === 'Admin Dashboard') {
    loadAdminDashboard();
  }
}

function loadAdminUsers() {
  const mainContent = document.getElementById('main-content');
  
  const customers = Object.entries(users).filter(([email, user]) => user.role === 'customer');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">User Management</h2>
    
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral">
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Name</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Email</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Phone</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Loyalty Points</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Orders</th>
              <th class="text-left py-3 px-4 text-label font-semibold text-neutral-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(([email, user]) => {
              const userOrders = orders.filter(o => o.customerId === email);
              return `
                <tr class="border-b border-gray-200 hover:bg-neutral">
                  <td class="py-3 px-4 text-neutral-foreground">${user.name}</td>
                  <td class="py-3 px-4 text-neutral-foreground">${email}</td>
                  <td class="py-3 px-4 text-neutral-foreground">${user.phone}</td>
                  <td class="py-3 px-4 text-neutral-foreground">${user.loyaltyPoints}</td>
                  <td class="py-3 px-4 text-neutral-foreground">${userOrders.length}</td>
                  <td class="py-3 px-4">
                    <button
                      onclick="viewUserDetails('${email}')"
                      class="px-3 py-1 rounded bg-primary text-primary-foreground text-label font-normal cursor-pointer border-none hover:bg-primary-hover"
                    >
                      View
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewUserDetails(email) {
  showToast(`Viewing details for ${email}`, 'success');
}

function loadAdminAnalytics() {
  const mainContent = document.getElementById('main-content');
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const topCustomers = Object.entries(users)
    .filter(([email, user]) => user.role === 'customer')
    .sort((a, b) => b[1].loyaltyPoints - a[1].loyaltyPoints)
    .slice(0, 5);
  
  const itemSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.name]) {
        itemSales[item.name] = 0;
      }
      itemSales[item.name]++;
    });
  });
  
  const topItems = Object.entries(itemSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Analytics</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Total Revenue</p>
        <p class="text-h1 font-bold text-primary">₱${totalRevenue.toFixed(2)}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Total Orders</p>
        <p class="text-h1 font-bold text-secondary">${orders.length}</p>
      </div>
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <p class="text-label text-gray-600 mb-2">Avg Order Value</p>
        <p class="text-h1 font-bold text-tertiary">₱${(totalRevenue / orders.length || 0).toFixed(2)}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-4">Top Customers</h3>
        <div class="space-y-3">
          ${topCustomers.map(([email, user]) => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-neutral-foreground">${user.name}</span>
              <span class="text-primary font-semibold">${user.loyaltyPoints} pts</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-4">Popular Items</h3>
        <div class="space-y-3">
          ${topItems.map(([name, count]) => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-neutral-foreground">${name}</span>
              <span class="text-secondary font-semibold">${count} orders</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Admin Settings
function loadAdminSettings() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <h2 class="text-h2 font-sans font-semibold text-neutral-foreground mb-8">Business Settings</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Logo Settings -->
      <div class="bg-white rounded-lg p-8 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-6">Business Logo</h3>
        
        <div class="mb-6">
          <div class="flex justify-center mb-4">
            <img id="preview-logo" src="${businessSettings.logo}" alt="Current Logo" class="h-32 w-32 object-contain border-2 border-gray-200 rounded-lg p-2">
          </div>
          <p class="text-label text-gray-600 text-center mb-4">Current Logo</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="logo-url" class="block text-label font-medium text-neutral-foreground mb-2">Logo URL</label>
            <input
              type="url"
              id="logo-url"
              value="${businessSettings.logo}"
              class="w-full px-4 py-3 border border-gray-300 rounded text-neutral-foreground focus:border-primary"
              placeholder="Enter image URL"
            />
            <p class="text-label text-gray-600 mt-2">Enter a direct link to your logo image (PNG, JPG, SVG)</p>
          </div>

          <button
            onclick="updateLogo()"
            class="w-full py-3 rounded bg-primary text-primary-foreground font-medium cursor-pointer border-none hover:bg-primary-hover"
          >
            Update Logo
          </button>

          <div class="bg-neutral rounded-lg p-4">
            <p class="text-label font-semibold text-neutral-foreground mb-2">Suggested Logo Sources:</p>
            <ul class="text-label text-gray-600 space-y-1">
              <li>• Upload to Imgur.com and copy direct link</li>
              <li>• Use Unsplash.com for free images</li>
              <li>• Use your own hosted image URL</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Mission & Vision -->
      <div class="bg-white rounded-lg p-8 border border-gray-200">
        <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-6">Mission & Vision</h3>
        
        <div class="space-y-6">
          <div>
            <label for="business-name" class="block text-label font-medium text-neutral-foreground mb-2">Business Name</label>
            <input
              type="text"
              id="business-name"
              value="${businessSettings.name}"
              class="w-full px-4 py-3 border border-gray-300 rounded text-neutral-foreground focus:border-primary"
              placeholder="Enter business name"
            />
          </div>

          <div>
            <label for="mission-text" class="block text-label font-medium text-neutral-foreground mb-2">Mission Statement</label>
            <textarea
              id="mission-text"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded text-neutral-foreground focus:border-primary"
              placeholder="Enter your mission statement"
            >${businessSettings.mission}</textarea>
            <p class="text-label text-gray-600 mt-2">Describe your business purpose and goals</p>
          </div>

          <div>
            <label for="vision-text" class="block text-label font-medium text-neutral-foreground mb-2">Vision Statement</label>
            <textarea
              id="vision-text"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded text-neutral-foreground focus:border-primary"
              placeholder="Enter your vision statement"
            >${businessSettings.vision}</textarea>
            <p class="text-label text-gray-600 mt-2">Describe your long-term aspirations</p>
          </div>

          <button
            onclick="updateMissionVision()"
            class="w-full py-3 rounded bg-primary text-primary-foreground font-medium cursor-pointer border-none hover:bg-primary-hover"
          >
            Update Mission & Vision
          </button>
        </div>
      </div>
    </div>

    <!-- About Us Preview -->
    <div class="bg-white rounded-lg p-8 border border-gray-200 mt-8">
      <h3 class="text-h3 font-sans font-semibold text-neutral-foreground mb-6">About Us Preview</h3>
      
      <div class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
          <img src="${businessSettings.logo}" alt="Logo" class="h-20 w-20 object-contain">
          <div>
            <h4 class="text-h2 font-bold text-primary">${businessSettings.name}</h4>
            <p class="text-gray-600">Delivering Excellence Since 2024</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-neutral rounded-lg p-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">🎯</span>
              <h5 class="font-semibold text-neutral-foreground">Our Mission</h5>
            </div>
            <p class="text-gray-600 leading-body">${businessSettings.mission}</p>
          </div>

          <div class="bg-neutral rounded-lg p-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">🌟</span>
              <h5 class="font-semibold text-neutral-foreground">Our Vision</h5>
            </div>
            <p class="text-gray-600 leading-body">${businessSettings.vision}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add live preview for logo
  document.getElementById('logo-url')?.addEventListener('input', (e) => {
    const previewImg = document.getElementById('preview-logo');
    if (previewImg) {
      previewImg.src = e.target.value;
    }
  });
}

function updateLogo() {
  const logoUrl = document.getElementById('logo-url').value;
  
  if (!logoUrl) {
    showToast('Please enter a logo URL', 'error');
    return;
  }

  businessSettings.logo = logoUrl;
  localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
  
  updateLogos();
  showToast('Logo updated successfully!', 'success');
  
  // Reload settings page to show updated preview
  setTimeout(() => {
    loadAdminSettings();
  }, 1000);
}

function updateMissionVision() {
  const name = document.getElementById('business-name').value;
  const mission = document.getElementById('mission-text').value;
  const vision = document.getElementById('vision-text').value;
  
  if (!name || !mission || !vision) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  businessSettings.name = name;
  businessSettings.mission = mission;
  businessSettings.vision = vision;
  
  localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
  
  showToast('Mission and Vision updated successfully!', 'success');
  
  // Reload settings page to show updated preview
  setTimeout(() => {
    loadAdminSettings();
  }, 1000);
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toast.className = `fixed bottom-24 lg:bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'error' ? 'bg-error' : 'bg-success'
  } text-white`;
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Mobile menu toggle
document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('fixed');
  sidebar.classList.toggle('inset-0');
  sidebar.classList.toggle('z-50');
});

// Close modals on outside click
document.getElementById('item-modal').addEventListener('click', (e) => {
  if (e.target.id === 'item-modal') closeItemModal();
});

document.getElementById('cart-drawer').addEventListener('click', (e) => {
  if (e.target.id === 'cart-drawer') closeCart();
});

document.getElementById('checkout-modal').addEventListener('click', (e) => {
  if (e.target.id === 'checkout-modal') closeCheckout();
});
