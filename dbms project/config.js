/**
 * SUPABASE DATABASE CONFIGURATION
 * Complete database integration for FlowCommerce
 */

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

const SUPABASE_CONFIG = {
  url: 'https://iyddgoxxvygfavgoxzrf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZGRnb3h4dnlnZmF2Z294enJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjQ5MjksImV4cCI6MjA4NjAwMDkyOX0.a9RYYOLJ9MdFeZGSXDmu6zgIcsELJZ-fXWVDOZ2mMEs'
};

// Helper function for Supabase REST API calls
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase error (${endpoint}):`, errorText);
      throw new Error(errorText);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`Supabase request failed (${endpoint}):`, error);
    throw error;
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

const db = {
  // ========================================================================
  // PRODUCTS
  // ========================================================================
  products: {
    async getAll(filters = {}) {
      try {
        let query = 'products?select=*';
        
        if (filters.category) {
          query += `&category=eq.${encodeURIComponent(filters.category)}`;
        }
        if (filters.status) {
          query += `&status=eq.${filters.status}`;
        }
        if (filters.minPrice) {
          query += `&price=gte.${filters.minPrice}`;
        }
        if (filters.maxPrice) {
          query += `&price=lte.${filters.maxPrice}`;
        }
        if (filters.search) {
          query += `&or=(name.ilike.%${encodeURIComponent(filters.search)}%,description.ilike.%${encodeURIComponent(filters.search)}%)`;
        }
        if (filters.orderBy) {
          const dir = filters.orderDir === 'desc' ? '.desc' : '.asc';
          query += `&order=${filters.orderBy}${dir}`;
        }
        if (filters.limit) {
          query += `&limit=${filters.limit}`;
        }
        if (filters.offset) {
          query += `&offset=${filters.offset}`;
        }

        const products = await supabaseRequest(query);
        return products || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },

    async getById(id) {
      try {
        const products = await supabaseRequest(`products?id=eq.${id}&select=*`);
        return products?.[0] || null;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },

    async search(query) {
      try {
        const products = await supabaseRequest(
          `products?or=(name.ilike.%${encodeURIComponent(query)}%,description.ilike.%${encodeURIComponent(query)}%,brand.ilike.%${encodeURIComponent(query)}%)&select=*`
        );
        return products || [];
      } catch (error) {
        console.error('Error searching products:', error);
        return [];
      }
    },

    async create(productData) {
      try {
        const result = await supabaseRequest('products', {
          method: 'POST',
          body: productData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error creating product:', error);
        return null;
      }
    },

    async update(id, productData) {
      try {
        const result = await supabaseRequest(`products?id=eq.${id}`, {
          method: 'PATCH',
          body: productData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error updating product:', error);
        return null;
      }
    },

    async delete(id) {
      try {
        await supabaseRequest(`products?id=eq.${id}`, { 
          method: 'DELETE',
          prefer: 'return=minimal'
        });
        return true;
      } catch (error) {
        console.error('Error deleting product:', error);
        return false;
      }
    },

    async updateStock(id, quantity) {
      try {
        const product = await this.getById(id);
        if (!product) return null;
        
        const newStock = Math.max(0, product.stock - quantity);
        return await this.update(id, { 
          stock: newStock,
          status: newStock <= 0 ? 'out_of_stock' : 'active'
        });
      } catch (error) {
        console.error('Error updating stock:', error);
        return null;
      }
    }
  },

  // ========================================================================
  // CATEGORIES
  // ========================================================================
  categories: {
    async getAll() {
      try {
        const categories = await supabaseRequest('categories?select=*&order=name.asc');
        return categories || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },

    async getByName(name) {
      try {
        const categories = await supabaseRequest(`categories?name=eq.${encodeURIComponent(name)}&select=*`);
        return categories?.[0] || null;
      } catch (error) {
        console.error('Error fetching category:', error);
        return null;
      }
    },

    async create(categoryData) {
      try {
        const result = await supabaseRequest('categories', {
          method: 'POST',
          body: categoryData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error creating category:', error);
        return null;
      }
    },

    async update(id, categoryData) {
      try {
        const result = await supabaseRequest(`categories?id=eq.${id}`, {
          method: 'PATCH',
          body: categoryData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error updating category:', error);
        return null;
      }
    },

    async delete(id) {
      try {
        await supabaseRequest(`categories?id=eq.${id}`, { 
          method: 'DELETE',
          prefer: 'return=minimal'
        });
        return true;
      } catch (error) {
        console.error('Error deleting category:', error);
        return false;
      }
    }
  },

  // ========================================================================
  // CUSTOMERS
  // ========================================================================
  customers: {
    async getAll() {
      try {
        const customers = await supabaseRequest('customers?select=*&order=created_at.desc');
        return customers || [];
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    },

    async getById(id) {
      try {
        const customers = await supabaseRequest(`customers?id=eq.${id}&select=*`);
        return customers?.[0] || null;
      } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
    },

    async getByEmail(email) {
      try {
        const customers = await supabaseRequest(`customers?email=eq.${encodeURIComponent(email)}&select=*`);
        return customers?.[0] || null;
      } catch (error) {
        console.error('Error fetching customer by email:', error);
        return null;
      }
    },

    async create(customerData) {
      try {
        const result = await supabaseRequest('customers', {
          method: 'POST',
          body: customerData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error creating customer:', error);
        return null;
      }
    },

    async update(id, customerData) {
      try {
        const result = await supabaseRequest(`customers?id=eq.${id}`, {
          method: 'PATCH',
          body: customerData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error updating customer:', error);
        return null;
      }
    },

    async authenticate(email, password) {
      try {
        const customer = await this.getByEmail(email);
        if (customer && customer.password_hash === password) {
          return customer;
        }
        return null;
      } catch (error) {
        console.error('Error authenticating customer:', error);
        return null;
      }
    }
  },

  // ========================================================================
  // ORDERS
  // ========================================================================
  orders: {
    async getAll(filters = {}) {
      try {
        let query = 'orders?select=*';
        
        if (filters.status) {
          query += `&status=eq.${encodeURIComponent(filters.status)}`;
        }
        if (filters.customerEmail) {
          query += `&customer_email=eq.${encodeURIComponent(filters.customerEmail)}`;
        }
        if (filters.customerId) {
          query += `&customer_id=eq.${filters.customerId}`;
        }
        
        query += '&order=created_at.desc';
        
        if (filters.limit) {
          query += `&limit=${filters.limit}`;
        }

        const orders = await supabaseRequest(query);
        return orders || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },

    async getById(id) {
      try {
        const orders = await supabaseRequest(`orders?id=eq.${id}&select=*`);
        return orders?.[0] || null;
      } catch (error) {
        console.error('Error fetching order:', error);
        return null;
      }
    },

    async getByCustomerEmail(email) {
      try {
        const orders = await supabaseRequest(`orders?customer_email=eq.${encodeURIComponent(email)}&select=*&order=created_at.desc`);
        return orders || [];
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        return [];
      }
    },

    async create(orderData) {
      try {
        const result = await supabaseRequest('orders', {
          method: 'POST',
          body: orderData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error creating order:', error);
        return null;
      }
    },

    async update(id, orderData) {
      try {
        const result = await supabaseRequest(`orders?id=eq.${id}`, {
          method: 'PATCH',
          body: orderData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error updating order:', error);
        return null;
      }
    },

    async updateStatus(id, status) {
      return await this.update(id, { status, updated_at: new Date().toISOString() });
    }
  },

  // ========================================================================
  // ORDER ITEMS
  // ========================================================================
  orderItems: {
    async getByOrderId(orderId) {
      try {
        const items = await supabaseRequest(`order_items?order_id=eq.${orderId}&select=*`);
        return items || [];
      } catch (error) {
        console.error('Error fetching order items:', error);
        return [];
      }
    },

    async create(itemData) {
      try {
        const result = await supabaseRequest('order_items', {
          method: 'POST',
          body: itemData
        });
        return result?.[0] || null;
      } catch (error) {
        console.error('Error creating order item:', error);
        return null;
      }
    },

    async createMany(items) {
      try {
        const result = await supabaseRequest('order_items', {
          method: 'POST',
          body: items
        });
        return result || [];
      } catch (error) {
        console.error('Error creating order items:', error);
        return [];
      }
    }
  },

  // ========================================================================
  // CART (using localStorage for guest, Supabase for logged in)
  // ========================================================================
  cart: {
    async getItems() {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          const items = await supabaseRequest(`cart_items?customer_id=eq.${user.id}&select=*,products(*)`);
          return (items || []).map(item => ({
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.image,
            quantity: item.quantity,
            cartItemId: item.id
          }));
        } catch (error) {
          console.error('Error fetching cart:', error);
          return [];
        }
      } else {
        return JSON.parse(localStorage.getItem('cart') || '[]');
      }
    },

    async addItem(product, quantity = 1) {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          const existing = await supabaseRequest(`cart_items?customer_id=eq.${user.id}&product_id=eq.${product.id}&select=*`);
          
          if (existing && existing.length > 0) {
            await supabaseRequest(`cart_items?id=eq.${existing[0].id}`, {
              method: 'PATCH',
              body: { quantity: existing[0].quantity + quantity }
            });
          } else {
            await supabaseRequest('cart_items', {
              method: 'POST',
              body: { customer_id: user.id, product_id: product.id, quantity }
            });
          }
          return true;
        } catch (error) {
          console.error('Error adding to cart:', error);
          return false;
        }
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
          cart[existingIndex].quantity += quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
      }
    },

    async updateQuantity(productId, quantity) {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          if (quantity <= 0) {
            await supabaseRequest(`cart_items?customer_id=eq.${user.id}&product_id=eq.${productId}`, { 
              method: 'DELETE',
              prefer: 'return=minimal'
            });
          } else {
            await supabaseRequest(`cart_items?customer_id=eq.${user.id}&product_id=eq.${productId}`, {
              method: 'PATCH',
              body: { quantity }
            });
          }
          return true;
        } catch (error) {
          console.error('Error updating cart:', error);
          return false;
        }
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (quantity <= 0) {
          const filtered = cart.filter(item => item.id !== productId);
          localStorage.setItem('cart', JSON.stringify(filtered));
        } else {
          const item = cart.find(item => item.id === productId);
          if (item) item.quantity = quantity;
          localStorage.setItem('cart', JSON.stringify(cart));
        }
        return true;
      }
    },

    async removeItem(productId) {
      return await this.updateQuantity(productId, 0);
    },

    async clear() {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          await supabaseRequest(`cart_items?customer_id=eq.${user.id}`, { 
            method: 'DELETE',
            prefer: 'return=minimal'
          });
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }
      localStorage.removeItem('cart');
    },

    async getCount() {
      const items = await this.getItems();
      return items.reduce((sum, item) => sum + item.quantity, 0);
    }
  },

  // ========================================================================
  // WISHLIST
  // ========================================================================
  wishlist: {
    async getItems() {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          const items = await supabaseRequest(`wishlist_items?customer_id=eq.${user.id}&select=*,products(*)`);
          return (items || []).map(item => ({
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.image,
            wishlistItemId: item.id
          }));
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          return [];
        }
      } else {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
      }
    },

    async addItem(product) {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          const existing = await supabaseRequest(`wishlist_items?customer_id=eq.${user.id}&product_id=eq.${product.id}&select=*`);
          if (!existing || existing.length === 0) {
            await supabaseRequest('wishlist_items', {
              method: 'POST',
              body: { customer_id: user.id, product_id: product.id }
            });
          }
          return true;
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          return false;
        }
      } else {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.find(item => item.id === product.id)) {
          wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          });
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        return true;
      }
    },

    async removeItem(productId) {
      const user = auth.getCurrentUser();
      if (user) {
        try {
          await supabaseRequest(`wishlist_items?customer_id=eq.${user.id}&product_id=eq.${productId}`, { 
            method: 'DELETE',
            prefer: 'return=minimal'
          });
          return true;
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          return false;
        }
      } else {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const filtered = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(filtered));
        return true;
      }
    },

    async isInWishlist(productId) {
      const items = await this.getItems();
      return items.some(item => item.id === productId);
    }
  },

  // ========================================================================
  // ADDRESSES
  // ========================================================================
  addresses: {
    async getByCustomerId(customerId) {
      try {
        const addresses = await supabaseRequest(`addresses?customer_id=eq.${customerId}&select=*&order=is_default.desc,created_at.desc`);
        return addresses || [];
      } catch (error) {
        console.error('Error fetching addresses:', error);
        return [];
      }
    },

    async create(addressData) {
      try {
        if (addressData.is_default) {
          await supabaseRequest(`addresses?customer_id=eq.${addressData.customer_id}`, {
            method: 'PATCH',
            body: { is_default: false }
          });
        }
        
        return await supabaseRequest('addresses', {
          method: 'POST',
          body: addressData
        });
      } catch (error) {
        console.error('Error creating address:', error);
        return null;
      }
    },

    async update(id, addressData) {
      try {
        return await supabaseRequest(`addresses?id=eq.${id}`, {
          method: 'PATCH',
          body: addressData
        });
      } catch (error) {
        console.error('Error updating address:', error);
        return null;
      }
    },

    async delete(id) {
      try {
        await supabaseRequest(`addresses?id=eq.${id}`, { 
          method: 'DELETE',
          prefer: 'return=minimal'
        });
        return true;
      } catch (error) {
        console.error('Error deleting address:', error);
        return false;
      }
    }
  },

  // ========================================================================
  // STATISTICS (for Admin Dashboard)
  // ========================================================================
  stats: {
    async getDashboardStats() {
      try {
        const [products, orders, customers] = await Promise.all([
          supabaseRequest('products?select=id'),
          supabaseRequest('orders?select=id,total,status'),
          supabaseRequest('customers?select=id')
        ]);

        const totalRevenue = orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0;
        const pendingOrders = orders?.filter(o => o.status === 'Processing').length || 0;

        return {
          totalProducts: products?.length || 0,
          totalOrders: orders?.length || 0,
          totalCustomers: customers?.length || 0,
          totalRevenue,
          pendingOrders
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          pendingOrders: 0
        };
      }
    },

    async getRecentOrders(limit = 5) {
      try {
        return await supabaseRequest(`orders?select=*&order=created_at.desc&limit=${limit}`);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }
    },

    async getLowStockProducts(threshold = 10) {
      try {
        return await supabaseRequest(`products?stock=lte.${threshold}&select=*&order=stock.asc`);
      } catch (error) {
        console.error('Error fetching low stock products:', error);
        return [];
      }
    }
  }
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

const auth = {
  currentUser: null,
  currentAdmin: null,

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  getCurrentUser() {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      this.currentUser = stored ? JSON.parse(stored) : null;
    }
    return this.currentUser;
  },

  setCurrentAdmin(admin) {
    this.currentAdmin = admin;
    if (admin) {
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('currentAdmin');
    }
  },

  getCurrentAdmin() {
    if (!this.currentAdmin) {
      const stored = localStorage.getItem('currentAdmin');
      this.currentAdmin = stored ? JSON.parse(stored) : null;
    }
    return this.currentAdmin;
  },

  isUserAuthenticated() {
    return !!this.getCurrentUser();
  },

  isAdminAuthenticated() {
    return !!this.getCurrentAdmin();
  },

  logoutUser() {
    this.setCurrentUser(null);
  },

  logoutAdmin() {
    this.setCurrentAdmin(null);
  },

  async login(email, password) {
    const customer = await db.customers.authenticate(email, password);
    if (customer) {
      this.setCurrentUser(customer);
      return customer;
    }
    return null;
  },

  async register(name, email, password) {
    const existing = await db.customers.getByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const customer = await db.customers.create({
      name,
      email,
      password_hash: password,
      is_admin: false
    });

    if (customer) {
      this.setCurrentUser(customer);
      return customer;
    }
    return null;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatPrice(price) {
  return '₹' + Number(price || 0).toLocaleString('en-IN');
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// ============================================================================
// EXPORTS FOR DEBUGGING
// ============================================================================

window.db = db;
window.auth = auth;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

console.log('✅ Supabase config loaded. Database ready.');
