# FlowCommerce - Premium eCommerce Platform

A modern, full-featured eCommerce platform built with HTML5, CSS3, and JavaScript, powered by Supabase PostgreSQL database.

## 🚀 Features

- **Product Management** - Browse, search, filter products by category, price, rating
- **Shopping Cart** - Add/remove items, persistent cart storage
- **Wishlist** - Save favorite products
- **User Authentication** - Register, login, manage profile
- **Order Management** - Place orders, track order status, view order history
- **Admin Dashboard** - Manage products, orders, customers, inventory
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-friendly interface
- **Real-time Database** - Supabase PostgreSQL integration

## 📋 Prerequisites

- Node.js 18+ (for local development)
- Supabase account and project
- Git for version control

## 🛠️ Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/flowcommerce.git
cd flowcommerce
```

### 2. Create Environment File
```bash
cp .env.example .env.local
```

### 3. Configure Environment Variables
Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_URL=http://localhost:3000
```

### 4. Start Local Server
```bash
npm run dev
# or
python -m http.server 3000
```

Visit `http://localhost:3000`

## 🌐 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit: FlowCommerce setup"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase Anon Key
   - `VITE_APP_URL` - Your Vercel deployment URL
5. Click "Deploy"

### 3. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

## 📁 Project Structure

```
flowcommerce/
├── index.html              # Customer storefront
├── admin.html              # Admin dashboard
├── admin-dashboard.html    # Admin panel
├── app.js                  # Main application logic
├── admin.js                # Admin functionality
├── config.js               # Supabase configuration
├── utils.js                # Utility functions
├── styles.css              # Styling
├── package.json            # Project metadata
├── vercel.json             # Vercel configuration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md              # This file
```

## 🔐 Security Checklist

- [ ] Remove sensitive credentials from code
- [ ] Use environment variables for all secrets
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Set up CORS properly
- [ ] Use HTTPS only
- [ ] Never commit .env file
- [ ] Review Supabase security settings

## 📊 Database Schema

Key tables:
- `customers` - User accounts
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlist_items` - Wishlist
- `categories` - Product categories
- `shipments` - Shipping information

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build project
npm start        # Start production server
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Issue: CORS errors
**Solution**: Check Supabase CORS settings and ensure your domain is whitelisted

### Issue: Products not loading
**Solution**: Verify Supabase credentials and database connection

### Issue: Checkout fails
**Solution**: Check browser console for errors, verify cart has items

### Issue: Stock not updating
**Solution**: Ensure the `fn_checkout_transaction` RPC function exists in Supabase

## 📚 API Documentation

All API calls are made through Supabase REST API. Key endpoints:
- `GET /rest/v1/products` - List products
- `GET /rest/v1/customers` - List customers
- `POST /rest/v1/orders` - Create order
- `RPC /rest/v1/rpc/fn_checkout_transaction` - Transactional checkout

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/flowcommerce/issues)
- Email: support@flowcommerce.com

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Inventory management system
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support
- [ ] AI-powered recommendations

---

**FlowCommerce** - Built with ❤️ for seamless shopping experiences
