# 🔧 Cloudflare Pages Deployment - Fix Guide

## 📊 Current Status

✅ **Local Development**: WORKING
- Service running at: http://localhost:3000
- Public URL: https://3000-iji7mj4m0jern1x2m2sq0-5185f4aa.sandbox.novita.ai
- All routes functioning correctly
- Build successful (dist/ generated)

❌ **Production Deployment**: ERROR
- Error Message: "It looks like you've run a Workers-specific command in a Pages project"
- Root Cause: Incorrect deploy command in Cloudflare Pages settings

## 🔑 Critical Issue: API Token IP Restriction

Your Cloudflare API token has **IP restriction** enabled:
```
Error: Cannot use the access token from location: 170.106.202.227 [code: 9109]
```

**Solutions:**
1. **Option A (Recommended)**: Create a NEW API token without IP restrictions
2. **Option B**: Update existing token to allow all IPs (less secure)
3. **Option C**: Use Cloudflare Dashboard UI for deployment

## 📋 Step-by-Step Deployment Fix

### Method 1: Fix via Cloudflare Dashboard (RECOMMENDED)

Since your API token has IP restrictions, the easiest way is through the dashboard:

#### 1. Open Cloudflare Dashboard
- Go to: https://dash.cloudflare.com/
- Navigate to: **Workers & Pages**
- Find project: **barber-ai-saas**

#### 2. Fix Build Settings
Click on **Settings** → **Builds & deployments**, then update:

**Current (WRONG) Configuration:**
```bash
Build command: npm run deploy
# or
Build command: wrangler deploy
```

**Correct Configuration:**
```bash
Framework preset: None
Build command: npm run build
Build output directory: /dist
Root directory: (leave empty)
```

#### 3. Environment Variables
Add these environment variables in **Settings** → **Environment variables**:

**Production Environment:**
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
HF_TOKEN=your-huggingface-token
JWT_SECRET=your-jwt-secret-key
```

**Note**: Get actual values from your secure storage (not from git history)

#### 4. Trigger Redeploy
- Go to **Deployments** tab
- Click **Retry deployment** on latest failed deployment
- OR push new commit to GitHub (deployment will auto-trigger)

### Method 2: Create New API Token (if you want CLI access)

#### 1. Create New Token
- Go to: https://dash.cloudflare.com/profile/api-tokens
- Click: **Create Token**
- Use template: **Edit Cloudflare Workers**
- **IMPORTANT**: Under **IP Address Filtering** → Select **All IPs allowed**
- Click **Continue to summary** → **Create Token**
- Save the token securely

#### 2. Use New Token
```bash
# Set environment variable
export CLOUDFLARE_API_TOKEN="your-new-token-here"
export CLOUDFLARE_ACCOUNT_ID="a51295a10bce67facf2e15cb66293a7e"

# Test authentication
npx wrangler whoami

# Deploy
npm run build
npx wrangler pages deploy dist --project-name barber-ai-saas
```

## 🚀 Quick Deployment Commands

### For GitHub Push (Triggers Auto-Deploy)
```bash
cd /home/user/webapp
git add .
git commit -m "Fix: Update build configuration for Cloudflare Pages"
git push origin main
```

### For Manual CLI Deploy (requires new token without IP restriction)
```bash
cd /home/user/webapp

# Build first
npm run build

# Deploy to Cloudflare Pages
export CLOUDFLARE_API_TOKEN="your-new-token-without-ip-restriction"
export CLOUDFLARE_ACCOUNT_ID="a51295a10bce67facf2e15cb66293a7e"
npx wrangler pages deploy dist --project-name barber-ai-saas
```

## 🔍 Verify Deployment

After successful deployment, your app will be available at:
- Production: `https://barber-ai-saas.pages.dev`
- Branch: `https://main.barber-ai-saas.pages.dev`

Test these endpoints:
```bash
# Homepage
curl https://barber-ai-saas.pages.dev

# Auth login page
curl https://barber-ai-saas.pages.dev/auth/login

# Demo pages
curl https://barber-ai-saas.pages.dev/demo/try-on
curl https://barber-ai-saas.pages.dev/demo/booking
curl https://barber-ai-saas.pages.dev/demo/chat
```

## 📝 Expected Cloudflare Build Logs

When correctly configured, you should see:
```
Initializing build environment...
Cloning repository...
Installing project dependencies: npm clean-install
Executing user build command: npm run build
> barber-ai-saas@1.0.0 build
> vite build
vite v6.4.1 building SSR bundle for production...
✓ 82 modules transformed.
dist/_worker.js  289.98 kB
✓ built in 1.54s
Deploying to Cloudflare's global network...
Success! Deployment complete!
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Workers-specific command" Error
**Cause**: Build command is set to `wrangler deploy` or `npm run deploy`
**Solution**: Change build command to `npm run build` in Cloudflare dashboard

### Issue 2: "Cannot use access token" Error
**Cause**: API token has IP restriction enabled
**Solution**: Create new token without IP restrictions OR use dashboard deployment

### Issue 3: Environment Variables Not Found
**Cause**: Env vars not set in Cloudflare dashboard
**Solution**: Add all required env vars in Settings → Environment variables

### Issue 4: 404 on All Routes
**Cause**: Build output directory incorrect
**Solution**: Ensure "Build output directory" is set to `/dist` (with leading slash)

## 📊 Project Structure Reference

```
webapp/
├── src/                    # Source files
│   ├── index.tsx          # Main Hono app entry
│   ├── routes/            # API & Auth routes
│   └── lib/               # Utilities
├── public/                # Static assets
│   └── static/            # CSS, JS files
├── dist/                  # Build output (generated)
│   ├── _worker.js         # Compiled Hono worker
│   └── _routes.json       # Routing configuration
├── package.json
├── vite.config.ts
├── wrangler.jsonc
└── .dev.vars              # Local env vars (DO NOT COMMIT)
```

## 🎯 Next Steps

1. **Fix Build Settings** in Cloudflare dashboard (Method 1 - RECOMMENDED)
2. **Verify Environment Variables** are set correctly
3. **Trigger Redeploy** (or push to GitHub)
4. **Test Production URLs** after deployment succeeds
5. **Continue with Phase 3.2** (Barber Dashboard implementation)

## 📞 Support

If deployment still fails after following this guide:
1. Check build logs in Cloudflare dashboard
2. Verify all environment variables are set
3. Ensure GitHub repository is correctly connected
4. Try manual deployment via dashboard UI (Create deployment button)

---

**Status**: Ready for deployment fix
**Last Updated**: 2026-01-14
**Development URL**: https://3000-iji7mj4m0jern1x2m2sq0-5185f4aa.sandbox.novita.ai
