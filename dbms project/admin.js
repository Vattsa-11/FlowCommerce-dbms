/**
 * ADMIN DASHBOARD
 * Admin panel functionality for eCommerce management
 */

// ============================================================================
// GLOBAL ADMIN STATE
// ============================================================================

let adminUser = null;
let currentAdminPage = 'dashboard';
let adminStats = {
  totalOrders: 254,
  totalRevenue: 45320.50,
  totalCustomers: 1024,
  totalProducts: 156
};

// ============================================================================
// ADMIN INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  initializeAdmin();
});

function initializeAdmin() {
  console.log('Initializing Admin Dashboard...');

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
  updateAdminThemeButton();

  // Check if admin is authenticated
  const admin = auth.getCurrentAdmin();
  if (!admin) {
    console.log('Redirecting to admin login...');
    window.location.href = 'admin.html';
    return;
  }

  adminUser = admin;
  setupAdminEventListeners();
  displayAdminDashboard();
}

function setupAdminEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('adminThemeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark-mode');
      const isDark = document.documentElement.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateAdminThemeButton();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleAdminLogout);
  }

  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const page = item.getAttribute('data-page');
      navigateAdminPage(page);
    });
  });

  // Add Product button
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      openModal('addProductModal');
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
}

function handleAdminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    auth.logoutAdmin();
    window.location.href = 'admin.html';
  }
}

function updateAdminThemeButton() {
  const themeToggle = document.getElementById('adminThemeToggle');
  if (themeToggle) {
    const isDark = document.documentElement.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '☀️' : '🌙';
  }
}

// ============================================================================
// ADMIN NAVIGATION
// ============================================================================

function navigateAdminPage(page) {
  currentAdminPage = page;

  // Update page title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      customers: 'Customers',
      database: 'Database',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    pageTitle.textContent = titles[page] || 'Dashboard';
  }

  // Update active nav item
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.sidebar-nav-item[data-page="${page}"]`)?.classList.add('active');

  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.add('hidden');
  });

  // Show selected section
  const section = document.getElementById(`${page}Section`);
  if (section) {
    section.classList.remove('hidden');
  }

  // Load page content
  switch (page) {
    case 'dashboard':
      displayAdminDashboard();
      break;
    case 'products':
      displayProductsManagement();
      break;
    case 'categories':
      displayCategoriesManagement();
      break;
    case 'orders':
      displayOrdersManagement();
      break;
    case 'customers':
      displayCustomersManagement();
      break;
    case 'database':
      displayDatabaseTools();
      break;
    case 'analytics':
      displayAnalytics();
      break;
    case 'settings':
      displayAdminSettings();
      break;
  }

  // Close mobile menu
  document.getElementById('adminSidebar')?.classList.remove('active');
}

// ============================================================================
// DASHBOARD
// ============================================================================

async function displayAdminDashboard() {
  // Get real data from Supabase
  let orders = [];
  let customers = [];
  let products = [];
  
  try {
    [orders, customers, products] = await Promise.all([
      db.orders.getAll(),
      db.customers.getAll(),
      db.products.getAll()
    ]);
    console.log('✅ Dashboard data loaded from Supabase');
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
  }
  
  // Calculate real stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  // Display stats with rupees
  document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
  document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
  document.getElementById('totalCustomers').textContent = totalCustomers.toLocaleString();
  document.getElementById('totalProducts').textContent = totalProducts.toLocaleString();

  // Display recent orders
  const recentOrders = orders.slice(0, 5);

  const recentOrdersTable = document.getElementById('recentOrdersTable');
  if (recentOrdersTable) {
    if (recentOrders.length === 0) {
      recentOrdersTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No orders yet</td></tr>`;
    } else {
      recentOrdersTable.innerHTML = recentOrders.map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.shipping_name || order.customer_name || order.customer_email || 'Customer'}</td>
          <td>${formatPrice(order.total)}</td>
          <td><span class="admin-badge status-${(order.status || 'processing').toLowerCase()}">${order.status || 'Processing'}</span></td>
          <td>${formatDate(order.created_at)}</td>
        </tr>
      `).join('');
    }
  }

  // Display top products based on order data
  const productSales = {};
  orders.forEach(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { name: item.name, sales: 0, revenue: 0 };
      }
      productSales[item.name].sales += item.quantity || 1;
      productSales[item.name].revenue += (item.price * (item.quantity || 1));
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductsTable = document.getElementById('topProductsTable');
  if (topProductsTable) {
    if (topProducts.length === 0) {
      topProductsTable.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No sales data yet</td></tr>`;
    } else {
      topProductsTable.innerHTML = topProducts.map(product => `
        <tr>
          <td>${product.name}</td>
          <td>${product.sales}</td>
          <td>${formatPrice(product.revenue)}</td>
        </tr>
      `).join('');
    }
  }
}

// ============================================================================
// PRODUCTS MANAGEMENT
// ============================================================================

