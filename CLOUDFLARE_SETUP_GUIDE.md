# 🚀 Cloudflare Pages Setup & Deployment Guide

## 📋 Prerequisites Checklist

✅ **Completed:**
- [x] Repository cloned from GitHub
- [x] Dependencies installed (`npm install`)
- [x] Environment variables configured (.dev.vars)
- [x] Build successful (dist/ directory generated)
- [x] Local testing dengan PM2 berhasil
- [x] Changes pushed to GitHub

⏳ **Next Steps:**
- [ ] Setup Cloudflare API Token
- [ ] Deploy to Cloudflare Pages
- [ ] Configure environment variables di Cloudflare
- [ ] Test production deployment

---

## 🔑 Step 1: Setup Cloudflare API Token

### Cara Mendapatkan Cloudflare API Token:

1. **Login ke Cloudflare Dashboard**
   - Buka: https://dash.cloudflare.com/
   - Login dengan akun Anda

2. **Generate API Token**
   - Klik icon profile (kanan atas) → **My Profile**
   - Pilih tab **API Tokens**
   - Klik **Create Token**

3. **Template: Edit Cloudflare Workers**
   - Pilih template: **Edit Cloudflare Workers**
   - Atau buat Custom Token dengan permissions:
     - **Account** → Workers Scripts → **Edit**
     - **Account** → Workers KV Storage → **Edit**
     - **Zone** → Workers Routes → **Edit**
     - **Account** → Cloudflare Pages → **Edit**

4. **Copy Token**
   - Setelah dibuat, **COPY token** dan simpan dengan aman
   - Token hanya ditampilkan sekali!

### Token yang Sudah Anda Berikan:
```
API Token: Your Cloudflare API Token (keep it secret!)
Account Token: Your Account Token (keep it secret!)
Account ID: Your Account ID
```

**⚠️ IMPORTANT:** Store these tokens securely in your `.dev.vars` file (locally) and as Cloudflare secrets (production). Never commit tokens to GitHub!

---

## 🛠️ Step 2: Setup di Sandbox Environment

### Option A: Menggunakan Deploy Tab (Recommended)

1. Buka **Deploy tab** di sidebar sandbox
2. Pilih **Cloudflare Pages**
3. Masukkan API Token Anda
4. Save configuration

### Option B: Manual Setup via CLI

```bash
# Set environment variable untuk Cloudflare API Token
export CLOUDFLARE_API_TOKEN=ntRY9kgZjPn1A0vKDmbYz6CkC4Ie_2yR8_BTAqCY

# Verify authentication
cd /home/user/webapp
npx wrangler whoami

# Login to Cloudflare (jika diperlukan)
echo "ntRY9kgZjPn1A0vKDmbYz6CkC4Ie_2yR8_BTAqCY" | npx wrangler login --api-token
```

---

## 🚀 Step 3: Deploy ke Cloudflare Pages

### 3.1 Create Cloudflare Pages Project (First Time Only)

```bash
cd /home/user/webapp

# Create Pages project
npx wrangler pages project create barber-ai-saas \
  --production-branch main \
  --compatibility-date 2026-01-13
```

**Output yang diharapkan:**
```
✅ Successfully created the 'barber-ai-saas' project.
```

### 3.2 Deploy Build ke Cloudflare Pages

```bash
cd /home/user/webapp

# Build project
npm run build

# Deploy to production
npx wrangler pages deploy dist --project-name barber-ai-saas

# Atau gunakan npm script
npm run deploy
```

**Output yang diharapkan:**
```
✨ Success! Uploaded 2 files (1.2 MB total)
✨ Deployment complete! Take a peek over at https://barber-ai-saas.pages.dev
```

### 3.3 Alternative: Connect ke GitHub (Automatic Deployment)

1. **Buka Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. **Connect Repository**
   - Pilih **GitHub** sebagai provider
   - Authorize Cloudflare untuk mengakses repository Anda
   - Pilih repository: `Estes786/barber-ai-saas`

3. **Configure Build Settings**
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

4. **Add Environment Variables**
   ```
   SUPABASE_URL=https://your-project-url.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   HUGGINGFACE_TOKEN_FINE_GRAINED=your_hf_token_here
   HUGGINGFACE_TOKEN_WRITE=your_hf_write_token_here
   ```

5. **Save and Deploy**
   - Klik **Save and Deploy**
   - Deployment otomatis akan berjalan setiap kali ada push ke branch `main`

---

## 🔐 Step 4: Configure Environment Variables

### Set Environment Variables untuk Production

```bash
cd /home/user/webapp

# Set Supabase credentials
npx wrangler pages secret put SUPABASE_URL --project-name barber-ai-saas
# Input: https://your-project-url.supabase.co

npx wrangler pages secret put SUPABASE_ANON_KEY --project-name barber-ai-saas
# Input: your_anon_key_here

npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name barber-ai-saas
# Input: your_service_role_key_here

# Set Hugging Face tokens
npx wrangler pages secret put HUGGINGFACE_TOKEN_FINE_GRAINED --project-name barber-ai-saas
# Input: your_hf_token_here

npx wrangler pages secret put HUGGINGFACE_TOKEN_WRITE --project-name barber-ai-saas
# Input: your_hf_write_token_here
```

### List All Secrets

```bash
npx wrangler pages secret list --project-name barber-ai-saas
```

---

## ✅ Step 5: Verify Deployment

### Test Production URLs

