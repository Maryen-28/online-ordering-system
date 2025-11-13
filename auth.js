// Authentication System

// Business Settings
let businessSettings = {
  name: 'Pizza Hub',
  logo: 'https://c.animaapp.com/mhjyfkufle67LM/img/7cca5a8e-c4f3-4418-b4d7-6b0340da9b72.jpg',
  mission: 'To deliver the finest quality pizzas made with fresh ingredients and authentic recipes, bringing joy to every customer with every bite.',
  vision: 'To become the most loved pizza brand in the Philippines, known for exceptional taste, outstanding service, and community engagement.'
};

// Load settings from localStorage
const savedSettings = localStorage.getItem('businessSettings');
if (savedSettings) {
  businessSettings = JSON.parse(savedSettings);
}

// Demo users database
const users = {
  'customer@pizza.com': {
    password: 'pass123',
    role: 'customer',
    name: 'John Doe',
    phone: '09123456789',
    address: '123 Main St, Manila',
    loyaltyPoints: 1250,
    orderHistory: []
  },
  'staff@pizza.com': {
    password: 'pass123',
    role: 'staff',
    name: 'Jane Smith',
    phone: '09198765432',
    address: 'N/A'
  },
  'admin@pizza.com': {
    password: 'pass123',
    role: 'admin',
    name: 'Admin User',
    phone: '09111111111',
    address: 'N/A'
  }
};

let currentUser = null;

// Initialize authentication
function initAuth() {
  // Update logos on login/register screens
  updateLogos();
  
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLoginScreen();
  }
}

// Update all logo instances
function updateLogos() {
  const logoElements = ['login-logo', 'register-logo', 'sidebar-logo'];
  logoElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.src = businessSettings.logo;
    }
  });
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const role = document.getElementById('user-role').value;
  
  const user = users[email];
  
  if (!user) {
    showToast('User not found!', 'error');
    return;
  }
  
  if (user.password !== password) {
    showToast('Incorrect password!', 'error');
    return;
  }
  
  if (user.role !== role) {
    showToast(`This account is not registered as ${role}!`, 'error');
    return;
  }
  
  // Login successful
  currentUser = { email, ...user };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  showToast('Login successful!', 'success');
  setTimeout(() => {
    showApp();
  }, 500);
});

// Register form handler
document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const address = document.getElementById('register-address').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return;
  }
  
  if (users[email]) {
    showToast('Email already registered!', 'error');
    return;
  }
  
  // Register new user
  users[email] = {
    password,
    role: 'customer',
    name,
    phone,
    address,
    loyaltyPoints: 0,
    orderHistory: []
  };
  
  showToast('Registration successful! Please login.', 'success');
  setTimeout(() => {
    showLoginScreen();
  }, 1000);
});

// Show/hide screens
function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('mobile-nav').classList.add('hidden');
}

function showRegisterScreen() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('mobile-nav').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  
  // Update logos
  updateLogos();
  
  // Update user info in sidebar
  const initials = currentUser.name.split(' ').map(n => n[0]).join('');
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = 
    currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  
  // Update loyalty points if customer
  if (currentUser.role === 'customer') {
    document.getElementById('header-loyalty-points').textContent = currentUser.loyaltyPoints;
  }
  
  // Setup navigation based on role
  setupNavigation();
  
  // Load initial content
  if (currentUser.role === 'customer') {
    loadBrowseMenu();
  } else if (currentUser.role === 'staff') {
    loadStaffOrders();
  } else if (currentUser.role === 'admin') {
    loadAdminDashboard();
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  cart = [];
  favorites = new Set();
  showLoginScreen();
  showToast('Logged out successfully!', 'success');
}

// Setup navigation based on user role
function setupNavigation() {
  const mainNav = document.getElementById('main-nav');
  const mobileNav = document.getElementById('mobile-nav');
  
  let navItems = [];
  
  if (currentUser.role === 'customer') {
    navItems = [
      { icon: '🍕', label: 'Browse Menu', id: 'browse-menu' },
      { icon: '❤️', label: 'Favorites', id: 'favorites' },
      { icon: '📦', label: 'My Orders', id: 'orders' },
      { icon: '⭐', label: 'Loyalty Points', id: 'loyalty' }
    ];
    document.getElementById('mobile-nav').classList.remove('hidden');
  } else if (currentUser.role === 'staff') {
    navItems = [
      { icon: '📋', label: 'Orders', id: 'staff-orders' },
      { icon: '📦', label: 'Order Tracking', id: 'staff-tracking' }
    ];
  } else if (currentUser.role === 'admin') {
    navItems = [
      { icon: '📊', label: 'Dashboard', id: 'admin-dashboard' },
      { icon: '📋', label: 'Orders', id: 'admin-orders' },
      { icon: '📦', label: 'Inventory', id: 'admin-inventory' },
      { icon: '👥', label: 'Users', id: 'admin-users' },
      { icon: '📈', label: 'Analytics', id: 'admin-analytics' },
      { icon: '⚙️', label: 'Settings', id: 'admin-settings' }
    ];
  }
  
  // Populate desktop nav
  mainNav.innerHTML = navItems.map(item => `
    <a
      href="#${item.id}"
      class="nav-link flex items-center gap-3 px-4 py-3 rounded text-primary-foreground hover:bg-primary-hover"
      data-section="${item.id}"
    >
      <span class="text-xl">${item.icon}</span>
      <span class="font-medium">${item.label}</span>
    </a>
  `).join('');
  
  // Populate mobile nav for customers
  if (currentUser.role === 'customer') {
    mobileNav.innerHTML = navItems.map(item => `
      <a
        href="#${item.id}"
        class="flex flex-col items-center gap-1 text-primary-foreground"
        data-section="${item.id}"
      >
        <span class="text-xl">${item.icon}</span>
        <span class="text-label">${item.label.split(' ')[0]}</span>
      </a>
    `).join('');
  }
  
  // Add click handlers
  document.querySelectorAll('.nav-link, #mobile-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      navigateToSection(sectionId);
    });
  });
}

function navigateToSection(sectionId) {
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active:bg-primary-hover');
  });
  document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active:bg-primary-hover');
  
  // Update page title
  const titles = {
    'browse-menu': 'Browse Menu',
    'favorites': 'Your Favorites',
    'orders': 'My Orders',
    'loyalty': 'Loyalty Points',
    'staff-orders': 'Manage Orders',
    'staff-tracking': 'Order Tracking',
    'admin-dashboard': 'Admin Dashboard',
    'admin-orders': 'Order Management',
    'admin-inventory': 'Inventory Management',
    'admin-users': 'User Management',
    'admin-analytics': 'Analytics',
    'admin-settings': 'Business Settings'
  };
  document.getElementById('page-title').textContent = titles[sectionId] || 'PizzaHub';
  
  // Load content based on section
  switch(sectionId) {
    case 'browse-menu':
      loadBrowseMenu();
      break;
    case 'favorites':
      loadFavorites();
      break;
    case 'orders':
      loadCustomerOrders();
      break;
    case 'loyalty':
      loadLoyaltyPoints();
      break;
    case 'staff-orders':
      loadStaffOrders();
      break;
    case 'staff-tracking':
      loadStaffTracking();
      break;
    case 'admin-dashboard':
      loadAdminDashboard();
      break;
    case 'admin-orders':
      loadAdminOrders();
      break;
    case 'admin-inventory':
      loadAdminInventory();
      break;
    case 'admin-users':
      loadAdminUsers();
      break;
    case 'admin-analytics':
      loadAdminAnalytics();
      break;
    case 'admin-settings':
      loadAdminSettings();
      break;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAuth);