async function displayProductsManagement() {
  const container = document.getElementById('productsTableBody');
  if (!container) return;

  // Show loading
  container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading products from Supabase...</td></tr>';

  // Fetch products from Supabase
  let products = [];
  
  try {
    products = await db.products.getAll();
    console.log('✅ Products loaded from Supabase:', products.length);
  } catch (error) {
    console.error('❌ Failed to fetch products from Supabase:', error);
    products = [];
  }
  
  if (products.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No products found in Supabase. <a href="migrate-to-supabase.html" target="_blank" style="color: var(--primary);">Run Migration Tool</a></td></tr>';
    return;
  }
  
  // Helper to check if image is URL
  const isImageUrl = (img) => img && (img.startsWith('http') || img.startsWith('data:'));

  container.innerHTML = products.map(product => {
    const status = product.stock > 10 ? 'Active' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock');
    const statusColor = status === 'Active' ? '#10b981' : (status === 'Low Stock' ? '#f59e0b' : '#ef4444');
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${isImageUrl(product.image) 
              ? `<img src="${product.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` 
              : `<span style="font-size: 1.5rem;">${product.image || '📦'}</span>`}
            <span style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.name}</span>
          </div>
        </td>
        <td>${formatCategoryName(product.category || '')}</td>
        <td>${formatPrice(product.price)}</td>
        <td><span style="color: ${statusColor}; font-weight: 600;">${product.stock} (${status})</span></td>
        <td>
          <button class="btn btn-outline btn-small" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn btn-outline btn-small" onclick="deleteProduct(${product.id})" style="color: var(--accent);">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function editProduct(productId) {
  let product;
  try {
    product = await db.products.getById(productId);
  } catch (error) {
    console.error('Error fetching product:', error);
  }
  
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }

  const isImageUrl = (img) => img && (img.startsWith('http') || img.startsWith('data:'));
  
  const modal = document.createElement('div');
  modal.id = 'editProductModal';
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2 class="modal-title">Edit Product</h2>
        <button class="modal-close" onclick="document.getElementById('editProductModal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Product Name</label>
          <input type="text" id="editProductName" value="${product.name}" required>
        </div>
        <div class="form-group">
          <label>Price (₹)</label>
          <input type="number" id="editProductPrice" value="${product.price}" min="0" required>
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input type="number" id="editProductStock" value="${product.stock}" min="0" required>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="editProductCategory" value="${product.category || ''}">
        </div>
        <button class="admin-btn admin-btn-primary" style="width: 100%;" onclick="saveProductEdit(${productId})">Save Changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveProductEdit(productId) {
  const name = document.getElementById('editProductName').value;
  const price = parseFloat(document.getElementById('editProductPrice').value);
  const stock = parseInt(document.getElementById('editProductStock').value);
  const category = document.getElementById('editProductCategory').value;
  const status = stock > 10 ? 'active' : (stock > 0 ? 'low_stock' : 'out_of_stock');
  
  try {
    await db.products.update(productId, { name, price, stock, category, status });
    document.getElementById('editProductModal')?.remove();
    displayProductsManagement();
    showToast('Product updated successfully!', 'success');
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Failed to update product', 'error');
  }
}

async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await db.products.delete(productId);
      showToast('Product deleted successfully', 'success');
      displayProductsManagement();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  }
}

function openProductModal() {
  // Create modal for adding products
  const modal = document.createElement('div');
  modal.id = 'addProductModal';
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; width: 90%;">
      <div class="modal-header">
        <h2 class="modal-title">Add New Product</h2>
        <button class="modal-close" onclick="closeProductModal()">&times;</button>
      </div>
      <form id="addProductForm" class="modal-body" style="max-height: 70vh; overflow-y: auto;">
        <div class="form-group">
          <label for="productName">Product Name *</label>
          <input type="text" id="productName" required placeholder="Enter product name">
        </div>
        <div class="form-group">
          <label for="productPrice">Price (₹) *</label>
          <input type="number" id="productPrice" required min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label for="productCategory">Category *</label>
          <select id="productCategory" required>
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home & Living</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
            <option value="Toys">Toys</option>
          </select>
        </div>
        <div class="form-group">
          <label for="productStock">Stock Quantity *</label>
          <input type="number" id="productStock" required min="0" placeholder="0">
        </div>
        <div class="form-group">
          <label for="productImage">Image URL</label>
          <input type="url" id="productImage" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group">
          <label for="productDescription">Description</label>
          <textarea id="productDescription" rows="4" placeholder="Enter product description"></textarea>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Add Product</button>
          <button type="button" class="btn btn-outline" style="flex: 1;" onclick="closeProductModal()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now(),
      name: document.getElementById('productName').value,
      price: parseFloat(document.getElementById('productPrice').value),
      category: document.getElementById('productCategory').value,
      stock: parseInt(document.getElementById('productStock').value),
      image: document.getElementById('productImage').value || 'https://via.placeholder.com/200',
      description: document.getElementById('productDescription').value,
      rating: 0,
      reviews: 0
    };
    
    // Add to allProducts array
    allProducts.unshift(newProduct);
    
    // Save to localStorage
    saveToLocalStorage('products', allProducts);
    
    showToast('Product added successfully!', 'success');
    closeProductModal();
    displayProductsManagement();
  });
}

function closeProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) {
    modal.remove();
  }
}

// Global variable to store the uploaded image
let uploadedProductImage = null;

// Preview product image when uploaded
function previewProductImage(input) {
  const file = input.files[0];
  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      input.value = '';
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'error');
      input.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedProductImage = e.target.result;
      
      // Show preview
      const previewContainer = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');
      const uploadPrompt = document.getElementById('uploadPrompt');
      const uploadArea = document.getElementById('imageUploadArea');
      
      if (previewContainer && previewImg) {
        previewImg.src = uploadedProductImage;
        previewContainer.style.display = 'block';
        if (uploadPrompt) uploadPrompt.style.display = 'none';
        if (uploadArea) {
          uploadArea.style.borderColor = 'var(--primary)';
          uploadArea.style.background = 'rgba(87, 106, 143, 0.05)';
        }
      }
    };
    reader.readAsDataURL(file);
  }
}

