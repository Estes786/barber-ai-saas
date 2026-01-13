# 💈 Barber AI SaaS Platform

**All-in-One AI-Powered SaaS Platform for Modern Barbershops**

Transform your barbershop business with cutting-edge AI technology featuring virtual try-on, smart booking, business analytics, and automated marketing.

---

## 🌐 Live Demo

**🔗 Platform URL:** [https://3000-ilen0rklemv0iv350jc4b-b32ec7bb.sandbox.novita.ai](https://3000-ilen0rklemv0iv350jc4b-b32ec7bb.sandbox.novita.ai)

**📱 GitHub Repository:** [https://github.com/Estes786/barber-ai-saas](https://github.com/Estes786/barber-ai-saas)

---

## 🎯 Project Overview

Barber AI SaaS is a comprehensive platform designed specifically for barbershops, combining AI-powered features with modern business management tools. Built on Cloudflare Workers & Hono framework for maximum performance and global edge deployment.

### 🌟 Key Differentiators

This platform is **UNIQUE** in the market because it combines:
- ✅ AI Virtual Try-On (200+ hairstyles)
- ✅ Smart Booking System with AI Chatbot
- ✅ Multi-tenant SaaS Architecture
- ✅ Business Analytics Dashboard
- ✅ Portfolio Builder (Before/After)
- ✅ AI Consultation Assistant
- ✅ Multi-location Support

---

## ✨ Features Completed

### 🎨 Landing Page ✅
- **Hero Section** with animated gradient text and call-to-action buttons
- **Statistics Counter** with animated numbers (1,500+ barbershops, 50,000+ bookings)
- **Feature Showcase** with 6 feature cards (AI Try-On, Smart Booking, Analytics, Portfolio, AI Consultation, Multi-location)
- **Pricing Tiers** with monthly/yearly toggle (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
- **Responsive Design** with mobile menu
- **Smooth Animations** with scroll-triggered fade-ins
- **Modern UI** using TailwindCSS and Font Awesome icons

### 🗄️ Database Architecture ✅
- **Multi-tenant Schema** for barbershops, barbers, clients, services
- **Booking System** with status tracking (PENDING, CONFIRMED, COMPLETED, etc.)
- **Portfolio Management** for before/after photos
- **AI Try-On History** tracking
- **Consultation Logs** for AI chatbot interactions
- **Business Hours** management
- **Reviews & Ratings** system

### 🔌 API Routes ✅
- `GET /api/barbershops` - List all active barbershops
- `GET /api/barbershops/:slug` - Get barbershop details
- `GET /api/barbershops/:slug/services` - Get services
- `GET /api/barbershops/:slug/barbers` - Get barbers
- `GET /api/barbershops/:slug/portfolio` - Get portfolio
- `GET /api/stats` - Platform statistics

---

## 🚀 Tech Stack

- **Framework:** Hono (Lightweight web framework)
- **Deployment:** Cloudflare Pages/Workers (Edge computing)
- **Database:** Cloudflare D1 (SQLite-based, globally distributed)
- **Storage:** Cloudflare R2 (S3-compatible object storage)
- **AI:** Cloudflare AI (For image processing & chatbot)
- **Frontend:** TailwindCSS + Vanilla JavaScript
- **Process Manager:** PM2 (for local development)

---

## 📊 Data Models

### **Barbershops** (Multi-tenant base)
- `id`, `slug`, `name`, `email`, `phone`, `address`
- `subscription_tier` (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
- `subscription_status` (ACTIVE, SUSPENDED, CANCELLED)
- `ai_tryons_used`, `ai_tryons_limit`
- `custom_domain`, `logo_url`, `cover_url`

### **Barbers**
- `id`, `barbershop_id`, `name`, `email`, `phone`
- `bio`, `photo_url`, `specialties` (JSON)
- `years_experience`, `role` (OWNER, ADMIN, BARBER)

### **Clients**
- `id`, `barbershop_id`, `name`, `email`, `phone`
- `photo_url`, `preferred_barber_id`
- `total_visits`, `last_visit_date`

### **Services**
- `id`, `barbershop_id`, `name`, `description`
- `duration_minutes`, `price`, `is_active`

### **Bookings**
- `id`, `barbershop_id`, `barber_id`, `client_id`, `service_id`
- `booking_date`, `booking_time`, `duration_minutes`
- `status` (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)

### **Portfolio**
- `id`, `barbershop_id`, `barber_id`
- `title`, `description`, `before_photo_url`, `after_photo_url`
- `hairstyle_tags` (JSON), `is_featured`, `likes_count`

### **AI Try-Ons**
- `id`, `barbershop_id`, `client_id`, `session_id`
- `original_photo_url`, `result_photo_url`, `hairstyle_name`
- `face_shape`, `hair_type`

---

## 💰 Pricing Strategy

| Tier | Price | AI Try-Ons | Barbers | Features |
|------|-------|-----------|---------|----------|
| **FREE** | $0/forever | 10/month | 1 | Basic booking, Subdomain only |
| **STARTER** | $19/month ($190/year) | 100/month | 3 | Advanced booking, Custom domain, Analytics |
| **PROFESSIONAL** | $49/month ($490/year) | Unlimited | 10 | AI Chatbot, WhatsApp, Priority support |
| **ENTERPRISE** | $99/month ($990/year) | Unlimited | Unlimited | Multi-location, White-label, API access |

**💡 Monetization Channels:**
1. Monthly/Yearly subscriptions
2. AI Try-On usage limits
3. Premium features (White-label, API)
4. Transaction fees (future: integrated payments)

---

## 🏗️ Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main Hono application
│   ├── renderer.tsx           # JSX renderer
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── routes/               # API route handlers (TODO)
├── public/
│   └── static/
│       ├── app.js            # Frontend JavaScript
│       └── styles.css        # Custom CSS
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── dist/                      # Build output
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc            # Cloudflare configuration
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

---

## 🚧 Features In Progress

### 🔨 Phase 2 - Core Features (Next)
- [ ] **AI Virtual Try-On Implementation**
  - Image upload & processing
  - Hairstyle library (200+ styles)
  - Face shape detection
  - Real-time try-on results
  
- [ ] **Booking System UI**
  - Calendar view with availability
  - Real-time booking confirmation
  - Email/SMS reminders
  - No-show prediction algorithm

- [ ] **AI Chatbot Consultation**
  - Natural language processing
  - Hairstyle recommendations
  - Hair care tips
  - Product suggestions

### 🔨 Phase 3 - Dashboard & Analytics
- [ ] **Barber Dashboard**
  - Revenue tracking
  - Booking management
  - Client insights
  - Portfolio management
  
- [ ] **Analytics Dashboard**
  - Popular styles trends
  - Peak hours analysis
  - Client retention metrics
  - Revenue reports

### 🔨 Phase 4 - Authentication & Payments
- [ ] **Authentication System**
  - Multi-role auth (Owner, Admin, Barber, Client)
  - Session management
  - Password reset
  
- [ ] **Payment Gateway**
  - Stripe integration
  - Subscription management
  - Invoice generation
  - Payment history

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Wrangler CLI (for Cloudflare deployment)

### Local Development

```bash
# Clone repository
git clone https://github.com/Estes786/barber-ai-saas.git
cd barber-ai-saas

# Install dependencies
npm install

# Build project
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# Or use npm scripts
npm run dev:sandbox

# Test server
curl http://localhost:3000
```

### Database Setup (For D1)

```bash
# Create D1 database (when ready for production)
npx wrangler d1 create barber-ai-production

# Apply migrations
npm run db:migrate:local    # Local
npm run db:migrate:prod     # Production

# Seed demo data
npm run db:seed

# Reset database
npm run db:reset
```

### Deployment to Cloudflare Pages

```bash
# Build project
npm run build

# Deploy to Cloudflare
npm run deploy:prod

# Or manual deployment
npx wrangler pages deploy dist --project-name barber-ai-saas
```

---

## 📝 Available NPM Scripts

```bash
npm run dev              # Vite dev server
npm run dev:sandbox      # Wrangler dev (sandbox)
npm run dev:d1           # Wrangler dev with D1
npm run build            # Build for production
npm run deploy           # Build & deploy
npm run deploy:prod      # Deploy to production
npm run clean-port       # Kill port 3000
npm run test             # Test with curl
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to prod
npm run db:seed          # Seed demo data
npm run db:reset         # Reset database
```

---

## 🎨 Design Highlights

### Color Palette
- **Primary Gradient:** Purple (#667eea) to Indigo (#764ba2)
- **Secondary:** Blue, Pink, Amber, Green (for feature cards)
- **Background:** Gray-50 to Gray-100
- **Text:** Gray-900 (dark), Gray-600 (muted)

### Typography
- **Headings:** Bold, 4xl-7xl sizes
- **Body:** Regular, xl-2xl sizes
- **CTA Buttons:** Semibold, lg sizes

### Animations
- Fade-in on scroll
- Hover scale effects
- Smooth transitions
- Animated counters

---

## 🔐 Environment Variables (Production)

When deploying to production, configure these:

```bash
# .dev.vars (local development)
CLOUDFLARE_API_TOKEN=your_token_here

# Cloudflare Secrets (production)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put SMTP_PASSWORD
```

---

## 📈 Business Model

### Target Market
1. **Solo Barbers** - Individual professionals (STARTER tier)
2. **Small Barbershops** - 2-10 barbers (PROFESSIONAL tier)
3. **Barbershop Chains** - Multi-location (ENTERPRISE tier)

### Revenue Projections (Year 1)
- 500 FREE users (conversion funnel)
- 300 STARTER ($19/mo) = $5,700/mo
- 100 PROFESSIONAL ($49/mo) = $4,900/mo
- 20 ENTERPRISE ($99/mo) = $1,980/mo
- **Total: $12,580/month = $150,960/year**

### Growth Strategy
1. **SEO Optimization** (local barber searches)
2. **Social Media** (Instagram, TikTok showcases)
3. **Referral Program** (20% commission for 6 months)
4. **Partnerships** (barber supply companies)
5. **Content Marketing** (YouTube tutorials, blogs)

---

## 🤝 Contributing

Currently in active development. Contributions welcome after MVP launch!

---

## 📄 License

Proprietary - All rights reserved

---

## 👨‍💻 Developer

Built with ❤️ by **Estes786**

**Contact:**
- GitHub: [@Estes786](https://github.com/Estes786)
- Platform: [Barber AI SaaS](https://3000-ilen0rklemv0iv350jc4b-b32ec7bb.sandbox.novita.ai)

---

## 🙏 Acknowledgments

- **Cloudflare** - For amazing Workers/Pages platform
- **Hono** - For lightweight web framework
- **TailwindCSS** - For rapid UI development
- **Font Awesome** - For beautiful icons

---

## 📊 Current Status

**✅ Completed:**
- Project setup & architecture
- Database schema design
- Landing page with pricing
- API routes foundation
- GitHub repository setup

**🚧 In Progress:**
- AI Virtual Try-On feature
- Booking system UI
- Dashboard development

**📅 Last Updated:** January 13, 2026

---

**🚀 Ready to revolutionize the barbershop industry with AI!** 💈🤖✨
