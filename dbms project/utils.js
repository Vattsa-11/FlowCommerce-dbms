/**
 * UTILITY FUNCTIONS
 * Helper functions for common operations across the application
 */

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove();">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);
}

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function openModal(modalId) {
  console.log('Opening modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    console.log('Modal opened successfully');
  } else {
    console.error('Modal not found:', modalId);
  }
}

function closeModal(modalId) {
  console.log('Closing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function switchModal(fromModalId, toModalId) {
  // Close the source modal
  const fromModal = document.getElementById(fromModalId);
  if (fromModal) {
    fromModal.classList.remove('active');
  }
  // Open the target modal
  setTimeout(() => {
    openModal(toModalId);
  }, 100);
}

// Close modal when clicking outside
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
});

// ============================================================================
// LOADING SPINNER
// ============================================================================

function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('active');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// ============================================================================
// THEME TOGGLE (DARK MODE / LIGHT MODE)
// ============================================================================

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';

  // Apply saved theme
  if (savedTheme === 'dark') {
    html.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark-mode');
    const isDark = html.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

function getPasswordStrength(password) {
  if (password.length === 0) return '';
  if (password.length < 6) return 'weak';
  if (password.length < 8) return 'fair';
  if (/^[a-z]*$/.test(password)) return 'fair';
  if (/^[A-Za-z]*$/.test(password)) return 'good';
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'strong';
  return 'good';
}

function updatePasswordStrength(inputId, barId, textId) {
  const input = document.getElementById(inputId);
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);

  if (!input || !bar || !text) return;

  input.addEventListener('input', () => {
    const strength = getPasswordStrength(input.value);
    bar.className = `password-strength-bar ${strength}`;
    text.textContent = strength ? `Strength: ${strength.charAt(0).toUpperCase() + strength.slice(1)}` : '';
  });
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('localStorage error:', error);
    return false;
  }
}

function getFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('localStorage error:', error);
    return null;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('localStorage error:', error);
    return false;
  }
}

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// PAGINATION
// ============================================================================

function createPagination(currentPage, totalPages, onPageChange) {
  const container = document.getElementById('pagination');
  if (!container) return;

  container.innerHTML = '';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => onPageChange(currentPage - 1);
  if (currentPage > 1) container.appendChild(prevBtn);

  // Page numbers
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.onclick = () => onPageChange(i);
    container.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => onPageChange(currentPage + 1);
  if (currentPage < totalPages) container.appendChild(nextBtn);
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

function formatPrice(price) {
  // Format as Indian Rupees with proper locale
  const num = parseFloat(price);
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================================
// NAVIGATION
// ============================================================================

function navigateToPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });

  // Show target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  // Update navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = document.querySelector(`[href="#${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// ============================================================================
// CART FUNCTIONS
// ============================================================================

function addToCart(product) {
  let cart = getFromLocalStorage('cart') || [];

  // Check if product already exists
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += product.quantity || 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity || 1
    });
  }

  saveToLocalStorage('cart', cart);
  updateCartBadge();
  showToast(`${product.name} added to cart!`, 'success');
  return cart;
}

function removeFromCart(productId) {
  let cart = getFromLocalStorage('cart') || [];
  cart = cart.filter(item => item.id !== productId);
  saveToLocalStorage('cart', cart);
  updateCartBadge();
  return cart;
}

function updateCartBadge() {
  const cart = getFromLocalStorage('cart') || [];
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
  }
}

function getCartTotal() {
  const cart = getFromLocalStorage('cart') || [];
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ============================================================================
// WISHLIST FUNCTIONS
// ============================================================================

function addToWishlist(product) {
  let wishlist = getFromLocalStorage('wishlist') || [];

  const exists = wishlist.some(item => item.id === product.id);
  if (!exists) {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    saveToLocalStorage('wishlist', wishlist);
    showToast(`${product.name} added to wishlist!`, 'success');
  }

  return wishlist;
}

function removeFromWishlist(productId) {
  let wishlist = getFromLocalStorage('wishlist') || [];
  wishlist = wishlist.filter(item => item.id !== productId);
  saveToLocalStorage('wishlist', wishlist);
  return wishlist;
}

function isInWishlist(productId) {
  const wishlist = getFromLocalStorage('wishlist') || [];
  return wishlist.some(item => item.id === productId);
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

function filterProducts(products, filters) {
  return products.filter(product => {
    // Price filter
    if (filters.maxPrice && product.price > filters.maxPrice) return false;

    // Category filter
    if (filters.category && product.category !== filters.category) return false;

    // Rating filter
    if (filters.minRating && product.rating < filters.minRating) return false;

    // Stock filter
    if (filters.inStockOnly && product.stock === 0) return false;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);
    }

    return true;
  });
}

function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return sorted;
  }
}

// ============================================================================
// API HELPERS
// ============================================================================

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    showToast('An error occurred. Please try again.', 'error');
    throw error;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  updateCartBadge();
});