// Add new product from dashboard modal
function addNewProduct(event) {
  event.preventDefault();
  
  // Get the image - either from upload or use placeholder emoji
  let productImage = uploadedProductImage || '📦';
  
  const newProduct = {
    id: Date.now(),
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    stock: parseInt(document.getElementById('productStock').value),
    image: productImage,
    description: document.getElementById('productDescription').value || '',
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
  
  // Get existing products from localStorage
  let products = JSON.parse(localStorage.getItem('products') || '[]');
  products.unshift(newProduct);
  
  // Save to localStorage
  localStorage.setItem('products', JSON.stringify(products));
  
  showToast('Product added successfully!', 'success');
  closeModal('addProductModal');
  
  // Reset form and image preview
  document.getElementById('addProductForm').reset();
  uploadedProductImage = null;
  
  const previewContainer = document.getElementById('imagePreview');
  const uploadPrompt = document.getElementById('uploadPrompt');
  const uploadArea = document.getElementById('imageUploadArea');
  
  if (previewContainer) previewContainer.style.display = 'none';
  if (uploadPrompt) uploadPrompt.style.display = 'block';
  if (uploadArea) {
    uploadArea.style.borderColor = 'var(--border)';
    uploadArea.style.background = 'transparent';
  }
  
  // Refresh products list if on products page
  if (currentAdminPage === 'products') {
    displayProductsManagement();
  }
  
  // Update product count on dashboard
  const productCountEl = document.getElementById('totalProducts');
  if (productCountEl) {
    const currentCount = parseInt(productCountEl.textContent.replace(/,/g, '')) || 0;
    productCountEl.textContent = (currentCount + 1).toLocaleString();
  }
}

// ============================================================================
// CATEGORIES MANAGEMENT
// ============================================================================

async function displayCategoriesManagement() {
  const container = document.getElementById('categoriesTableBody');
  if (!container) return;

  container.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">Loading categories from Supabase...</td></tr>';

  // Get categories from Supabase
  let categories = [];
  
  try {
    categories = await db.categories.getAll();
    console.log('✅ Categories loaded from Supabase:', categories.length);
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error);
  }
  
  // Category icons mapping
  const categoryIcons = {
    'smartphones': '📱', 'laptops': '💻', 'fragrances': '🧴', 'skincare': '🧴',
    'groceries': '🛒', 'home-decoration': '🏠', 'furniture': '🛋️', 'tops': '👕',
    'womens-dresses': '👗', 'womens-shoes': '👠', 'mens-shirts': '👔', 'mens-shoes': '👞',
    'mens-watches': '⌚', 'womens-watches': '⌚', 'womens-bags': '👜', 'womens-jewellery': '💍',
    'sunglasses': '🕶️', 'automotive': '🚗', 'motorcycle': '🏍️', 'lighting': '💡',
    'beauty': '💄', 'electronics': '📱', 'fashion': '👗', 'sports': '⚽',
    'tablets': '📱', 'mobile-accessories': '🔌', 'kitchen-accessories': '🍳', 'sports-accessories': '⚽',
    'vehicle': '🚗', 'skin-care': '🧴', 'default': '📦'
  };
  
  const getIcon = (name) => categoryIcons[(name || '').toLowerCase()] || categoryIcons.default;
  
  if (categories.length === 0) {
    container.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">No categories found. <a href="migrate-to-supabase.html" target="_blank" style="color: var(--primary);">Run Migration Tool</a></td></tr>';
    return;
  }

  container.innerHTML = categories.map(category => `
    <tr>
      <td>${getIcon(category.name)} ${formatCategoryName(category.name || '')}</td>
      <td>${category.product_count || 0}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="editCategory(${category.id}, '${category.name}', '${getIcon(category.name)}')">Edit</button>
      </td>
    </tr>
  `).join('');
}

