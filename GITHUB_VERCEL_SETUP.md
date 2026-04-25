# 🚀 GitHub & Vercel Deployment Guide

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd FlowCommerce-dbms

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FlowCommerce eCommerce platform with Supabase integration"

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/flowcommerce.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Set Up GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create new repository called `flowcommerce`
3. Don't initialize with README (we already have one)
4. Copy the repository URL
5. Use the URL in the git remote command above

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Connect to GitHub account
# - Select the flowcommerce repository
# - Configure environment variables
```

### Option B: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for and select your `flowcommerce` repository
5. Click "Import"
6. Configure environment variables:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://iyddgoxxvygfavgoxzrf.supabase.co`
   
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZGRnb3h4dnlnZmF2Z294enJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjQ5MjksImV4cCI6MjA4NjAwMDkyOX0.a9RYYOLJ9MdFeZGSXDmu6zgIcsELJZ-fXWVDOZ2mMEs`
   
   - Name: `VITE_APP_URL`
     Value: `https://flowcommerce-yourusername.vercel.app`
   
   - Name: `VITE_APP_NAME`
     Value: `FlowCommerce`
   
   - Name: `VITE_ENVIRONMENT`
     Value: `production`

7. Click "Deploy"
8. Wait for deployment to complete
9. Your site will be live at the provided URL

## Step 4: Set Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `flowcommerce.com`)
4. Follow DNS configuration instructions
5. Update `VITE_APP_URL` environment variable with your domain

## Step 5: Verify Deployment

After deployment:
1. Visit your Vercel URL
2. Check that products load
3. Test login functionality
4. Test adding to cart
5. Verify Supabase connection works
6. Check browser console for any errors

## 🔐 Security Best Practices

### Never Commit These:
- `.env` (local file)
- `.env.local` (local file)
- Sensitive credentials
- API keys in code

### What to Commit:
- `.env.example` (template)
- All source code
- Configuration files (vercel.json, package.json)

### Vercel Security Settings:
1. Go to Project Settings → Environment Variables
2. Set sensitive values there (NOT in .env file)
3. Use separate variables for development and production
4. Rotate keys periodically
5. Enable "Automatic Git Sync" for auto-deployments

## 📝 Git Workflow for Future Updates

```bash
# Make changes to your code
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Feature: Add product reviews"

# Push to GitHub
git push origin main

# Vercel automatically deploys on push!
```

## 🔄 Continuous Deployment

Vercel is configured to automatically deploy when you push to GitHub:
- Every push to `main` triggers a production deployment
- Other branches create preview deployments
- You can see deployment status in Vercel dashboard

## 🆘 Troubleshooting

### Issue: Deployment fails
**Solution**: Check Vercel logs in dashboard → Deployments → Failed deployment

### Issue: Environment variables not loading
**Solution**: Verify variables are set in Vercel Dashboard, not in .env file

### Issue: 404 errors on routes
**Solution**: This is a static site, ensure all HTML files exist in root

### Issue: CORS errors
**Solution**: Check Supabase CORS settings and whitelist your Vercel domain

## 📊 Monitor Your Deployment

- **Vercel Dashboard**: View analytics, logs, and deployment history
- **Supabase Dashboard**: Monitor database usage, API calls
- **GitHub**: Track commits, branches, pull requests

## 🎉 You're Live!

Your FlowCommerce platform is now live on Vercel and synced with GitHub!

**Key URLs:**
- **Live Site**: https://your-vercel-domain
- **GitHub**: https://github.com/yourusername/flowcommerce
- **Vercel Dashboard**: https://vercel.com/yourusername/flowcommerce
- **Supabase**: https://app.supabase.com

Happy coding! 🚀
