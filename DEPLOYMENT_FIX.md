# 🚀 Cloudflare Pages Deployment Fix Guide

## ❌ Error yang Terjadi

Build log menunjukkan error berikut:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## 🔧 Root Cause

Di **Cloudflare Pages Project Settings**, deploy command yang digunakan salah:
- ❌ **Yang Salah:** `npx wrangler deploy`
- ✅ **Yang Benar:** `npx wrangler pages deploy dist --project-name barber-ai-saas`

## ✅ Solusi - Fix Cloudflare Pages Settings

### Step 1: Login ke Cloudflare Dashboard
1. Buka https://dash.cloudflare.com
2. Login dengan akun Anda
3. Klik **Workers & Pages** di sidebar kiri

### Step 2: Edit Project Settings
1. Cari project **barber-ai-saas** di daftar
2. Klik pada project tersebut
3. Klik tab **Settings**
4. Scroll ke section **Build & deployments**
5. Klik tombol **Edit** atau **Configure**

### Step 3: Update Build Settings
Update konfigurasi build dengan setting berikut:

**Framework preset:** `None` atau `Vite`

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
dist
```

**Deploy command (IMPORTANT!):**
```bash
npx wrangler pages deploy dist --project-name barber-ai-saas
```

### Step 4: Add Environment Variables
Di tab **Settings** → **Environment variables**, tambahkan:

**Production Variables:**
```
SUPABASE_URL=https://wuuulccafxlhqxzityln.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTczNjAsImV4cCI6MjA4Mzg5MzM2MH0.i0aYYI1xey-hotI26Q7m4HcPo52x5XgzX-GsnlbYu_4
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
HF_FINE_GRAINED_TOKEN=your_huggingface_token
HF_WRITE_TOKEN=your_huggingface_write_token
```

### Step 5: Trigger New Deployment
1. Klik tab **Deployments**
2. Klik **Retry deployment** pada deployment terakhir yang gagal
   ATAU
3. Push commit baru ke GitHub untuk trigger automatic deployment

---

## 🎯 Alternative: Deploy via CLI (Recommended for First Time)

Jika Anda memiliki Cloudflare API Token, Anda bisa deploy langsung dari command line:

### 1. Setup Cloudflare API Token
```bash
# Export API token as environment variable
export CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### 2. Create Cloudflare Pages Project (First Time Only)
```bash
npx wrangler pages project create barber-ai-saas \
  --production-branch main \
  --compatibility-date 2026-01-13
```

### 3. Add Secrets to Cloudflare Pages
```bash
# Add Supabase secrets
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTczNjAsImV4cCI6MjA4Mzg5MzM2MH0.i0aYYI1xey-hotI26Q7m4HcPo52x5XgzX-GsnlbYu_4" | npx wrangler pages secret put SUPABASE_ANON_KEY --project-name barber-ai-saas

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY" | npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name barber-ai-saas

# Add environment variables
npx wrangler pages project create barber-ai-saas --env production
```

### 4. Deploy to Cloudflare Pages
```bash
# Build first
npm run build

# Deploy to production
npx wrangler pages deploy dist --project-name barber-ai-saas
```

---

## 📝 Verification Checklist

Setelah deployment selesai, verify:

- [ ] ✅ Build berhasil (no errors dalam logs)
- [ ] ✅ Homepage dapat diakses: `https://barber-ai-saas.pages.dev`
- [ ] ✅ Auth endpoints berfungsi: `/auth/login`, `/auth/register`
- [ ] ✅ Demo pages berfungsi: `/demo/try-on`, `/demo/booking`, `/demo/chat`
- [ ] ✅ API endpoints berfungsi: `/api/barbershops`, `/api/stats`
- [ ] ✅ Static files ter-serve: `/static/styles.css`, `/static/app.js`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Command not found: wrangler"
**Solution:** Pastikan wrangler terinstall sebagai devDependency
```bash
npm install -D wrangler
```

### Issue 2: "Project not found"
**Solution:** Create project terlebih dahulu via CLI atau Cloudflare Dashboard

### Issue 3: Environment variables tidak terdeteksi
**Solution:** Add secrets via wrangler CLI atau Cloudflare Dashboard

### Issue 4: Build gagal dengan "Module not found"
**Solution:** Pastikan semua dependencies terinstall dengan benar
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎉 Expected Result

Setelah deployment berhasil, Anda akan mendapat URLs seperti:

- **Production URL:** `https://barber-ai-saas.pages.dev`
- **Branch URL:** `https://main.barber-ai-saas.pages.dev`
- **Deployment ID URL:** `https://3af7fdee.barber-ai-saas.pages.dev`

---

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/api)
- [Hono Framework for Cloudflare](https://hono.dev/docs/getting-started/cloudflare-pages)

---

## 🔄 Next Steps After Successful Deployment

1. ✅ Test all Phase 3.1 Auth endpoints in production
2. 🚀 Implement Phase 3.2 - Barber Dashboard
3. 💳 Implement Phase 3.3 - Payment Integration (Duitku)
4. 📧 Implement Phase 3.4 - Notification System
5. 🎨 Add custom domain (optional)

---

**Status Update:** 2026-01-14
- ✅ Phase 1 & 2: Complete
- ✅ Phase 3.1 Authentication: Complete (tested locally)
- ⏳ Cloudflare Pages Deployment: Ready to deploy with fix
- ⏳ Phase 3.2-3.4: Pending implementation