function formatCategoryName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function editCategory(categoryId, name, icon) {
  // Create edit modal
  const modalHtml = `
    <div id="editCategoryModal" class="modal active">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h2 class="modal-title">Edit Category</h2>
          <button class="modal-close" onclick="closeModal('editCategoryModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Category Name</label>
            <input type="text" id="editCategoryName" value="${name}">
          </div>
          <div class="form-group">
            <label>Icon (emoji)</label>
            <input type="text" id="editCategoryIcon" value="${icon}">
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary" style="flex: 1;" onclick="saveCategoryEdit(${categoryId})">Save Changes</button>
            <button class="btn btn-outline" style="flex: 1;" onclick="closeModal('editCategoryModal')">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function saveCategoryEdit(categoryId) {
  const name = document.getElementById('editCategoryName').value;
  const icon = document.getElementById('editCategoryIcon').value;
  
  if (!name.trim()) {
    showToast('Please enter a category name', 'error');
    return;
  }
  
  showToast(`Category "${name}" updated successfully!`, 'success');
  closeModal('editCategoryModal');
  document.getElementById('editCategoryModal')?.remove();
}

function openAddCategoryModal() {
  const modalHtml = `
    <div id="addCategoryModal" class="modal active">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h2 class="modal-title">Add New Category</h2>
          <button class="modal-close" onclick="closeModal('addCategoryModal'); document.getElementById('addCategoryModal')?.remove();">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Category Name *</label>
            <input type="text" id="newCategoryName" placeholder="e.g. Electronics">
          </div>
          <div class="form-group">
            <label>Icon (emoji) *</label>
            <input type="text" id="newCategoryIcon" placeholder="e.g. 📱">
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary" style="flex: 1;" onclick="addNewCategory()">Add Category</button>
            <button class="btn btn-outline" style="flex: 1;" onclick="closeModal('addCategoryModal'); document.getElementById('addCategoryModal')?.remove();">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function addNewCategory() {
  const name = document.getElementById('newCategoryName').value;
  const icon = document.getElementById('newCategoryIcon').value;
  
  if (!name.trim() || !icon.trim()) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  showToast(`Category "${name}" added successfully!`, 'success');
  closeModal('addCategoryModal');
  document.getElementById('addCategoryModal')?.remove();
}

function deleteCategory(categoryId) {
  if (confirm('Are you sure you want to delete this category?')) {
    showToast('Category deleted successfully', 'success');
    displayCategoriesManagement();
  }
}

// ============================================================================
// ORDERS MANAGEMENT
// ============================================================================

async function displayOrdersManagement() {
  const container = document.getElementById('ordersTableBody');
  if (!container) return;

  container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading orders from Supabase...</td></tr>';

  // Get real orders from Supabase
  let orders = [];
  try {
    orders = await db.orders.getAll();
    console.log('✅ Orders loaded from Supabase:', orders.length);
  } catch (error) {
    console.error('❌ Error loading orders:', error);
  }

  if (orders.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No orders yet. Orders will appear here when customers place them.</td></tr>';
    return;
  }

  container.innerHTML = orders.map(order => {
    const statusColors = { 'Processing': '#3b82f6', 'Shipped': '#8b5cf6', 'Delivered': '#10b981', 'Pending': '#f59e0b', 'Cancelled': '#ef4444' };
    const status = order.status || 'Processing';
    const statusColor = statusColors[status] || '#6b7280';
    // Use individual shipping fields from Supabase
    const customerName = order.shipping_name || order.customer_name || order.customer_email || 'Customer';
    const items = Array.isArray(order.items) ? order.items : [];
    return `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>${customerName}</td>
        <td>${items.length || 0} items</td>
        <td>${formatPrice(order.total)}</td>
        <td><span style="color: ${statusColor}; font-weight: 600;">${status}</span></td>
        <td>
          <button class="btn btn-outline btn-small" onclick="viewAdminOrderDetails('${order.id}')">View</button>
          <button class="btn btn-outline btn-small" onclick="updateOrderStatus('${order.id}')">Update</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function viewAdminOrderDetails(orderId) {
  let order;
  try {
    order = await db.orders.getById(orderId);
  } catch (error) {
    console.error('Error fetching order:', error);
  }
  
  if (!order) {
    showToast('Order not found', 'error');
    return;
  }

  const isImageUrl = (img) => img && (img.startsWith('http') || img.startsWith('data:'));
  const items = Array.isArray(order.items) ? order.items : [];
  // Build shipping address from individual fields
  const shippingAddress = {
    name: order.shipping_name || order.customer_name || 'Customer',
    email: order.shipping_email || order.customer_email || '',
    phone: order.shipping_phone || '',
    address: order.shipping_address || '',
    city: order.shipping_city || '',
    pincode: order.shipping_pincode || ''
  };
  
  const itemsList = items.map(item => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          ${isImageUrl(item.image) 
            ? `<img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` 
            : `<span>${item.image || '📦'}</span>`}
          ${item.name}
        </div>
      </td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');
  
  // Store for modal to access
  window.currentOrderDetails = { order, shippingAddress };
  
  const modal = document.createElement('div');
  modal.id = 'adminOrderModal';
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h2 class="modal-title">Order #${order.id}</h2>
        <button class="modal-close" onclick="document.getElementById('adminOrderModal').remove()">&times;</button>
      </div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Customer</p>
            <p style="font-weight: 600;">${shippingAddress?.name || order.customer_name || 'N/A'}</p>
          </div>
          <div>
            <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Email</p>
            <p style="font-weight: 600;">${shippingAddress?.email || order.customer_email || 'N/A'}</p>
          </div>
          <div>
            <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Phone</p>
            <p style="font-weight: 600;">${shippingAddress?.phone || 'N/A'}</p>
          </div>
          <div>
            <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">Status</p>
            <p><span class="admin-badge status-${(order.status || 'processing').toLowerCase()}">${order.status || 'Processing'}</span></p>
          </div>
        </div>
        
        <h4 style="margin-bottom: 0.5rem;">Shipping Address</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          ${shippingAddress?.address || 'N/A'}<br>
          ${shippingAddress?.city || ''} - ${shippingAddress?.pincode || ''}
        </p>
        
        <h4 style="margin-bottom: 0.5rem;">Order Items</h4>
        <table class="admin-table" style="margin-bottom: 1.5rem;">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Shipping</span><span>${formatPrice(order.shipping)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Tax</span><span>${formatPrice(order.tax)}</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: 700; padding-top: 0.5rem; border-top: 1px solid var(--border);"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function updateOrderStatus(orderId) {
  let order;
  try {
    order = await db.orders.getById(orderId);
  } catch (error) {
    console.error('Error fetching order:', error);
  }
  
  if (!order) {
    showToast('Order not found', 'error');
    return;
  }

  const currentStatus = order.status || 'Processing';
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  const modal = document.createElement('div');
  modal.id = 'updateStatusModal';
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h2 class="modal-title">Update Order Status</h2>
        <button class="modal-close" onclick="document.getElementById('updateStatusModal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 1rem;">Order: <strong>#${orderId}</strong></p>
        <div class="form-group">
          <label>New Status</label>
          <select id="newOrderStatus">
            ${statuses.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <button class="admin-btn admin-btn-primary" style="width: 100%;" onclick="saveOrderStatus('${orderId}')">Update Status</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveOrderStatus(orderId) {
  const newStatus = document.getElementById('newOrderStatus').value;
  
  try {
    await db.orders.updateStatus(orderId, newStatus);
    document.getElementById('updateStatusModal')?.remove();
    displayOrdersManagement();
    showToast(`Order #${orderId} status updated to "${newStatus}"`, 'success');
  } catch (error) {
    console.error('Error updating order status:', error);
    showToast('Failed to update order status', 'error');
  }
}

function viewOrderDetails(orderId) {
  viewAdminOrderDetails(orderId.replace('#', ''));
}

// ============================================================================
// CUSTOMERS MANAGEMENT
// ============================================================================

async function displayCustomersManagement() {
  const container = document.getElementById('customersTableBody');
  if (!container) return;
  
  container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading customers from Supabase...</td></tr>';

  // Get data from Supabase
  let registeredCustomers = [];
  let orders = [];
  
  try {
    [registeredCustomers, orders] = await Promise.all([
      db.customers.getAll(),
      db.orders.getAll()
    ]);
    console.log('✅ Customers data loaded from Supabase');
  } catch (error) {
    console.error('❌ Error loading customers:', error);
  }
  
  const customerMap = {};
  
  // First add registered customers
  registeredCustomers.forEach((customer) => {
    customerMap[customer.email] = {
      id: customer.id,
      name: customer.name || 'Unknown',
      email: customer.email,
      phone: customer.phone || 'N/A',
      orders: 0,
      totalSpent: 0,
      createdAt: customer.created_at || new Date().toISOString()
    };
  });
  
  // Then update with order data
  orders.forEach(order => {
    // Use individual shipping fields from Supabase
    const email = order.shipping_email || order.customer_email;
    if (email) {
      if (!customerMap[email]) {
        customerMap[email] = {
          id: Object.keys(customerMap).length + 1,
          name: order.shipping_name || order.customer_name || 'Unknown',
          email: email,
          phone: order.shipping_phone || 'N/A',
          orders: 0,
          totalSpent: 0,
          createdAt: order.created_at
        };
      }
      customerMap[email].orders++;
      customerMap[email].totalSpent += parseFloat(order.total) || 0;
    }
  });
  
  const allCustomers = Object.values(customerMap);
  
  if (allCustomers.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No customers yet. Customers will appear here when they register or place orders.</td></tr>';
    return;
  }
  
  container.innerHTML = allCustomers.map(customer => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">${customer.name[0]?.toUpperCase() || '?'}</div>
          ${customer.name}
        </div>
      </td>
      <td>${customer.email}</td>
      <td>${customer.orders || 0}</td>
      <td>${formatPrice(customer.totalSpent)}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="viewCustomerDetails('${customer.email}')">View</button>
      </td>
    </tr>
  `).join('');
  
  // Update customer count in dashboard stats
  const customerCountEl = document.getElementById('totalCustomers');
  if (customerCountEl) {
    customerCountEl.textContent = allCustomers.length.toLocaleString();
  }
}

async function viewCustomerDetails(customerEmail) {
  // Get data from Supabase
  let registeredCustomers = [];
  let orders = [];
  
  try {
    [registeredCustomers, orders] = await Promise.all([
      db.customers.getAll(),
      db.orders.getAll()
    ]);
  } catch (error) {
    console.error('Error loading customer details:', error);
  }
  
  const customerMap = {};
  
  // First add registered customers
  registeredCustomers.forEach((customer) => {
    customerMap[customer.email] = {
      id: customer.id,
      name: customer.name || 'Unknown',
      email: customer.email,
      phone: customer.phone || 'N/A',
      address: '',
      city: '',
      orders: 0,
      totalSpent: 0,
      createdAt: customer.created_at || new Date().toISOString(),
      orderHistory: []
    };
  });
  
  // Then update with order data
  orders.forEach(order => {
    // Use individual shipping fields from Supabase
    const email = order.shipping_email || order.customer_email;
    if (email) {
      if (!customerMap[email]) {
        customerMap[email] = {
          id: Object.keys(customerMap).length + 1,
          name: order.shipping_name || order.customer_name || 'Unknown',
          email: email,
          phone: order.shipping_phone || 'N/A',
          address: order.shipping_address || '',
          city: order.shipping_city || '',
          orders: 0,
          totalSpent: 0,
          createdAt: order.created_at,
          orderHistory: []
        };
      }
      customerMap[email].orders++;
      customerMap[email].totalSpent += parseFloat(order.total) || 0;
      customerMap[email].address = order.shipping_address || customerMap[email].address;
      customerMap[email].city = order.shipping_city || customerMap[email].city;
      customerMap[email].orderHistory.push(order);
    }
  });
  
  const customer = customerMap[customerEmail];
  
  if (customer) {
    const recentOrders = customer.orderHistory.slice(0, 5);
    const modalHtml = `
      <div id="viewCustomerModal" class="modal active">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2 class="modal-title">Customer Details</h2>
            <button class="modal-close" onclick="document.getElementById('viewCustomerModal').remove()">&times;</button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <div style="width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">${customer.name[0]?.toUpperCase() || '?'}</div>
              <h3>${customer.name}</h3>
              <p style="color: var(--text-secondary);">${customer.email}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700;">${customer.orders}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Orders</div>
              </div>
              <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700;">${formatPrice(customer.totalSpent)}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Spent</div>
              </div>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <h4 style="margin-bottom: 0.5rem;">Contact Information</h4>
              <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 0.5rem;">
                <p style="margin: 0.25rem 0;">📞 ${customer.phone}</p>
                <p style="margin: 0.25rem 0;">📍 ${customer.address}, ${customer.city}</p>
              </div>
            </div>
            <h4 style="margin-bottom: 0.5rem;">Recent Orders</h4>
            ${recentOrders.length === 0 ? '<p style="color: var(--text-secondary);">No orders yet</p>' :
              recentOrders.map(order => `
                <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600;">#${order.id}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${formatDate(order.date)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 600;">${formatPrice(order.total)}</div>
                    <span class="admin-badge status-${order.status.toLowerCase()}">${order.status}</span>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } else {
    showToast('Customer details not available', 'info');
  }
}

// ============================================================================
// DATABASE TOOLS
// ============================================================================

async function displayDatabaseTools() {
  const container = document.getElementById('databaseTools');
  if (!container) return;

  // Show loading initially
  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Loading database stats from Supabase...</p></div>';

  try {
    // Fetch real stats from Supabase
    const [products, orders, customers, categories] = await Promise.all([
      db.products.getAll(),
      db.orders.getAll(),
      db.customers.getAll(),
      db.categories.getAll()
    ]);
    
    const totalRecords = products.length + orders.length + customers.length + categories.length;

    container.innerHTML = `
      <div class="admin-section">
        <h3>🗄️ Supabase Data Explorer</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Connected to: ${SUPABASE_URL}</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
          <button class="admin-btn" onclick="viewSupabaseData('products')">Products (${products.length})</button>
          <button class="admin-btn" onclick="viewSupabaseData('orders')">Orders (${orders.length})</button>
          <button class="admin-btn" onclick="viewSupabaseData('customers')">Customers (${customers.length})</button>
          <button class="admin-btn" onclick="viewSupabaseData('categories')">Categories (${categories.length})</button>
        </div>
        <div id="dataViewer" style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; display: none; max-height: 400px; overflow: auto;"></div>
      </div>

      <div class="admin-section" style="margin-top: 2rem;">
        <h3>📦 Database Backup</h3>
        <button class="admin-btn" onclick="exportDatabase()">📥 Export All Data</button>
        <input type="file" id="importFile" style="display: none;" onchange="handleImportFile(event)">
        <button class="admin-btn" style="margin-left: 0.5rem;" onclick="document.getElementById('importFile').click()">📤 Import Data</button>
      </div>

      <div class="admin-section" style="margin-top: 2rem;">
        <h3>📊 Database Statistics</h3>
        <div id="dbStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;"></div>
      </div>
    `;

    // Display real database stats
    const stats = {
      'Products': products.length,
      'Orders': orders.length,
      'Customers': customers.length,
      'Categories': categories.length,
      'Total Records': totalRecords,
      'Database': 'Supabase (PostgreSQL)'
    };

    const statsContainer = document.getElementById('dbStats');
    if (statsContainer) {
      statsContainer.innerHTML = Object.entries(stats).map(([key, value]) => `
        <div class="admin-card" style="padding: 1rem;">
          <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${key}</div>
          <div style="font-size: 1.3rem; font-weight: 700;">${value}</div>
        </div>
      `).join('');
    }
  } catch (error) {
    container.innerHTML = `
      <div style="color: #ef4444; padding: 2rem; text-align: center;">
        <h3>⚠️ Database Connection Error</h3>
        <p>${error.message}</p>
        <p style="margin-top: 1rem; color: var(--text-secondary);">Please check your Supabase configuration in config.js</p>
      </div>
    `;
  }
}

async function viewSupabaseData(table) {
  const viewer = document.getElementById('dataViewer');
  if (!viewer) return;
  
  viewer.style.display = 'block';
  viewer.innerHTML = '<p>Loading data...</p>';
  
  try {
    let data = [];
    switch (table) {
      case 'products': data = await db.products.getAll(); break;
      case 'orders': data = await db.orders.getAll(); break;
      case 'customers': data = await db.customers.getAll(); break;
      case 'categories': data = await db.categories.getAll(); break;
    }
    
    viewer.innerHTML = `
      <h4 style="margin-bottom: 1rem;">${table} (${data.length} records)</h4>
      <pre style="white-space: pre-wrap; word-break: break-all; font-size: 0.85rem;">${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (error) {
    viewer.innerHTML = `<div style="color: #ef4444;">Error loading ${table}: ${error.message}</div>`;
  }
}

function clearAllData() {
  if (confirm('⚠️ This will delete ALL data including products, orders, cart, wishlist, and addresses. Are you sure?')) {
    if (confirm('This action cannot be undone. Type YES to confirm.')) {
      localStorage.removeItem('adminProducts');
      localStorage.removeItem('orders');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem('addresses');
      showToast('All data cleared successfully', 'success');
      displayDatabaseTools();
    }
  }
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.adminProducts) saveToLocalStorage('adminProducts', data.adminProducts);
      if (data.orders) saveToLocalStorage('orders', data.orders);
      if (data.cart) saveToLocalStorage('cart', data.cart);
      if (data.wishlist) saveToLocalStorage('wishlist', data.wishlist);
      if (data.addresses) saveToLocalStorage('addresses', data.addresses);
      showToast('Data imported successfully!', 'success');
      displayDatabaseTools();
    } catch (err) {
      showToast('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
}

async function executeSqlQuery() {
  const query = document.getElementById('sqlQuery').value.trim();
  if (!query) {
    showToast('Please enter a SQL query', 'error');
    return;
  }

  const startTime = performance.now();
  const resultDiv = document.getElementById('queryResult');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<div style="color: var(--text-secondary);">Executing query on Supabase...</div>';

  try {
    const result = await parseAndExecuteSQL(query);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    resultDiv.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <strong style="color: #10b981;">✓ Query executed on Supabase!</strong>
        <span style="color: var(--text-secondary); margin-left: 1rem;">${result.rowCount} row(s) returned in ${duration}ms</span>
      </div>
      ${result.html}
    `;
    showToast(`Query executed in ${duration}ms`, 'success');
  } catch (error) {
    resultDiv.innerHTML = `
      <div style="color: #ef4444;">
        <strong>✗ Query Error:</strong> ${error.message}
      </div>
    `;
    showToast('Query failed', 'error');
  }
}

async function parseAndExecuteSQL(query) {
  const q = query.toLowerCase().trim();
  
  // Determine table and get data from Supabase
  let data = [];
  let tableName = '';
  
  if (q.includes('from products') || q.includes('from adminproducts')) {
    data = await db.products.getAll();
    tableName = 'products';
  } else if (q.includes('from orders')) {
    data = await db.orders.getAll();
    tableName = 'orders';
  } else if (q.includes('from customers')) {
    data = await db.customers.getAll();
    tableName = 'customers';
  } else if (q.includes('from categories')) {
    data = await db.categories.getAll();
    tableName = 'categories';
  } else if (q.includes('from cart')) {
    data = await db.cart.getItems();
    tableName = 'cart';
  } else if (q.includes('from wishlist')) {
    data = await db.wishlist.getItems();
    tableName = 'wishlist';
  } else if (q.startsWith('show tables')) {
    return await showTables();
  } else if (q.startsWith('describe') || q.startsWith('desc ')) {
    return describeTable(q);
  } else {
    throw new Error('Unknown table. Available tables: products, orders, customers, categories, cart, wishlist');
  }

  // Handle COUNT(*)
  if (q.includes('count(*)')) {
    const count = data.length;
    return {
      rowCount: 1,
      html: renderTable([{ count: count }], ['count'])
    };
  }

  // Handle SUM(total) for orders
  if (q.includes('sum(total)') && tableName === 'orders') {
    const sum = data.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0);
    return {
      rowCount: 1,
      html: renderTable([{ total_revenue: formatPrice(sum) }], ['total_revenue'])
    };
  }

  // Handle AVG(total) for orders
  if (q.includes('avg(total)') && tableName === 'orders') {
    const avg = data.length > 0 ? data.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0) / data.length : 0;
    return {
      rowCount: 1,
      html: renderTable([{ avg_order_value: formatPrice(avg) }], ['avg_order_value'])
    };
  }

  // Handle WHERE clause
  if (q.includes('where')) {
    data = applyWhereClause(data, q, tableName);
  }

  // Handle ORDER BY
  if (q.includes('order by')) {
    data = applyOrderBy(data, q);
  }

  // Handle LIMIT
  const limitMatch = q.match(/limit\s+(\d+)/);
  if (limitMatch) {
    data = data.slice(0, parseInt(limitMatch[1]));
  }

  // Handle GROUP BY for categories
  if (q.includes('group by category') && tableName === 'products') {
    const groups = {};
    data.forEach(p => {
      const cat = p.category || 'Other';
      groups[cat] = (groups[cat] || 0) + 1;
    });
    const grouped = Object.entries(groups).map(([category, count]) => ({ category, count }));
    return {
      rowCount: grouped.length,
      html: renderTable(grouped, ['category', 'count'])
    };
  }

  // Handle GROUP BY status for orders
  if (q.includes('group by status') && tableName === 'orders') {
    const groups = {};
    data.forEach(o => {
      const status = o.status || 'Unknown';
      groups[status] = (groups[status] || 0) + 1;
    });
    const grouped = Object.entries(groups).map(([status, count]) => ({ status, count }));
    return {
      rowCount: grouped.length,
      html: renderTable(grouped, ['status', 'count'])
    };
  }

  // Determine columns to display
  let columns = getColumnsForTable(tableName);
  
  // Handle SELECT specific columns
  const selectMatch = query.match(/select\s+(.+?)\s+from/i);
  if (selectMatch && !selectMatch[1].includes('*')) {
    columns = selectMatch[1].split(',').map(c => c.trim().toLowerCase());
  }

  return {
    rowCount: data.length,
    html: renderTable(data, columns)
  };
}

async function showTables() {
  const [products, orders, customers, categories] = await Promise.all([
    db.products.getAll(),
    db.orders.getAll(),
    db.customers.getAll(),
    db.categories.getAll()
  ]);
  
  const tables = [
    { table_name: 'products', records: products.length },
    { table_name: 'orders', records: orders.length },
    { table_name: 'customers', records: customers.length },
    { table_name: 'categories', records: categories.length }
  ];
  return {
    rowCount: tables.length,
    html: renderTable(tables, ['table_name', 'records'])
  };
}

function describeTable(query) {
  const tableMatch = query.match(/(?:describe|desc)\s+(\w+)/i);
  if (!tableMatch) throw new Error('Usage: DESCRIBE table_name');
  
  const schemas = {
    products: ['id', 'name', 'category', 'price', 'stock', 'brand', 'description', 'image', 'rating', 'created_at'],
    orders: ['id', 'customer_email', 'items', 'subtotal', 'tax', 'shipping', 'total', 'status', 'payment_method', 'created_at'],
    customers: ['id', 'email', 'full_name', 'phone', 'address', 'city', 'state', 'pincode', 'country', 'created_at'],
    categories: ['id', 'name', 'slug', 'description', 'product_count', 'created_at'],
    cart: ['id', 'customer_id', 'product_id', 'quantity', 'created_at'],
    wishlist: ['id', 'customer_id', 'product_id', 'created_at']
  };
  
  const table = tableMatch[1].toLowerCase();
  const cols = schemas[table];
  if (!cols) throw new Error(`Unknown table: ${table}. Available: products, orders, customers, categories, cart, wishlist`);
  
  const rows = cols.map(col => ({ column_name: col, type: 'VARCHAR' }));
  return {
    rowCount: rows.length,
    html: renderTable(rows, ['column_name', 'type'])
  };
}

function getColumnsForTable(table) {
  const columnMap = {
    products: ['id', 'name', 'category', 'price', 'stock', 'brand'],
    orders: ['id', 'customer_email', 'total', 'status', 'created_at'],
    customers: ['id', 'email', 'full_name', 'phone', 'city'],
    categories: ['id', 'name', 'slug', 'product_count'],
    cart: ['id', 'product_id', 'quantity'],
    wishlist: ['id', 'product_id']
  };
  return columnMap[table] || ['id', 'name'];
}

function applyWhereClause(data, query, tableName) {
  // Simple WHERE parsing
  const whereMatch = query.match(/where\s+(\w+)\s*(=|<|>|<=|>=|like)\s*['"]?([^'";\s]+)['"]?/i);
  if (!whereMatch) return data;
  
  const [, field, operator, value] = whereMatch;
  
  return data.filter(row => {
    let rowValue = row[field];
    
    // Handle nested fields like shippingAddress.name
    if (tableName === 'orders' && field === 'customer') {
      rowValue = row.shippingAddress?.name;
    }
    
    if (rowValue === undefined) return false;
    
    const numValue = parseFloat(value);
    const rowNum = parseFloat(rowValue);
    
    switch (operator.toLowerCase()) {
      case '=': return String(rowValue).toLowerCase() === value.toLowerCase();
      case '<': return rowNum < numValue;
      case '>': return rowNum > numValue;
      case '<=': return rowNum <= numValue;
      case '>=': return rowNum >= numValue;
      case 'like': return String(rowValue).toLowerCase().includes(value.toLowerCase().replace(/%/g, ''));
      default: return true;
    }
  });
}

function applyOrderBy(data, query) {
  const orderMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
  if (!orderMatch) return data;
  
  const [, field, direction = 'asc'] = orderMatch;
  const isDesc = direction.toLowerCase() === 'desc';
  
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return isDesc ? bVal - aVal : aVal - bVal;
    }
    
    const comparison = String(aVal || '').localeCompare(String(bVal || ''));
    return isDesc ? -comparison : comparison;
  });
}

function renderTable(data, columns) {
  if (data.length === 0) {
    return '<p style="color: var(--text-secondary);">No results found.</p>';
  }
  
  const maxRows = 50; // Limit display
  const displayData = data.slice(0, maxRows);
  
  let html = '<div style="overflow-x: auto;"><table class="admin-table" style="font-size: 0.85rem;"><thead><tr>';
  columns.forEach(col => {
    html += `<th>${col.toUpperCase()}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  displayData.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      let value = row[col];
      
      // Format special values
      if (col === 'price' || col === 'total' || col === 'total_spent') {
        value = formatPrice(value || 0);
      } else if (col === 'date') {
        value = formatDate(value);
      } else if (col === 'items' && Array.isArray(value)) {
        value = value.length + ' items';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value).substring(0, 50) + '...';
      }
      
      html += `<td>${value ?? 'NULL'}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  if (data.length > maxRows) {
    html += `<p style="color: var(--text-secondary); margin-top: 0.5rem;">Showing first ${maxRows} of ${data.length} rows.</p>`;
  }
  
  return html;
}

async function exportDatabase() {
  showLoading();

  try {
    const [products, orders, customers, categories] = await Promise.all([
      db.products.getAll(),
      db.orders.getAll(),
      db.customers.getAll(),
      db.categories.getAll()
    ]);

    const exportData = {
      products: products,
      orders: orders,
      customers: customers,
      categories: categories,
      exportDate: new Date().toISOString(),
      source: 'Supabase'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowcommerce_supabase_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    hideLoading();
    showToast('Database exported from Supabase successfully!', 'success');
  } catch (error) {
    hideLoading();
    showToast('Export failed: ' + error.message, 'error');
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

async function displayAnalytics() {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Loading analytics from Supabase...</p></div>';

  try {
    // Get real data from Supabase
    const [orders, products] = await Promise.all([
      db.orders.getAll(),
      db.products.getAll()
    ]);
    
    // Calculate order status distribution
    const statusCounts = { Processing: 0, Shipped: 0, Delivered: 0, Pending: 0, Cancelled: 0 };
    orders.forEach(o => {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    });
    
    // Calculate revenue by date (last 7 days)
    const revenueByDate = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenueByDate[dateStr] = 0;
    }
    orders.forEach(o => {
      const dateStr = o.created_at?.split('T')[0];
      if (revenueByDate[dateStr] !== undefined) {
        revenueByDate[dateStr] += parseFloat(o.total) || 0;
      }
    });
    
    // Calculate category distribution
    const categoryCount = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    
    // Total revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="admin-card" style="text-align: center;">
          <div style="font-size: 2rem;">💰</div>
          <div style="font-size: 1.5rem; font-weight: 700;">${formatPrice(totalRevenue)}</div>
          <div style="color: var(--text-secondary);">Total Revenue</div>
        </div>
        <div class="admin-card" style="text-align: center;">
          <div style="font-size: 2rem;">📦</div>
          <div style="font-size: 1.5rem; font-weight: 700;">${orders.length}</div>
          <div style="color: var(--text-secondary);">Total Orders</div>
        </div>
        <div class="admin-card" style="text-align: center;">
          <div style="font-size: 2rem;">📊</div>
          <div style="font-size: 1.5rem; font-weight: 700;">${formatPrice(avgOrderValue)}</div>
          <div style="color: var(--text-secondary);">Avg Order Value</div>
        </div>
        <div class="admin-card" style="text-align: center;">
          <div style="font-size: 2rem;">🛍️</div>
          <div style="font-size: 1.5rem; font-weight: 700;">${products.length}</div>
          <div style="color: var(--text-secondary);">Total Products</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="admin-card">
          <h4>Revenue (Last 7 Days)</h4>
          <div style="margin-top: 1rem;">
            ${Object.entries(revenueByDate).map(([date, revenue]) => {
              const maxRevenue = Math.max(...Object.values(revenueByDate), 1);
              const width = (revenue / maxRevenue) * 100;
              return `
                <div style="display: flex; align-items: center; margin: 0.5rem 0;">
                  <span style="width: 80px; font-size: 0.85rem;">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 24px; overflow: hidden;">
                    <div style="background: var(--primary); height: 100%; width: ${width}%; transition: width 0.3s;"></div>
                  </div>
                  <span style="width: 80px; text-align: right; font-size: 0.85rem;">${formatPrice(revenue)}</span>
                </div>
              `;
          }).join('')}
        </div>
      </div>
      
      <div class="admin-card">
        <h4>Order Status Distribution</h4>
        <div style="margin-top: 1rem;">
          ${Object.entries(statusCounts).filter(([_, count]) => count > 0 || _ === 'Processing').map(([status, count]) => {
            const total = orders.length || 1;
            const percent = ((count / total) * 100).toFixed(1);
            const colors = { Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#10b981', Pending: '#f59e0b', Cancelled: '#ef4444' };
            return `
              <div style="margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span>${status}</span>
                  <span>${count} (${percent}%)</span>
                </div>
                <div style="background: var(--bg-secondary); border-radius: 4px; height: 8px; overflow: hidden;">
                  <div style="background: ${colors[status]}; height: 100%; width: ${percent}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="admin-card">
        <h4>Top Categories</h4>
        <div style="margin-top: 1rem;">
          ${topCategories.length === 0 ? '<p style="color: var(--text-secondary);">No products yet</p>' :
            topCategories.map(([cat, count]) => `
              <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                <span>${formatCategoryName(cat)}</span>
                <span style="font-weight: 600;">${count} products</span>
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>
  `;
  } catch (error) {
    container.innerHTML = `
      <div style="color: #ef4444; padding: 2rem; text-align: center;">
        <h3>⚠️ Error Loading Analytics</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// ============================================================================
// ADMIN SETTINGS
// ============================================================================

function displayAdminSettings() {
  const container = document.getElementById('settingsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-card">
      <h3>Admin Profile</h3>
      <div style="margin-bottom: 1rem;">
        <p><strong>Name:</strong> ${adminUser.name}</p>
        <p><strong>Email:</strong> ${adminUser.email}</p>
        <p><strong>Role:</strong> Database Administrator</p>
      </div>
      <button class="admin-btn" onclick="editAdminProfile()">Edit Profile</button>
    </div>

    <div class="admin-card" style="margin-top: 1.5rem;">
      <h3>Email Notifications</h3>
      <div style="margin: 1rem 0;">
        <label style="display: flex; align-items: center; margin: 0.5rem 0;">
          <input type="checkbox" checked> New Orders
        </label>
        <label style="display: flex; align-items: center; margin: 0.5rem 0;">
          <input type="checkbox" checked> Low Stock Alerts
        </label>
        <label style="display: flex; align-items: center; margin: 0.5rem 0;">
          <input type="checkbox"> Daily Reports
        </label>
      </div>
      <button class="admin-btn" onclick="saveNotificationSettings()">Save Settings</button>
    </div>

    <div class="admin-card" style="margin-top: 1.5rem;">
      <h3>Store Settings</h3>
      <div style="margin: 1rem 0;">
        <label style="display: block; margin-bottom: 1rem;">
          <span style="display: block; margin-bottom: 0.5rem;">Store Name:</span>
          <input type="text" value="FlowCommerce" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.25rem;">
        </label>
        <label style="display: block; margin-bottom: 1rem;">
          <span style="display: block; margin-bottom: 0.5rem;">Currency:</span>
          <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.25rem;">
            <option selected>INR (₹)</option>
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </label>
      </div>
      <button class="admin-btn" onclick="saveStoreSettings()">Save Settings</button>
    </div>
  `;
}

function editAdminProfile() {
  showToast('Edit profile feature coming soon', 'info');
}

function saveNotificationSettings() {
  showToast('Notification settings saved', 'success');
}

function saveStoreSettings() {
  showToast('Store settings saved', 'success');
}

function saveSettings() {
  const storeName = document.getElementById('storeName')?.value;
  const currency = document.getElementById('storeCurrency')?.value;
  const email = document.getElementById('storeEmail')?.value;
  
  if (storeName) {
    localStorage.setItem('storeName', storeName);
  }
  if (currency) {
    localStorage.setItem('storeCurrency', currency);
  }
  if (email) {
    localStorage.setItem('storeEmail', email);
  }
  
  showToast('Settings saved successfully!', 'success');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function getFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function showLoading() {
  let loader = document.getElementById('adminLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'adminLoader';
    loader.className = 'loading-overlay';
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

function hideLoading() {
  const loader = document.getElementById('adminLoader');
  if (loader) loader.style.display = 'none';
}

console.log('Admin Dashboard Loaded');
