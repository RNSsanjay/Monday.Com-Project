# Vercel Deployment Guide - Monday.com BI Project

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account (free is fine)
- Monday.com API token
- Groq API key

## 🚨 FIXING 404 ERRORS - CRITICAL

If you're getting 404 errors after deployment, this is due to SPA routing issues. The project is now configured to fix this automatically, but follow these steps to ensure proper deployment:

### Step 1: Ensure Proper Configuration

The project includes these critical files for SPA routing:
- ✅ **vercel.json** - Main Vercel configuration with SPA routing
- ✅ **frontend/public/_redirects** - Backup routing fallback  
- ✅ **Optimized build configuration** in vite.config.ts

### Step 2: Deploy with Correct Settings

**IMPORTANT:** Always deploy from the **project root**, not the frontend folder.

### 1. Environment Variables Setup

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```bash
VITE_MONDAY_API_TOKEN=your_monday_api_token_here
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_MODEL_NAME=llama-3.3-70b-versatile
VITE_NODE_ENV=production
```

### 2. Deploy Methods

#### Method A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push to main branch

#### Method B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

#### Method C: Drag & Drop
1. Build locally: `cd frontend && npm run build`
2. Drag the `frontend/dist` folder to Vercel dashboard

### 3. Build Configuration

The project is already configured with:
- `vercel.json` for proper routing and SPA support
- Optimized Vite configuration for production
- Environment variables setup
- Build scripts for Vercel

### 4. API Keys Setup Guide

#### Getting Monday.com API Token:
1. Go to Monday.com → Profile → Admin → API
2. Generate a new API token
3. Copy and add to Vercel environment variables

#### Getting Groq API Key:
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/Login
3. Navigate to API Keys
4. Create new API key
5. Copy and add to Vercel environment variables

### 5. Troubleshooting Common Issues

#### 404 Errors (MOST COMMON):
**If you see "404: NOT_FOUND" after deployment:**

1. **Immediate Fix - Redeploy:**
   ```bash
   # From project root directory
   vercel --prod
   ```

2. **Check Vercel Configuration:**
   - Ensure `vercel.json` is in the **project root** (not in frontend folder)
   - Verify `outputDirectory` is set to `frontend/dist`
   - Confirm routes configuration includes `"dest": "/index.html"`

3. **Manual Fix in Vercel Dashboard:**
   - Go to Project Settings → Functions
   - Ensure "Output Directory" is set to `frontend/dist`
   - Check "Build Command" is `cd frontend && npm ci && npm run build`
   
4. **Force Clean Deploy:**
   ```bash
   # Delete .vercel folder and redeploy
   rm -rf .vercel
   vercel --prod
   ```

#### Environment Variables Not Working:
- Ensure variables start with `VITE_`
- Re-deploy after adding environment variables
- Check Vercel dashboard for variable presence

#### Build Failures:
- Check Node.js version compatibility (use Node 18+)
- Verify all dependencies are in package.json
- Review build logs in Vercel dashboard
- Try local build first: `cd frontend && npm run build`

### 6. Project Structure for Vercel

```
Monday.Com-Project/
├── vercel.json                 # Vercel configuration
├── frontend/
│   ├── package.json           # Dependencies and build scripts
│   ├── vite.config.ts         # Optimized for production
│   ├── .env.example           # Environment variables template
│   └── src/                   # Application source code
```

### 7. Performance Optimizations

The project includes:
- ✅ Code splitting for vendor chunks
- ✅ Minification with Terser
- ✅ Optimized bundle sizes
- ✅ Static asset optimization
- ✅ SPA routing configuration

### 8. Deployment Checklist

- [ ] **CRITICAL:** Deploy from project root directory (not frontend folder)
- [ ] Verify `vercel.json` exists in project root
- [ ] Environment variables added to Vercel
- [ ] Monday.com API token is valid
- [ ] Groq API key is valid  
- [ ] Project builds locally without errors: `cd frontend && npm run build`
- [ ] Test build output: check `frontend/dist/index.html` exists
- [ ] `_redirects` file is in `frontend/dist/` after build
- [ ] **After deployment:** Test direct URL access (not just home page)

### 9. Live URL

After deployment, your app will be available at:
`https://your-project-name.vercel.app`

### 10. Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test local build: `npm run build`
4. Review console errors in browser dev tools

---

## 🔄 Continuous Deployment

Once connected to GitHub, every push to the main branch will:
1. Trigger automatic build
2. Run production optimizations  
3. Deploy to live URL
4. Update within seconds

This ensures your Monday.com BI dashboard is always up-to-date with the latest changes!