import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { CloudflareBindings } from './types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes - Barbershops
app.get('/api/barbershops', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare('SELECT * FROM barbershops WHERE subscription_status = ?')
    .bind('ACTIVE')
    .all()
  return c.json({ barbershops: results })
})

app.get('/api/barbershops/:slug', async (c) => {
  const { DB } = c.env
  const slug = c.req.param('slug')
  
  const barbershop = await DB.prepare('SELECT * FROM barbershops WHERE slug = ?')
    .bind(slug)
    .first()
  
  if (!barbershop) {
    return c.json({ error: 'Barbershop not found' }, 404)
  }
  
  return c.json({ barbershop })
})

// API Routes - Services
app.get('/api/barbershops/:slug/services', async (c) => {
  const { DB } = c.env
  const slug = c.req.param('slug')
  
  const barbershop = await DB.prepare('SELECT id FROM barbershops WHERE slug = ?')
    .bind(slug)
    .first() as any
  
  if (!barbershop) {
    return c.json({ error: 'Barbershop not found' }, 404)
  }
  
  const { results } = await DB.prepare(
    'SELECT * FROM services WHERE barbershop_id = ? AND is_active = 1'
  ).bind(barbershop.id).all()
  
  return c.json({ services: results })
})

// API Routes - Barbers
app.get('/api/barbershops/:slug/barbers', async (c) => {
  const { DB } = c.env
  const slug = c.req.param('slug')
  
  const barbershop = await DB.prepare('SELECT id FROM barbershops WHERE slug = ?')
    .bind(slug)
    .first() as any
  
  if (!barbershop) {
    return c.json({ error: 'Barbershop not found' }, 404)
  }
  
  const { results } = await DB.prepare(
    'SELECT * FROM barbers WHERE barbershop_id = ? AND is_active = 1'
  ).bind(barbershop.id).all()
  
  return c.json({ barbers: results })
})