```bash
# Test homepage
curl https://barber-ai-saas.pages.dev

# Test API endpoints
curl https://barber-ai-saas.pages.dev/api/hairstyles

# Test Phase 2 demos
# - AI Virtual Try-On: https://barber-ai-saas.pages.dev/demo/try-on
# - Smart Booking: https://barber-ai-saas.pages.dev/demo/booking
# - AI Chatbot: https://barber-ai-saas.pages.dev/demo/chat
```

### Check Deployment Status

```bash
# View recent deployments
npx wrangler pages deployment list --project-name barber-ai-saas

# Tail logs (real-time)
npx wrangler pages deployment tail --project-name barber-ai-saas
```

---

## 🔄 Step 6: Update Deployment (Future Updates)

### Quick Deployment Workflow

```bash
cd /home/user/webapp

# 1. Make changes to code
# 2. Test locally
npm run build
pm2 restart barber-ai-saas

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push to GitHub
git push origin main

# 5. Deploy to Cloudflare (manual)
npm run deploy

# Or wait for auto-deployment (if GitHub connection configured)
```

---

## 🌐 Step 7: Custom Domain (Optional)

### Add Custom Domain ke Cloudflare Pages

```bash
# Add custom domain
npx wrangler pages domain add yourdomain.com --project-name barber-ai-saas

# List domains
npx wrangler pages domain list --project-name barber-ai-saas

# Remove domain
npx wrangler pages domain remove yourdomain.com --project-name barber-ai-saas
```

### DNS Configuration

1. **Login ke Domain Registrar** (GoDaddy, Namecheap, dll)
2. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: barber-ai-saas.pages.dev
   TTL: Auto
   ```
3. **Wait for DNS Propagation** (5-30 minutes)
4. **Verify:** https://yourdomain.com

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Authentication Failed
```
Error: Invalid Cloudflare API Token
```

**Solution:**
```bash
# Generate new API Token from Cloudflare Dashboard
# Verify token has correct permissions:
# - Account: Workers Scripts (Edit)
# - Account: Cloudflare Pages (Edit)

# Test authentication
npx wrangler whoami
```

#### Issue 2: Build Fails
```
Error: Build command exited with code 1
```

**Solution:**
```bash
# Test build locally first
cd /home/user/webapp
npm run build

# Check for errors in output
# Fix issues, then deploy again
```

#### Issue 3: Environment Variables Not Found
```
Error: Environment variable SUPABASE_URL not found
```

**Solution:**
```bash
# Set secrets via CLI
npx wrangler pages secret put SUPABASE_URL --project-name barber-ai-saas

# Or set via Cloudflare Dashboard:
# Workers & Pages → barber-ai-saas → Settings → Environment variables
```

#### Issue 4: 404 on API Routes
```
Error: GET /api/hairstyles returns 404
```

**Solution:**
```bash
# Check dist/_routes.json configuration
cat dist/_routes.json

# Verify routes are exported correctly in src/index.tsx
# Rebuild and redeploy
npm run build
npm run deploy
```

---

## 📊 Step 8: Monitor Performance

### Cloudflare Analytics

1. **Open Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **barber-ai-saas**

2. **View Analytics:**
   - **Requests:** Total requests per day
   - **Errors:** Error rate and types
   - **CPU Time:** Execution duration
   - **Bandwidth:** Data transfer

### Real-time Logs

```bash
# Stream real-time logs
npx wrangler pages deployment tail --project-name barber-ai-saas

# Filter by log level
npx wrangler pages deployment tail --project-name barber-ai-saas --level error
```

---

## 🎯 Next Steps: Ready for Phase 3!

Setelah backend berhasil deployed, kita siap untuk implement **Phase 3 Features**:

### Phase 3 - Advanced Features

1. **🔐 Authentication System** (Supabase Auth)
   - Multi-role access (Owner, Barber, Client)
   - JWT session management
   - Password reset flow
   - OAuth providers (Google, Facebook)

2. **📊 Barber Dashboard**
   - Revenue tracking & analytics
   - Booking management (accept/reject)
   - Portfolio upload (before/after)
   - Client management system
   - Business insights & trends

3. **💳 Payment Integration** (Duitku)
   - Subscription gateway
   - Billing management (FREE, STARTER, PRO, ENTERPRISE)
   - Invoice generation
   - Usage tracking per tier

4. **📧 Notification System**
   - Email reminders (SendGrid/Resend)
   - SMS notifications (Twilio)
   - WhatsApp integration
   - Push notifications

---

## 📝 Quick Reference

### Important URLs
- **Production:** https://barber-ai-saas.pages.dev
- **GitHub:** https://github.com/Estes786/barber-ai-saas
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Supabase Dashboard:** https://supabase.com/dashboard

### Important Commands
```bash
# Build
npm run build

# Deploy
npm run deploy

# Local dev
npm run dev:sandbox

# Check deployment
npx wrangler pages deployment list --project-name barber-ai-saas

# View logs
npx wrangler pages deployment tail --project-name barber-ai-saas

# Manage secrets
npx wrangler pages secret list --project-name barber-ai-saas
```

### Support
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Pages:** https://developers.cloudflare.com/pages/
- **Hono Docs:** https://hono.dev/
- **Supabase Docs:** https://supabase.com/docs

---

**Created:** 2026-01-13  
**Last Updated:** 2026-01-13  
**Status:** ✅ Backend Ready for Production
