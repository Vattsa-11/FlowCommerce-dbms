/**
 * APPLICATION
 * Main application logic for eCommerce platform
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentPage = 'home';
let currentFilters = {};
let currentSort = 'popular';
let allProducts = [];
let allCategories = [];
let currentProduct = null;
let currentStep = 1;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  initializeApp();
});

async function initializeApp() {
  console.log('Initializing FlowCommerce...');

  // Setup event listeners
  setupEventListeners();

  // Load data
  await loadProducts();
  await loadCategories();

  // Check authentication
  const user = auth.getCurrentUser();
  if (user) {
    updateAuthUI(user);
  }

  // Setup navigation
  setupNavigation();
}

function setupEventListeners() {
  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navbarMenu');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('active');
    });
  }

  // Close menu when link clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      menu?.classList.remove('active');
    });
  });

  // User menu dropdown
  const userAvatar = document.getElementById('userAvatar');
  const dropdown = document.getElementById('dropdownMenu');
  if (userAvatar) {
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      dropdown?.classList.remove('active');
    }
  });

  // Login/Register buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const cartIcon = document.getElementById('cartIcon');

  console.log('Login button:', loginBtn ? 'found' : 'not found');
  console.log('Register button:', registerBtn ? 'found' : 'not found');

  if (loginBtn) loginBtn.addEventListener('click', () => {
    console.log('Login button clicked');
    openModal('loginModal');
  });
  if (registerBtn) registerBtn.addEventListener('click', () => {
    console.log('Register button clicked');
    openModal('registerModal');
  });
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (cartIcon) cartIcon.addEventListener('click', () => navigateToPage('cart'));

  // Password strength indicator
  updatePasswordStrength('registerPassword', 'strengthBar', 'strengthText');

  // Search functionality
  const navSearch = document.getElementById('navSearch');
  const navSearchBtn = document.getElementById('navSearchBtn');
  const searchResults = document.getElementById('searchResults');

  if (navSearch && navSearchBtn) {
    navSearch.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        searchProducts(query);
      } else {
        searchResults.classList.remove('active');
      }
    });

    navSearchBtn.addEventListener('click', () => {
      const query = navSearch.value.trim();
      if (query.length > 0) {
        navigateToPage('products');
        currentFilters.search = query;
        applySortAndFilter();
        navSearch.value = '';
        searchResults.classList.remove('active');
      }
    });

    navSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = navSearch.value.trim();
        if (query.length > 0) {
          navigateToPage('products');
          currentFilters.search = query;
          applySortAndFilter();
          navSearch.value = '';
          searchResults.classList.remove('active');
        }
      }
    });
  }

  // Close search results on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar-search')) {
      searchResults?.classList.remove('active');
    }
  });

  // Categories dropdown
  const navDropdown = document.querySelector('.nav-dropdown');
  const categoriesDropdown = document.getElementById('navCategoriesDropdown');
  
  if (navDropdown) {
    navDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      categoriesDropdown.classList.toggle('active');
    });
  }

  // Close categories dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      categoriesDropdown?.classList.remove('active');
    }
  });
}

function setupNavigation() {
  // Hash-based navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    navigateToPage(hash);
  });

  // Initial navigation
  const initialHash = window.location.hash.slice(1) || 'home';
  if (initialHash !== currentPage) {
    navigateToPage(initialHash);
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberMe').checked;

  if (!validateEmail(email)) {
    showToast('Please enter a valid email', 'error');
    return;
  }

  showLoading();

  try {
    // Try to authenticate with Supabase
    const customer = await db.customers.getByEmail(email);
    
    if (customer) {
      // User found in database
      const user = {
        id: customer.id,
        name: customer.full_name || email.split('@')[0],
        email: customer.email,
        phone: customer.phone,
        avatar: '👤'
      };

      auth.setCurrentUser(user);
      if (remember) {
        saveToLocalStorage('rememberEmail', email);
      }

      updateAuthUI(user);
      closeModal('loginModal');
      showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
      // User not found, create a new customer record
      const newCustomer = await db.customers.create({
        email: email,
        full_name: email.split('@')[0],
        password_hash: password
      });

      const user = {
        id: newCustomer?.id || Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: '👤'
      };

      auth.setCurrentUser(user);
      if (remember) {
        saveToLocalStorage('rememberEmail', email);
      }

      updateAuthUI(user);
      closeModal('loginModal');
      showToast(`Welcome, ${user.name}!`, 'success');
    }

    // Reset form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error('Login error:', error);
    showToast('Login failed: ' + error.message, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('registerPhone').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!name || !email || !phone || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showToast('Please enter a valid email', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (!validatePassword(password)) {
    showToast('Password must be at least 8 characters with uppercase, lowercase, and numbers', 'error');
    return;
  }

  showLoading();

  try {
    // Check if customer already exists
    const existingCustomer = await db.customers.getByEmail(email);
    if (existingCustomer) {
      hideLoading();
      showToast('An account with this email already exists', 'error');
      return;
    }

    // Create customer in Supabase
    const customer = await db.customers.create({
      email: email,
      full_name: name,
      phone: phone,
      password_hash: password // In production, this should be hashed
    });

    if (customer) {
      const user = {
        id: customer.id,
        name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        avatar: '👤',
        createdAt: customer.created_at
      };

      auth.setCurrentUser(user);
      updateAuthUI(user);
      closeModal('registerModal');
      showToast('Account created successfully!', 'success');

      // Reset form
      document.getElementById('registerName').value = '';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPhone').value = '';
      document.getElementById('registerPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    }
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error('Registration error:', error);
    showToast('Registration failed: ' + error.message, 'error');
  }
}

function handleLogout() {
  auth.logoutUser();
  updateAuthUI(null);
  
  // Close the dropdown
  const dropdown = document.getElementById('dropdownMenu');
  if (dropdown) dropdown.classList.remove('active');
  
  showToast('You have been logged out', 'info');
  navigateToPage('home');
}

function updateAuthUI(user) {
  const userMenu = document.getElementById('userMenu');
  const authButtons = document.getElementById('navbarAuth');
  const userDropdownHeader = document.getElementById('userDropdownHeader');

  if (user) {
    userMenu.classList.remove('hidden');
    userMenu.style.display = 'block';
    authButtons.style.display = 'none';
    
    // Update avatar with user initial
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
      avatar.textContent = user.name ? user.name[0].toUpperCase() : '👤';
      avatar.title = user.name || 'Account';
    }
    
    // Update dropdown header with user info
    if (userDropdownHeader) {
      const nameEl = userDropdownHeader.querySelector('.user-name');
      const emailEl = userDropdownHeader.querySelector('.user-email');
      if (nameEl) nameEl.textContent = user.name || 'User';
      if (emailEl) emailEl.textContent = user.email || '';
    }
  } else {
    userMenu.classList.add('hidden');
    userMenu.style.display = 'none';
    authButtons.style.display = 'flex';
  }
}

function openAccountSettings() {
  showToast('Account settings coming soon!', 'info');
}

// ============================================================================
// PRODUCT LOADING & DISPLAY
// ============================================================================

async function loadProducts() {
  showLoading();
  try {
    // Load products from Supabase
    const supabaseProducts = await db.products.getAll();
    
    if (supabaseProducts && supabaseProducts.length > 0) {
      allProducts = supabaseProducts;
      console.log('✅ Products loaded from Supabase:', allProducts.length);
    } else {
      console.warn('⚠️ No products found in Supabase. Please run the migration tool.');
      allProducts = [];
    }
  } catch (error) {
    console.error('❌ Error loading products from Supabase:', error);
    allProducts = [];
  } finally {
    hideLoading();
  }
}

// Format category names to be more readable
function formatCategory(category) {
  const categoryMap = {
    'beauty': 'Beauty',
    'fragrances': 'Fragrances',
    'furniture': 'Furniture',
    'groceries': 'Groceries',
    'home-decoration': 'Home Decoration',
    'kitchen-accessories': 'Kitchen',
    'laptops': 'Electronics',
    'mens-shirts': 'Fashion',
    'mens-shoes': 'Fashion',
    'mens-watches': 'Fashion',
    'mobile-accessories': 'Electronics',
    'motorcycle': 'Vehicles',
    'skin-care': 'Beauty',
    'smartphones': 'Electronics',
    'sports-accessories': 'Sports & Outdoors',
    'sunglasses': 'Fashion',
    'tablets': 'Electronics',
    'tops': 'Fashion',
    'vehicle': 'Vehicles',
    'womens-bags': 'Fashion',
    'womens-dresses': 'Fashion',
    'womens-jewellery': 'Fashion',
    'womens-shoes': 'Fashion',
    'womens-watches': 'Fashion'
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

// Get emoji icon for category
function getCategoryIcon(category) {
  const iconMap = {
    'Electronics': '📱',
    'Fashion': '👔',
    'Beauty': '💄',
    'Fragrances': '🌸',
    'Furniture': '🛋️',
    'Groceries': '🛒',
    'Home Decoration': '🏡',
    'Kitchen': '🍳',
    'Vehicles': '🚗',
    'Sports & Outdoors': '⚽',
    'Books & Media': '📚',
    'Toys & Games': '🎮'
  };
  return iconMap[category] || '📦';
}

// Update category filter checkboxes dynamically
function updateCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container || allCategories.length === 0) return;
  
  container.innerHTML = allCategories.map(cat => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${cat.name}" onchange="applyFilters()">
      <span class="checkmark"></span>
      <span>${cat.name} (${cat.productCount})</span>
    </label>
  `).join('');
}

async function loadCategories() {
  try {
    // Try loading from Supabase first
    const supabaseCategories = await db.categories.getAll();
    
    if (supabaseCategories && supabaseCategories.length > 0) {
      allCategories = supabaseCategories.map(cat => ({
        ...cat,
        icon: getCategoryIcon(cat.name),
        productCount: cat.product_count || allProducts.filter(p => p.category === cat.name).length
      }));
      console.log('✅ Categories loaded from Supabase:', allCategories.length);
    } else if (allProducts.length > 0) {
      // Build categories from products
      const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
      allCategories = uniqueCategories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        icon: getCategoryIcon(cat),
        productCount: allProducts.filter(p => p.category === cat).length
      }));
      console.log('✅ Categories built from products:', allCategories.length);
    } else {
      allCategories = [];
      console.warn('⚠️ No categories available');
    }
    
    displayFeaturedProducts();
    populateNavCategoriesDropdown();
    updateCategoryFilters();
  } catch (error) {
    console.error('❌ Error loading categories:', error);
  }
}

function displayFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  // Sort by rating and show top 8 rated products
  const topRated = [...allProducts]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);
  container.innerHTML = topRated.map(product => createProductCard(product)).join('');

  // Add event listeners
  topRated.forEach(product => {
    document.getElementById(`wishlist-${product.id}`)?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlistItem(product);
    });
  });
}

function displayCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  container.innerHTML = allCategories.map(cat => `
    <div class="card text-center cursor-pointer" onclick="filterByCategory('${cat.name}')">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${cat.icon}</div>
      <h4>${cat.name}</h4>
    </div>
  `).join('');
}

function populateNavCategoriesDropdown() {
  const dropdown = document.getElementById('navCategoriesDropdown');
  if (!dropdown) return;

  dropdown.innerHTML = allCategories.map(cat => `
    <a href="#products" onclick="filterByCategory('${cat.name}'); event.preventDefault();">
      ${cat.icon} ${cat.name}
    </a>
  `).join('');
}

function searchProducts(query) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;

  const results = allProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
  } else {
    searchResults.innerHTML = results.map(p => {
      const isImageUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
      const imageDisplay = isImageUrl 
        ? `<img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` 
        : `<span style="font-size: 2rem;">${p.image || '📦'}</span>`;
      
      return `
        <div class="search-result-item" onclick="viewProduct(${p.id})">
          <div style="display: flex; gap: 12px; align-items: center;">
            ${imageDisplay}
            <div>
              <strong style="display: block; margin-bottom: 4px;">${p.name}</strong>
              <small style="color: var(--primary); font-weight: 600;">${formatPrice(p.price)}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  searchResults.classList.add('active');
}

function createProductCard(product) {
  const isWishlisted = isInWishlist(product.id);
  const imageUrl = product.image || '';
  
  // Check if image is URL or emoji
  const isImageUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'));
  
  return `
    <div class="product-card" onclick="viewProduct(${product.id})">
      <div class="product-image">
        ${isImageUrl ? `
          <img src="${imageUrl}" alt="${product.name}" loading="lazy" 
               onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=\'font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%\'>📦</div>'">
        ` : `
          <div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">
            ${imageUrl || '📦'}
          </div>
        `}
        <button class="product-wishlist ${isWishlisted ? 'active' : ''}" 
                id="wishlist-${product.id}"
                onclick="handleWishlistClick(${product.id}); event.stopPropagation();">
          ❤️
        </button>
        ${product.originalPrice && product.price < product.originalPrice ? `
          <span class="product-badge">SALE</span>
        ` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h4 class="product-name">${product.name}</h4>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
          <span class="rating-text">(${product.reviewCount || 0})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <p class="product-stock ${product.stock < 10 ? 'low' : ''}">
          ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <button class="btn btn-primary btn-small" onclick="handleAddToCart(${product.id}); event.stopPropagation();">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// PRODUCT FILTERING & SORTING
// ============================================================================

function filterByCategory(category) {
  navigateToPage('products');
  currentFilters.category = category;
  
  // Close dropdown
  const categoriesDropdown = document.getElementById('navCategoriesDropdown');
  if (categoriesDropdown) categoriesDropdown.classList.remove('active');
  
  applySortAndFilter();
}

function applyFilters() {
  const categoryChecks = document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked');
  const categories = Array.from(categoryChecks).map(c => c.value);
  const priceSlider = document.getElementById('priceRange');
  const priceMax = priceSlider ? parseInt(priceSlider.value) : null;
  const inStockOnly = document.getElementById('inStockOnly')?.checked || false;
  const onSaleOnly = document.getElementById('onSaleOnly')?.checked || false;
  
  // Get rating filter
  const ratingCheck = document.querySelector('input[name="rating"]:checked');
  const minRating = ratingCheck ? parseInt(ratingCheck.value) : null;

  currentFilters = {
    ...currentFilters,
    categories: categories.length > 0 ? categories : undefined,
    maxPrice: priceMax && priceMax < 10000 ? priceMax : undefined,
    inStockOnly: inStockOnly,
    onSaleOnly: onSaleOnly,
    minRating: minRating
  };

  applySortAndFilter();
}

function applyPriceFilter() {
  const minInput = document.getElementById('minPrice');
  const maxInput = document.getElementById('maxPrice');
  
  const min = minInput ? parseInt(minInput.value) || 0 : 0;
  const max = maxInput ? parseInt(maxInput.value) || 100000 : 100000;
  
  currentFilters.minPrice = min;
  currentFilters.maxPrice = max;
  
  applySortAndFilter();
}

function updatePriceDisplay(value) {
  const display = document.getElementById('priceValue');
  if (display) {
    display.textContent = `₹${parseInt(value).toLocaleString('en-IN')}`;
  }
  // Also apply the filter after a slight delay for smooth sliding
  clearTimeout(window.priceSliderTimeout);
  window.priceSliderTimeout = setTimeout(() => applyFilters(), 300);
}

function toggleFilterSidebar() {
  const sidebar = document.getElementById('filterSidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }
}

function clearAllFilters() {
  currentFilters = {};
  
  // Uncheck all category checkboxes
  document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  // Reset price range slider
  const priceRange = document.getElementById('priceRange');
  if (priceRange) {
    priceRange.value = priceRange.max;
    updatePriceDisplay();
  }
  
  // Clear price inputs
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  if (minPrice) minPrice.value = '';
  if (maxPrice) maxPrice.value = '';
  
  // Uncheck stock and sale filters
  const stockFilter = document.getElementById('inStockOnly');
  const saleFilter = document.getElementById('onSaleOnly');
  if (stockFilter) stockFilter.checked = false;
  if (saleFilter) saleFilter.checked = false;
  
  // Uncheck rating filters
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  
  // Update page title
  const pageTitle = document.querySelector('#products .page-title');
  if (pageTitle) pageTitle.textContent = 'All Products';
  
  applySortAndFilter();
  showToast('All filters cleared', 'info');
}

function applySortAndFilter() {
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    currentSort = sortSelect.value;
  }

  let filtered = [...allProducts];

  // Apply single category filter (from dropdown click)
  if (currentFilters.category) {
    filtered = filtered.filter(p => p.category === currentFilters.category);
  }
  
  // Apply multiple category filters (from sidebar checkboxes)
  if (currentFilters.categories && currentFilters.categories.length > 0) {
    filtered = filtered.filter(p => currentFilters.categories.includes(p.category));
  }
  
  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Apply min price filter
  if (currentFilters.minPrice) {
    filtered = filtered.filter(p => p.price >= currentFilters.minPrice);
  }

  // Apply max price filter
  if (currentFilters.maxPrice) {
    filtered = filtered.filter(p => p.price <= currentFilters.maxPrice);
  }

  // Apply stock filter
  if (currentFilters.inStockOnly) {
    filtered = filtered.filter(p => p.stock > 0);
  }

  // Apply sale filter
  if (currentFilters.onSaleOnly) {
    filtered = filtered.filter(p => p.originalPrice && p.price < p.originalPrice);
  }

  // Apply rating filter
  if (currentFilters.minRating) {
    filtered = filtered.filter(p => p.rating >= currentFilters.minRating);
  }

  // Apply sorting
  filtered = sortProducts(filtered, currentSort);
  
  // Update results count and filter info
  updateResultsCount(filtered.length);
  updateFilterInfo();

  // Display
  displayProducts(filtered);
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
      return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

function updateResultsCount(count) {
  const resultsInfo = document.getElementById('productsCount');
  if (resultsInfo) {
    resultsInfo.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
  }
}

function updateFilterInfo() {
  const filterInfo = document.getElementById('activeFilterInfo');
  const clearBtn = document.getElementById('clearFiltersBtn');
  
  const hasFilters = currentFilters.category || currentFilters.search || 
                     (currentFilters.categories && currentFilters.categories.length > 0);
  
  if (filterInfo) {
    if (currentFilters.category) {
      filterInfo.textContent = `Category: ${currentFilters.category}`;
    } else if (currentFilters.search) {
      filterInfo.textContent = `Search: "${currentFilters.search}"`;
    } else {
      filterInfo.textContent = '';
    }
  }
  
  if (clearBtn) {
    clearBtn.style.display = hasFilters ? 'inline-flex' : 'none';
  }
}

function clearFilters() {
  currentFilters = {};
  
  // Uncheck all category checkboxes
  document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  // Reset price range
  const priceRange = document.getElementById('priceRange');
  if (priceRange) {
    priceRange.value = priceRange.max;
    const priceValue = document.getElementById('priceValue');
    if (priceValue) priceValue.textContent = priceRange.max;
  }
  
  // Uncheck stock filter
  const stockFilter = document.getElementById('inStockOnly');
  if (stockFilter) stockFilter.checked = false;
  
  // Update page title
  const pageTitle = document.querySelector('#products .page-title');
  if (pageTitle) pageTitle.textContent = 'All Products';
  
  applySortAndFilter();
  showToast('Filters cleared', 'info');
}

function displayProducts(products) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found</div>';
    return;
  }

  container.innerHTML = products.map(product => createProductCard(product)).join('');

  // Reattach event listeners
  products.forEach(product => {
    document.getElementById(`wishlist-${product.id}`)?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlistItem(product);
    });
  });
}

function scrollToProducts() {
  navigateToPage('products');
}

// ============================================================================
// PRODUCT DETAIL PAGE
// ============================================================================

async function viewProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }

  currentProduct = product;
  navigateToPage('productDetail');
  displayProductDetail(product);

  // Save to recently viewed
  let viewed = getFromLocalStorage('recentlyViewed') || [];
  viewed = viewed.filter(p => p.id !== productId);
  viewed.unshift(product);
  saveToLocalStorage('recentlyViewed', viewed.slice(0, 10));
}

function displayProductDetail(product) {
  const container = document.getElementById('productDetailContent');
  if (!container) return;

  // Check if image is URL or emoji
  const isImageUrl = product.image && (product.image.startsWith('http') || product.image.startsWith('data:'));
  const imageHtml = isImageUrl 
    ? `<img src="${product.image}" alt="${product.name}" id="mainImage" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\'product-emoji\'>📦</div>'">`
    : `<div class="product-emoji">${product.image || '📦'}</div>`;

  const isWishlisted = isInWishlist(product.id);

  container.innerHTML = `
    <div class="product-detail-container">
      <button class="btn btn-ghost back-btn" onclick="navigateToPage('products')">
        ← Back to Products
      </button>
      
      <div class="product-detail-grid">
        <div class="product-detail-images">
          <div class="main-image">
            ${imageHtml}
          </div>
          ${product.images && product.images.length > 1 ? `
            <div class="image-thumbnails">
              ${product.images.slice(0, 4).map((img, i) => `
                <img src="${img}" alt="Thumbnail ${i+1}" class="thumbnail ${i === 0 ? 'active' : ''}" 
                     onclick="changeMainImage('${img}', this)">
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="product-detail-info">
          <div class="product-category">${product.category}</div>
          <h1 class="product-title">${product.name}</h1>
          
          <div class="product-rating-large">
            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span class="rating-text">${product.rating} (${product.reviewCount || 0} reviews)</span>
          </div>
          
          <div class="product-price-large">
            <span class="price-current">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `
              <span class="price-original">${formatPrice(product.originalPrice)}</span>
              <span class="discount-badge">${Math.round((1 - product.price/product.originalPrice) * 100)}% OFF</span>
            ` : ''}
          </div>
          
          <p class="product-description">${product.description}</p>
          
          <div class="product-meta">
            ${product.brand ? `<p><strong>Brand:</strong> ${product.brand}</p>` : ''}
            ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ''}
            ${product.warrantyInfo ? `<p><strong>Warranty:</strong> ${product.warrantyInfo}</p>` : ''}
            ${product.shippingInfo ? `<p><strong>Shipping:</strong> ${product.shippingInfo}</p>` : ''}
          </div>
          
          <p class="product-stock ${product.stock < 10 ? 'low' : ''}" id="productStockText">
            ${product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
          </p>
          
          <div class="quantity-selector">
            <label>Quantity:</label>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="decreaseQty()">−</button>
              <input type="number" id="quantityInput" value="1" min="1" max="${product.stock}" readonly>
              <button class="qty-btn" onclick="increaseQty()">+</button>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="btn btn-primary btn-large" onclick="addToCartFromDetail()" ${product.stock === 0 ? 'disabled' : ''}>
              🛒 Add to Cart
            </button>
            <button class="btn btn-outline btn-large ${isWishlisted ? 'active' : ''}" id="wishlistBtn" onclick="toggleWishlist()">
              ${isWishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      
      <div class="related-products">
        <h2>Related Products</h2>
        <div class="products-grid" id="relatedProducts"></div>
      </div>
    </div>
  `;

  // Display related products
  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedContainer = document.getElementById('relatedProducts');
  if (relatedContainer) {
    relatedContainer.innerHTML = related.map(p => createProductCard(p)).join('');
  }
}

function changeMainImage(src, thumbnail) {
  const mainImage = document.querySelector('.main-image img');
  if (mainImage) {
    mainImage.src = src;
  }
  // Update active thumbnail
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  thumbnail.classList.add('active');
}

function increaseQty() {
  const input = document.getElementById('quantityInput');
  const max = parseInt(input.max);
  if (parseInt(input.value) < max) {
    input.value = parseInt(input.value) + 1;
  }
}

function decreaseQty() {
  const input = document.getElementById('quantityInput');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function addToCartFromDetail() {
  if (!currentProduct) return;

  const quantityInput = document.getElementById('quantityInput');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  addToCartDirectly(currentProduct, quantity);
}

function addToCartDirectly(product, quantity) {
  // Allow adding to cart without login (can require login at checkout)
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: quantity || 1
  };

  // Use the utils.js addToCart function
  let cart = getFromLocalStorage('cart') || [];
  const existingItem = cart.find(item => item.id === cartItem.id);

  if (existingItem) {
    existingItem.quantity += cartItem.quantity;
  } else {
    cart.push(cartItem);
  }

  saveToLocalStorage('cart', cart);
  updateCartBadge();
  showToast(`${product.name} added to cart!`, 'success');
}

// Handle add to cart from product card (by ID)
function handleAddToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }
  addToCartDirectly(product, 1);
}

// Handle wishlist click from product card (by ID)
function handleWishlistClick(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }
  toggleWishlistItem(product);
}

function toggleWishlist() {
  if (!currentProduct) return;
  toggleWishlistItem(currentProduct);
}

function toggleWishlistItem(product) {
  const wishlistBtn = document.getElementById(`wishlist-${product.id}`);

  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    if (wishlistBtn) wishlistBtn.classList.remove('active');
    showToast('Removed from wishlist', 'info');
  } else {
    addToWishlist(product);
    if (wishlistBtn) wishlistBtn.classList.add('active');
    showToast('Added to wishlist', 'success');
  }
}

function shareProduct(platform) {
  if (!currentProduct) return;

  const url = window.location.href;
  const text = `Check out this amazing product: ${currentProduct.name} - ${formatPrice(currentProduct.price)}`;

  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)} ${encodeURIComponent(url)}`
  };

  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400');
  }
}

function submitReview(event) {
  event.preventDefault();

  if (!auth.isUserAuthenticated()) {
    showToast('Please login to submit a review', 'info');
    openModal('loginModal');
    return;
  }

  const rating = document.getElementById('reviewRating').value;
  const text = document.getElementById('reviewText').value;

  if (!text) {
    showToast('Please write a review', 'error');
    return;
  }

  showLoading();

  setTimeout(() => {
    hideLoading();
    showToast('Thank you for your review!', 'success');
    document.getElementById('reviewForm').reset();
  }, 1000);
}

// ============================================================================
// SHOPPING CART
// ============================================================================

function navigateTocart() {
  navigateToPage('cart');
  displayCart();
}

function displayCart() {
  const cart = getFromLocalStorage('cart') || [];
  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
        <h3>Your cart is empty</h3>
        <p style="color: var(--text-secondary);">Add some products to get started!</p>
        <button class="btn btn-primary" onclick="continueShopping()">Continue Shopping</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    const isImageUrl = item.image && (item.image.startsWith('http') || item.image.startsWith('data:'));
    const imageHtml = isImageUrl 
      ? `<img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">`
      : `<div style="font-size: 3rem; text-align: center;">${item.image || '📦'}</div>`;
    
    return `
      <div class="cart-item">
        <div class="cart-item-image">
          ${imageHtml}
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-price">${formatPrice(item.price)} each</p>
        </div>
        <div class="cart-item-actions">
          <div class="cart-quantity">
            <button class="qty-btn" onclick="updateCartQuantity(${index}, ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
          <button class="btn btn-small btn-accent" onclick="removeCartItem(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  updateCartSummary();
}

function updateCartQuantity(index, newQuantity) {
  let cart = getFromLocalStorage('cart') || [];

  if (newQuantity <= 0) {
    removeCartItem(index);
    return;
  }

  cart[index].quantity = newQuantity;
  saveToLocalStorage('cart', cart);
  displayCart();
  updateCartBadge();
}

function removeCartItem(index) {
  let cart = getFromLocalStorage('cart') || [];
  cart.splice(index, 1);
  saveToLocalStorage('cart', cart);
  displayCart();
  updateCartBadge();
}

function updateCartSummary() {
  const cart = getFromLocalStorage('cart') || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.10;
  const total = subtotal + shipping + tax;

  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('shipping').textContent = formatPrice(shipping);
  document.getElementById('tax').textContent = formatPrice(tax);
  document.getElementById('total').textContent = formatPrice(total);
}

function continueShopping() {
  navigateToPage('products');
}

function goToCheckout() {
  const cart = getFromLocalStorage('cart') || [];
  if (cart.length === 0) {
    showToast('Your cart is empty', 'info');
    return;
  }

  if (!auth.isUserAuthenticated()) {
    showToast('Please login to checkout', 'info');
    openModal('loginModal');
    return;
  }

  navigateToPage('checkout');
  prefillCheckoutForm();
  displayCheckoutSummary();
}

// Prefill checkout form with user details
function prefillCheckoutForm() {
  const user = auth.getCurrentUser();
  if (!user) return;

  // Prefill form fields
  const nameField = document.getElementById('shipName');
  const emailField = document.getElementById('shipEmail');
  const phoneField = document.getElementById('shipPhone');

  if (nameField && user.name) nameField.value = user.name;
  if (emailField && user.email) emailField.value = user.email;
  if (phoneField && user.phone) phoneField.value = user.phone;
}

// ============================================================================
// CHECKOUT
// ============================================================================

function nextStep() {
  if (currentStep === 1) {
    // Validate shipping form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (!fullName || !email || !phone || !address) {
      showToast('Please fill in all shipping fields', 'error');
      return;
    }

    currentStep = 2;
  } else if (currentStep === 2) {
    // Validate payment form
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
      showToast('Please fill in all payment fields', 'error');
      return;
    }

    currentStep = 3;
  }

  updateCheckoutSteps();
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateCheckoutSteps();
  }
}

function updateCheckoutSteps() {
  // Hide all steps
  document.querySelectorAll('.checkout-step').forEach(step => {
    step.style.display = 'none';
  });

  // Show current step
  if (currentStep === 1) {
    document.getElementById('shippingForm').style.display = 'block';
  } else if (currentStep === 2) {
    document.getElementById('paymentForm').style.display = 'block';
  } else if (currentStep === 3) {
    document.getElementById('orderReview').style.display = 'block';
    displayOrderReview();
  }

  // Update step indicators
  document.querySelectorAll('.step-indicator').forEach(indicator => {
    const step = parseInt(indicator.getAttribute('step'));
    indicator.classList.toggle('active', step <= currentStep);
  });
}

function displayOrderReview() {
  const cart = getFromLocalStorage('cart') || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.10;
  const total = subtotal + shipping + tax;

  const address = `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}`;

  document.getElementById('reviewOrderItems').innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
      <span>${item.name} x ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  document.getElementById('reviewAddress').textContent = address;
  document.getElementById('reviewSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('reviewShipping').textContent = formatPrice(shipping);
  document.getElementById('reviewTax').textContent = formatPrice(tax);
  document.getElementById('reviewTotal').textContent = formatPrice(total);
}

function displayCheckoutSummary() {
  const cart = getFromLocalStorage('cart') || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.10;
  const total = subtotal + shipping + tax;

  // Display cart items
  const itemsContainer = document.getElementById('checkoutItems');
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => {
      const isImageUrl = item.image && (item.image.startsWith('http') || item.image.startsWith('data:'));
      const imageHtml = isImageUrl 
        ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">`
        : `<span style="font-size: 2rem;">${item.image || '📦'}</span>`;
      
      return `
        <div style="display: flex; gap: 1rem; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
          ${imageHtml}
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
            <div style="color: var(--text-secondary); font-size: 0.85rem;">Qty: ${item.quantity}</div>
          </div>
          <div style="font-weight: 600;">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `;
    }).join('') + `
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
        <span>Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
        <span>Shipping</span>
        <span>${formatPrice(shipping)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
        <span>Tax (10%)</span>
        <span>${formatPrice(tax)}</span>
      </div>
    `;
  }

  // Update total
  const totalEl = document.getElementById('checkoutTotal');
  if (totalEl) {
    totalEl.textContent = formatPrice(total);
  }
}

async function placeOrder() {
  // Validate form
  const shipName = document.getElementById('shipName')?.value;
  const shipEmail = document.getElementById('shipEmail')?.value;
  const shipPhone = document.getElementById('shipPhone')?.value;
  const shipAddress = document.getElementById('shipAddress')?.value;
  const shipCity = document.getElementById('shipCity')?.value;
  const shipPincode = document.getElementById('shipPincode')?.value;

  if (!shipName || !shipEmail || !shipPhone || !shipAddress || !shipCity || !shipPincode) {
    showToast('Please fill in all shipping details', 'error');
    return;
  }

  const cart = getFromLocalStorage('cart') || [];
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  showLoading();

  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.10;
  const total = subtotal + shipping + tax;

  try {
    // Create order in Supabase
    const orderId = 'FC' + Math.floor(Math.random() * 999999);
    const order = {
      id: orderId,
      customer_email: shipEmail,
      items: cart,
      subtotal,
      shipping,
      tax,
      total,
      shipping_name: shipName,
      shipping_email: shipEmail,
      shipping_phone: shipPhone,
      shipping_address: shipAddress,
      shipping_city: shipCity,
      shipping_pincode: shipPincode,
      status: 'Processing',
      payment_method: 'Cash on Delivery'
    };

    // Save to Supabase
    await db.orders.create(order);

    // Update product stock in Supabase
    await updateProductStock(cart);

    // Clear local cart
    removeFromLocalStorage('cart');
    updateCartBadge();

    hideLoading();

    // Show confirmation
    document.getElementById('confirmOrderId').textContent = '#' + orderId;
    document.getElementById('confirmTotal').textContent = formatPrice(total);

    navigateToPage('orderConfirmation');

    showToast('Order placed successfully!', 'success');
  } catch (error) {
    hideLoading();
    console.error('Order error:', error);
    showToast('Failed to place order: ' + error.message, 'error');
  }
}

// Update stock when order is placed
async function updateProductStock(cartItems) {
  for (const cartItem of cartItems) {
    try {
      const product = await db.products.getById(cartItem.id);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - (cartItem.quantity || 1));
        await db.products.updateStock(cartItem.id, newStock);
      }
    } catch (error) {
      console.error('Stock update error for product ' + cartItem.id + ':', error);
    }
  }
}

function goToOrders() {
  navigateToPage('orders');
  displayOrders();
}

function goHome() {
  navigateToPage('home');
}

// ============================================================================
// ORDERS PAGE
// ============================================================================

async function displayOrders() {
  const user = auth.getCurrentUser();
  if (!user) {
    showToast('Please login to view orders', 'info');
    openModal('loginModal');
    return;
  }

  const container = document.getElementById('ordersList');
  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Loading orders...</p></div>';

  try {
    // Get orders from Supabase for this user
    const orders = await db.orders.getByCustomerEmail(user.email);

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h3>No orders yet</h3>
          <p style="color: var(--text-secondary);">Start shopping to see your orders here!</p>
          <button class="btn btn-primary" onclick="navigateToPage('products')">Browse Products</button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="card">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <h4 style="margin: 0;">#${order.id}</h4>
              <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
              ${formatDate(order.created_at)} • ${(order.items || []).length} item(s)
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; margin-bottom: 0.5rem;">${formatPrice(order.total)}</div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-small btn-outline" onclick="viewOrderDetails('${order.id}')">Details</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #ef4444;">
        <p>Error loading orders: ${error.message}</p>
      </div>
    `;
  }
}

async function viewOrderDetails(orderId) {
  try {
    const order = await db.orders.getById(orderId);
    
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }
    
    const items = order.items || [];
    const itemsList = items.map(item => `
      <div style="display: flex; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
        <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border-radius: 8px;">
          ${isImageUrl(item.image) ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : `<span style="font-size: 1.5rem;">${item.image || '📦'}</span>`}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${item.name}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
        </div>
      </div>
    `).join('');
    
    const modalContent = `
      <div style="padding: 1rem;">
        <h3 style="margin-bottom: 1rem;">Order #${order.id}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">${formatDate(order.created_at)}</p>
        
        <h4 style="margin-bottom: 0.5rem;">Items</h4>
        <div style="margin-bottom: 1.5rem;">${itemsList}</div>
        
        <h4 style="margin-bottom: 0.5rem;">Shipping Address</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          ${order.shipping_name || 'N/A'}<br>
          ${order.shipping_address || 'N/A'}<br>
          ${order.shipping_city || ''} - ${order.shipping_pincode || ''}<br>
          📞 ${order.shipping_phone || 'N/A'}
        </p>
        
        <h4 style="margin-bottom: 0.5rem;">Order Summary</h4>
        <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Shipping</span><span>${formatPrice(order.shipping)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Tax</span><span>${formatPrice(order.tax)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
          <span>Total</span><span>${formatPrice(order.total)}</span>
        </div>
      </div>
    `;
    
    // Use a simple alert for now, or create a modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'orderDetailsModal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <button class="modal-close" onclick="closeModal('orderDetailsModal')">&times;</button>
        ${modalContent}
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    showToast('Error loading order: ' + error.message, 'error');
  }
}

// ============================================================================
// WISHLIST PAGE
// ============================================================================

function displayWishlist() {
  const wishlist = getFromLocalStorage('wishlist') || [];
  const container = document.getElementById('wishlistItems');

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🤍</div>
        <h3>Your wishlist is empty</h3>
        <p style="color: var(--text-secondary);">Add items to your wishlist!</p>
        <button class="btn btn-primary" onclick="navigateToPage('products')">Browse Products</button>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist.map(item => `
    <div class="product-card">
      <div class="product-image">
        <div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">
          ${item.image}
        </div>
        <button class="product-wishlist active" onclick="removeFromWishlist(${item.id}); displayWishlist();">❤️</button>
      </div>
      <div class="product-info">
        <h4 class="product-name">${item.name}</h4>
        <div class="product-price">
          <span class="price-current">${formatPrice(item.price)}</span>
        </div>
        <button class="btn btn-primary btn-small" style="width: 100%;" 
                onclick="addToCartDirectly({id: ${item.id}, name: '${item.name}', price: ${item.price}, image: '${item.image}'}, 1);">
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// ACCOUNT SETTINGS
// ============================================================================

function openAccountSettings() {
  // Close the dropdown
  const dropdown = document.getElementById('dropdownMenu');
  if (dropdown) dropdown.classList.remove('active');
  
  if (!auth.isUserAuthenticated()) {
    showToast('Please login to access account settings', 'info');
    openModal('loginModal');
    return;
  }
  
  navigateToPage('account');
  loadAccountPage();
}

function loadAccountPage() {
  const user = auth.getCurrentUser();
  if (!user) return;

  // Update sidebar
  const avatar = document.getElementById('accountAvatar');
  const userName = document.getElementById('accountUserName');
  const userEmail = document.getElementById('accountUserEmail');
  
  if (avatar) avatar.textContent = user.name ? user.name[0].toUpperCase() : '👤';
  if (userName) userName.textContent = user.name || 'User';
  if (userEmail) userEmail.textContent = user.email || '';

  // Prefill profile form
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profileDob = document.getElementById('profileDob');
  const profileGender = document.getElementById('profileGender');

  if (profileName) profileName.value = user.name || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profilePhone) profilePhone.value = user.phone || '';
  if (profileDob) profileDob.value = user.dob || '';
  if (profileGender) profileGender.value = user.gender || '';

  // Load saved addresses
  loadAddresses();
}

function showAccountTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.account-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.account-nav-item').forEach(item => item.classList.remove('active'));

  // Show selected tab
  const tab = document.getElementById(tabName + 'Tab');
  if (tab) tab.classList.add('active');

  // Update nav
  event.preventDefault();
  event.target.classList.add('active');
}

function saveProfile(event) {
  event.preventDefault();

  const name = document.getElementById('profileName').value;
  const email = document.getElementById('profileEmail').value;
  const phone = document.getElementById('profilePhone').value;
  const dob = document.getElementById('profileDob').value;
  const gender = document.getElementById('profileGender').value;

  if (!name || !email) {
    showToast('Name and email are required', 'error');
    return;
  }

  // Get current user and update
  const user = auth.getCurrentUser();
  const updatedUser = {
    ...user,
    name,
    email,
    phone,
    dob,
    gender
  };

  auth.setCurrentUser(updatedUser);
  updateAuthUI(updatedUser);
  
  // Update sidebar display
  document.getElementById('accountUserName').textContent = name;
  document.getElementById('accountUserEmail').textContent = email;
  document.getElementById('accountAvatar').textContent = name[0].toUpperCase();

  showToast('Profile updated successfully!', 'success');
}

function changePassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  // In a real app, verify current password with backend
  const user = auth.getCurrentUser();
  user.password = newPassword;
  auth.setCurrentUser(user);

  // Clear form
  document.getElementById('passwordForm').reset();

  showToast('Password updated successfully!', 'success');
}

function showAddAddressForm() {
  document.getElementById('addAddressCard').style.display = 'block';
}

function hideAddAddressForm() {
  document.getElementById('addAddressCard').style.display = 'none';
  document.getElementById('addressForm').reset();
}

function saveAddress(event) {
  event.preventDefault();

  const label = document.getElementById('addressLabel').value;
  const full = document.getElementById('addressFull').value;
  const city = document.getElementById('addressCity').value;
  const pincode = document.getElementById('addressPincode').value;
  const state = document.getElementById('addressState').value;

  const address = {
    id: Date.now(),
    label,
    full,
    city,
    pincode,
    state
  };

  let addresses = getFromLocalStorage('addresses') || [];
  addresses.push(address);
  saveToLocalStorage('addresses', addresses);

  hideAddAddressForm();
  loadAddresses();
  showToast('Address saved successfully!', 'success');
}

function loadAddresses() {
  const addresses = getFromLocalStorage('addresses') || [];
  const container = document.getElementById('addressesList');
  
  if (!container) return;

  if (addresses.length === 0) {
    container.innerHTML = '<p class="text-muted">No saved addresses yet.</p>';
    return;
  }

  container.innerHTML = addresses.map(addr => `
    <div class="address-card">
      <div>
        <span class="label">${getLabelIcon(addr.label)} ${addr.label.toUpperCase()}</span>
        <p>${addr.full}<br>${addr.city}, ${addr.state} - ${addr.pincode}</p>
      </div>
      <div>
        <button class="btn btn-ghost btn-small" onclick="deleteAddress(${addr.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function getLabelIcon(label) {
  const icons = { home: '🏠', work: '🏢', other: '📍' };
  return icons[label] || '📍';
}

function deleteAddress(id) {
  let addresses = getFromLocalStorage('addresses') || [];
  addresses = addresses.filter(a => a.id !== id);
  saveToLocalStorage('addresses', addresses);
  loadAddresses();
  showToast('Address deleted', 'info');
}

// ============================================================================
// PAGE NAVIGATION OVERRIDE
// ============================================================================

const originalNavigateToPage = navigateToPage;
window.navigateToPage = function (pageId) {
  originalNavigateToPage(pageId);

  if (pageId === 'cart') {
    displayCart();
  } else if (pageId === 'wishlist') {
    displayWishlist();
  } else if (pageId === 'products') {
    applySortAndFilter();
  } else if (pageId === 'orders') {
    displayOrders();
  } else if (pageId === 'account') {
    loadAccountPage();
  }

  window.history.replaceState(null, '', `#${pageId}`);
};

// ============================================================================
// MOBILE OPTIMIZATIONS
// ============================================================================

// Add price range listener
const priceRange = document.getElementById('priceRange');
if (priceRange) {
  priceRange.addEventListener('input', (e) => {
    document.getElementById('priceValue').textContent = e.target.value;
  });
}

console.log('Customer App Loaded');