// API Routes - Portfolio
app.get('/api/barbershops/:slug/portfolio', async (c) => {
  const { DB } = c.env
  const slug = c.req.param('slug')
  
  const barbershop = await DB.prepare('SELECT id FROM barbershops WHERE slug = ?')
    .bind(slug)
    .first() as any
  
  if (!barbershop) {
    return c.json({ error: 'Barbershop not found' }, 404)
  }
  
  const { results } = await DB.prepare(
    'SELECT * FROM portfolio WHERE barbershop_id = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(barbershop.id).all()
  
  return c.json({ portfolio: results })
})

// API Routes - Stats
app.get('/api/stats', async (c) => {
  const { DB } = c.env
  
  const barbershopsCount = await DB.prepare('SELECT COUNT(*) as count FROM barbershops').first() as any
  const bookingsCount = await DB.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').bind('COMPLETED').first() as any
  const clientsCount = await DB.prepare('SELECT COUNT(*) as count FROM clients').first() as any
  
  return c.json({
    barbershops: barbershopsCount?.count || 0,
    bookings: bookingsCount?.count || 0,
    clients: clientsCount?.count || 0
  })
})

// Landing Page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Barber AI SaaS - All-in-One AI Platform for Barber Business</title>
        <meta name="description" content="Transform your barbershop with AI-powered virtual try-on, smart booking system, and business analytics. Start your free trial today!">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg fixed w-full z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-scissors text-3xl gradient-text mr-2"></i>
                        <span class="text-2xl font-bold gradient-text">Barber AI</span>
                    </div>
                    
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#features" class="text-gray-700 hover:text-purple-600 transition">Features</a>
                        <a href="#pricing" class="text-gray-700 hover:text-purple-600 transition">Pricing</a>
                        <a href="#demo" class="text-gray-700 hover:text-purple-600 transition">Demo</a>
                        <a href="#contact" class="text-gray-700 hover:text-purple-600 transition">Contact</a>
                        <button class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition hover-scale">
                            Start Free Trial
                        </button>
                    </div>
                    
                    <div class="md:hidden flex items-center">
                        <button id="mobile-menu-btn" class="text-gray-700">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
                <div class="px-4 py-4 space-y-3">
                    <a href="#features" class="block text-gray-700 hover:text-purple-600">Features</a>
                    <a href="#pricing" class="block text-gray-700 hover:text-purple-600">Pricing</a>
                    <a href="#demo" class="block text-gray-700 hover:text-purple-600">Demo</a>
                    <a href="#contact" class="block text-gray-700 hover:text-purple-600">Contact</a>
                    <button class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full">
                        Start Free Trial
                    </button>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="pt-32 pb-20 bg-gradient-to-br from-purple-50 to-indigo-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center fade-on-scroll">
                    <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                        Transform Your Barbershop with
                        <span class="gradient-text">AI Power</span>
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        All-in-One SaaS Platform featuring AI Virtual Try-On, Smart Booking, 
                        Business Analytics, and Automated Marketing
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition hover-scale">
                            <i class="fas fa-rocket mr-2"></i>
                            Start Free 14-Day Trial
                        </button>
                        <button id="try-on-demo-btn" class="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition hover-scale">
                            <i class="fas fa-wand-magic-sparkles mr-2"></i>
                            Try AI Demo
                        </button>
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 fade-on-scroll">
                    <div class="bg-white rounded-2xl p-8 text-center shadow-xl hover-scale">
                        <div class="text-5xl font-bold gradient-text mb-2" data-count="1500">0</div>
                        <div class="text-gray-600 font-semibold">Active Barbershops</div>
                    </div>
                    <div class="bg-white rounded-2xl p-8 text-center shadow-xl hover-scale">
                        <div class="text-5xl font-bold gradient-text mb-2" data-count="50000">0</div>
                        <div class="text-gray-600 font-semibold">Bookings This Month</div>
                    </div>
                    <div class="bg-white rounded-2xl p-8 text-center shadow-xl hover-scale">
                        <div class="text-5xl font-bold gradient-text mb-2" data-count="25000">0</div>
                        <div class="text-gray-600 font-semibold">AI Try-Ons Generated</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16 fade-on-scroll">
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Powerful Features for <span class="gradient-text">Modern Barbers</span>
                    </h2>
                    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to grow your barbershop business in one platform
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-wand-magic-sparkles text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">AI Virtual Try-On</h3>
                        <p class="text-gray-600 mb-4">
                            Let clients try 200+ hairstyles instantly with AI-powered virtual try-on. 
                            Upload photo and see real-time results.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>200+ Hairstyle Options</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Face Shape Detection</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Real-time Results</li>
                        </ul>
                    </div>

                    <!-- Feature 2 -->
                    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-calendar-check text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Smart Booking System</h3>
                        <p class="text-gray-600 mb-4">
                            24/7 online booking with AI chatbot assistant. Auto-reminders and no-show prevention.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>24/7 AI Chatbot</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Auto Reminders</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>No-Show Prediction</li>
                        </ul>
                    </div>

                    <!-- Feature 3 -->
                    <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-chart-line text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Business Analytics</h3>
                        <p class="text-gray-600 mb-4">
                            Track revenue, popular styles, peak hours, and client retention with powerful dashboards.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Revenue Tracking</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Trend Analysis</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Client Insights</li>
                        </ul>
                    </div>

                    <!-- Feature 4 -->
                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-images text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Portfolio Builder</h3>
                        <p class="text-gray-600 mb-4">
                            Showcase your best work with before/after galleries. Build trust and attract clients.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Before/After Gallery</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Client Testimonials</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Social Sharing</li>
                        </ul>
                    </div>

                    <!-- Feature 5 -->
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-robot text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">AI Consultation</h3>
                        <p class="text-gray-600 mb-4">
                            AI-powered chatbot provides personalized hairstyle recommendations and hair care tips.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Style Recommendations</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Hair Care Tips</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Product Suggestions</li>
                        </ul>
                    </div>

                    <!-- Feature 6 -->
                    <div class="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 hover-scale fade-on-scroll">
                        <div class="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="fas fa-store text-3xl text-white"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Multi-Location</h3>
                        <p class="text-gray-600 mb-4">
                            Manage multiple barbershops from one dashboard. Perfect for growing businesses.
                        </p>
                        <ul class="space-y-2 text-gray-600">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Centralized Dashboard</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Unlimited Locations</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>White-Label Option</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16 fade-on-scroll">
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Simple, <span class="gradient-text">Transparent Pricing</span>
                    </h2>
                    <p class="text-xl text-gray-600 mb-8">
                        Choose the plan that fits your business. All plans include 14-day free trial.
                    </p>
                    
                    <!-- Pricing Toggle -->
                    <div class="flex items-center justify-center gap-4 mb-8">
                        <span class="text-gray-700 font-semibold">Monthly</span>
                        <label class="relative inline-block w-14 h-8">
                            <input type="checkbox" id="pricing-toggle" class="sr-only peer">
                            <div class="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 cursor-pointer transition"></div>
                            <div class="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition peer-checked:translate-x-6"></div>
                        </label>
                        <span class="text-gray-700 font-semibold">Yearly <span class="text-green-500 text-sm">(Save 17%)</span></span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <!-- FREE Tier -->
                    <div class="pricing-card bg-white rounded-2xl p-8 shadow-lg fade-on-scroll">
                        <div class="text-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">FREE</h3>
                            <div class="text-4xl font-bold gradient-text mb-2">
                                $0
                            </div>
                            <p class="text-gray-600">Forever free</p>
                        </div>
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">10 AI try-ons/month</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Basic booking system</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">1 barber profile</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Subdomain only</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times text-gray-300 mr-3 mt-1"></i>
                                <span class="text-gray-400">Custom domain</span>
                            </li>
                        </ul>
                        <button class="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition">
                            Get Started
                        </button>
                    </div>

                    <!-- STARTER Tier -->
                    <div class="pricing-card bg-white rounded-2xl p-8 shadow-lg fade-on-scroll">
                        <div class="text-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">STARTER</h3>
                            <div class="text-4xl font-bold gradient-text mb-2">
                                <span data-monthly="19">$19</span><span data-period>/month</span>
                            </div>
                            <p class="text-gray-600">Perfect for solo barbers</p>
                        </div>
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">100 AI try-ons/month</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Advanced booking + reminders</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Up to 3 barbers</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Custom domain support</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Basic analytics</span>
                            </li>
                        </ul>
                        <button class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition">
                            Start Free Trial
                        </button>
                    </div>

                    <!-- PROFESSIONAL Tier -->
                    <div class="pricing-card bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-2xl text-white relative fade-on-scroll">
                        <div class="featured-badge">POPULAR</div>
                        <div class="text-center mb-6">
                            <h3 class="text-2xl font-bold mb-2">PROFESSIONAL</h3>
                            <div class="text-4xl font-bold mb-2">
                                <span data-monthly="49">$49</span><span data-period>/month</span>
                            </div>
                            <p class="text-purple-100">For growing shops</p>
                        </div>
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>Unlimited AI try-ons</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>AI Chatbot assistant</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>Up to 10 barbers</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>Advanced analytics</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>WhatsApp integration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-300 mr-3 mt-1"></i>
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <button class="w-full bg-white text-purple-600 py-3 rounded-full font-semibold hover:bg-purple-50 transition">
                            Start Free Trial
                        </button>
                    </div>

                    <!-- ENTERPRISE Tier -->
                    <div class="pricing-card bg-white rounded-2xl p-8 shadow-lg fade-on-scroll">
                        <div class="text-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">ENTERPRISE</h3>
                            <div class="text-4xl font-bold gradient-text mb-2">
                                <span data-monthly="99">$99</span><span data-period>/month</span>
                            </div>
                            <p class="text-gray-600">For multi-location chains</p>
                        </div>
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Everything in Pro</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Unlimited barbers</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Multi-location support</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">White-label option</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">API access</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mr-3 mt-1"></i>
                                <span class="text-gray-600">Dedicated account manager</span>
                            </li>
                        </ul>
                        <button class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-on-scroll">
                <h2 class="text-4xl md:text-5xl font-bold mb-6">
                    Ready to Transform Your Barbershop?
                </h2>
                <p class="text-xl mb-8 opacity-90">
                    Join 1,500+ barbershops already using AI to grow their business
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition hover-scale">
                        <i class="fas fa-rocket mr-2"></i>
                        Start Free 14-Day Trial
                    </button>
                    <button class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transition hover-scale">
                        <i class="fas fa-calendar mr-2"></i>
                        Schedule Demo
                    </button>
                </div>
                <p class="mt-6 text-sm opacity-75">
                    No credit card required • Cancel anytime • 24/7 support
                </p>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div class="flex items-center mb-4">
                            <i class="fas fa-scissors text-2xl text-purple-400 mr-2"></i>
                            <span class="text-xl font-bold">Barber AI SaaS</span>
                        </div>
                        <p class="text-gray-400">
                            Empowering barbershops with AI technology since 2024.
                        </p>
                    </div>
                    
                    <div>
                        <h4 class="font-bold mb-4">Product</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#features" class="hover:text-white">Features</a></li>
                            <li><a href="#pricing" class="hover:text-white">Pricing</a></li>
                            <li><a href="#demo" class="hover:text-white">Demo</a></li>
                            <li><a href="#" class="hover:text-white">API Docs</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="font-bold mb-4">Company</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#" class="hover:text-white">About Us</a></li>
                            <li><a href="#" class="hover:text-white">Blog</a></li>
                            <li><a href="#" class="hover:text-white">Careers</a></li>
                            <li><a href="#contact" class="hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="font-bold mb-4">Connect</h4>
                        <div class="flex gap-4">
                            <a href="#" class="text-2xl hover:text-purple-400 transition"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="text-2xl hover:text-purple-400 transition"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="text-2xl hover:text-purple-400 transition"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-2xl hover:text-purple-400 transition"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2026 Barber AI SaaS. All rights reserved. Built with ❤️ using Cloudflare Workers & Hono</p>
                </div>
            </div>
        </footer>

        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
