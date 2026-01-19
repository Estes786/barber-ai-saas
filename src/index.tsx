import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { CloudflareBindings } from './types'
import apiRoutes from './routes/api'
import authRoutes from './routes/auth'
import authUIRoutes from './routes/auth-ui'
import dashboardApiRoutes from './routes/dashboard-api'
import dashboardUIRoutes from './routes/dashboard-ui-isolated'
import paymentRoutes from './routes/payment'
import subscriptionRoutes from './routes/subscription'
import pricingUIRoutes from './routes/pricing-ui'
import subscriptionUIRoutes from './routes/subscription-ui'
import dashboardSubscriptionUIRoutes from './routes/dashboard-subscription-ui'
import bossDashboardUIRoutes from './routes/boss-dashboard-ui'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ 
  root: './public',
  manifest: {} // Add empty manifest to satisfy TypeScript
}))

// Mount Phase 2 API routes (Supabase-powered)
app.route('/api', apiRoutes)

// Mount Phase 3.1 Auth routes (API)
app.route('/auth', authRoutes)

// Mount Phase 3.1 Auth UI routes (Pages)
app.route('/auth', authUIRoutes)

// Mount Phase 3.2 Dashboard routes (API)
app.route('/api/dashboard', dashboardApiRoutes)

// Mount Phase 3.2 Dashboard UI routes (Pages)
app.route('/', dashboardUIRoutes)

// Mount Phase 3.3 Payment routes (API)
app.route('/api/payment', paymentRoutes)

// Mount Phase 3.3 Subscription routes (API)
app.route('/api/subscription', subscriptionRoutes)

// Mount Phase 3.3 Pricing UI routes (Pages)
app.route('/', pricingUIRoutes)

// Mount Phase 3.3 Subscription UI routes (Pages)
app.route('/', subscriptionUIRoutes)

// Mount Dashboard Subscription UI routes (Pages) - authenticated only
app.route('/', dashboardSubscriptionUIRoutes)

// Mount L4 Boss Dashboard UI routes (Pages)
app.route('/', bossDashboardUIRoutes)

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

// ========== PHASE 2 DEMO PAGES ==========

// AI Virtual Try-On Demo Page
app.get('/demo/try-on', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Virtual Try-On Demo - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <a href="/" class="flex items-center">
                        <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                        <span class="text-xl font-bold">Barber AI SaaS</span>
                    </a>
                    <a href="/" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Home
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-12">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-wand-magic-sparkles text-purple-600 mr-3"></i>
                    AI Virtual Try-On Demo
                </h1>
                <p class="text-xl text-gray-600">
                    Upload your photo and try different hairstyles instantly with AI
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Upload Section -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-upload text-purple-600 mr-2"></i>
                        Upload Your Photo
                    </h2>
                    
                    <div id="upload-zone" class="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition">
                        <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                        <p class="text-lg text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p class="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        <input type="file" id="photo-upload" class="hidden" accept="image/*">
                    </div>

                    <div id="uploaded-photo" class="hidden mt-6">
                        <img id="photo-preview" class="w-full rounded-xl shadow-lg" alt="Uploaded photo">
                        <div id="face-shape-result" class="mt-4 p-4 bg-purple-50 rounded-lg hidden">
                            <p class="text-sm font-semibold text-purple-900">Detected Face Shape:</p>
                            <p class="text-2xl font-bold text-purple-600" id="face-shape-text"></p>
                            <p class="text-sm text-gray-600 mt-2">Confidence: <span id="face-confidence"></span>%</p>
                        </div>
                    </div>
                </div>

                <!-- Hairstyle Selection -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-palette text-purple-600 mr-2"></i>
                        Choose Hairstyle
                    </h2>
                    
                    <div id="hairstyle-grid" class="grid grid-cols-2 gap-4">
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="fade">
                            <i class="fas fa-cut text-3xl text-purple-600 mb-2"></i>
                            <p class="font-semibold">Fade</p>
                        </button>
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="undercut">
                            <i class="fas fa-cut text-3xl text-indigo-600 mb-2"></i>
                            <p class="font-semibold">Undercut</p>
                        </button>
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="pompadour">
                            <i class="fas fa-cut text-3xl text-blue-600 mb-2"></i>
                            <p class="font-semibold">Pompadour</p>
                        </button>
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="buzz">
                            <i class="fas fa-cut text-3xl text-green-600 mb-2"></i>
                            <p class="font-semibold">Buzz Cut</p>
                        </button>
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="crew">
                            <i class="fas fa-cut text-3xl text-pink-600 mb-2"></i>
                            <p class="font-semibold">Crew Cut</p>
                        </button>
                        <button class="hairstyle-btn p-4 border-2 border-gray-300 rounded-xl hover:border-purple-600 transition" data-style="quiff">
                            <i class="fas fa-cut text-3xl text-orange-600 mb-2"></i>
                            <p class="font-semibold">Quiff</p>
                        </button>
                    </div>

                    <div id="result-section" class="hidden mt-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Result</h3>
                        <div id="loading" class="hidden text-center py-8">
                            <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                            <p class="text-gray-600">Generating your new look...</p>
                        </div>
                        <div id="result-image" class="hidden">
                            <img id="try-on-result" class="w-full rounded-xl shadow-lg" alt="Try-on result">
                            <button id="download-btn" class="w-full mt-4 bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700">
                                <i class="fas fa-download mr-2"></i>Download Result
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
          let uploadedImage = null;
          
          // Upload zone click handler
          document.getElementById('upload-zone').addEventListener('click', () => {
            document.getElementById('photo-upload').click();
          });

          // Photo upload handler
          document.getElementById('photo-upload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
              uploadedImage = event.target.result;
              document.getElementById('photo-preview').src = uploadedImage;
              document.getElementById('uploaded-photo').classList.remove('hidden');
              
              // Detect face shape
              try {
                const response = await fetch('/api/tryon/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: uploadedImage })
                });
                
                const data = await response.json();
                if (data.success) {
                  document.getElementById('face-shape-result').classList.remove('hidden');
                  document.getElementById('face-shape-text').textContent = data.face_shape.toUpperCase();
                  document.getElementById('face-confidence').textContent = (data.confidence * 100).toFixed(0);
                }
              } catch (error) {
                console.error('Face detection error:', error);
              }
            };
            reader.readAsDataURL(file);
          });

          // Hairstyle selection handler
          document.querySelectorAll('.hairstyle-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              if (!uploadedImage) {
                alert('Please upload a photo first!');
                return;
              }

              const hairstyle = btn.dataset.style;
              document.getElementById('result-section').classList.remove('hidden');
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('result-image').classList.add('hidden');

              try {
                const response = await fetch('/api/tryon/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    image: uploadedImage,
                    hairstyle_id: hairstyle
                  })
                });

                const data = await response.json();
                if (data.success) {
                  document.getElementById('loading').classList.add('hidden');
                  document.getElementById('result-image').classList.remove('hidden');
                  document.getElementById('try-on-result').src = data.result_image;
                } else {
                  alert('Generation failed: ' + (data.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error generating try-on result');
                console.error(error);
              }
            });
          });
        </script>
    </body>
    </html>
  `)
})

// Booking System Demo Page
app.get('/demo/booking', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Booking System - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <a href="/" class="flex items-center">
                        <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                        <span class="text-xl font-bold">Barber AI SaaS</span>
                    </a>
                    <a href="/" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Home
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-12">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-calendar-check text-purple-600 mr-3"></i>
                    Smart Booking System
                </h1>
                <p class="text-xl text-gray-600">
                    Book your appointment in seconds with our AI-powered system
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Step 1: Select Service -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <span class="bg-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">1</span>
                        Select Service
                    </h2>
                    <div class="space-y-3">
                        <div class="service-option p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 transition">
                            <p class="font-semibold">Haircut</p>
                            <p class="text-sm text-gray-600">30 min • $25</p>
                        </div>
                        <div class="service-option p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 transition">
                            <p class="font-semibold">Haircut + Beard Trim</p>
                            <p class="text-sm text-gray-600">45 min • $35</p>
                        </div>
                        <div class="service-option p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 transition">
                            <p class="font-semibold">Deluxe Package</p>
                            <p class="text-sm text-gray-600">60 min • $50</p>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Choose Date & Time -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <span class="bg-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">2</span>
                        Pick Date & Time
                    </h2>
                    <input type="date" class="w-full p-3 border-2 border-gray-300 rounded-lg mb-4" id="date-picker">
                    <div id="time-slots" class="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">09:00</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">09:30</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">10:00</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">10:30</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">11:00</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">11:30</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">14:00</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">14:30</button>
                        <button class="time-slot p-2 border-2 border-gray-300 rounded-lg hover:border-purple-600 transition text-sm">15:00</button>
                    </div>
                </div>

                <!-- Step 3: Contact Info -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <span class="bg-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">3</span>
                        Your Information
                    </h2>
                    <form id="booking-form" class="space-y-4">
                        <input type="text" placeholder="Full Name" class="w-full p-3 border-2 border-gray-300 rounded-lg" required>
                        <input type="email" placeholder="Email" class="w-full p-3 border-2 border-gray-300 rounded-lg" required>
                        <input type="tel" placeholder="Phone Number" class="w-full p-3 border-2 border-gray-300 rounded-lg" required>
                        <textarea placeholder="Special requests (optional)" class="w-full p-3 border-2 border-gray-300 rounded-lg h-24"></textarea>
                        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700">
                            <i class="fas fa-check mr-2"></i>Confirm Booking
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <script>
          // Set minimum date to today
          const dateInput = document.getElementById('date-picker');
          dateInput.min = new Date().toISOString().split('T')[0];
          dateInput.value = dateInput.min;

          // Form submission
          document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Booking confirmed! You will receive a confirmation email shortly.');
          });
        </script>
    </body>
    </html>
  `)
})

// AI Chatbot Demo Page
app.get('/demo/chat', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Consultation Chatbot - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <a href="/" class="flex items-center">
                        <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                        <span class="text-xl font-bold">Barber AI SaaS</span>
                    </a>
                    <a href="/" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Home
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-robot text-purple-600 mr-3"></i>
                    AI Consultation Assistant
                </h1>
                <p class="text-xl text-gray-600">
                    Get personalized hairstyle recommendations and hair care tips
                </p>
            </div>

            <div class="bg-white rounded-2xl shadow-lg">
                <!-- Chat Header -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-robot text-purple-600 text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">Barber AI Assistant</h3>
                            <p class="text-sm opacity-90">Online • Always here to help</p>
                        </div>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div id="chat-messages" class="p-6 h-96 overflow-y-auto space-y-4">
                    <div class="flex items-start">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <i class="fas fa-robot text-purple-600"></i>
                        </div>
                        <div class="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                            <p class="text-gray-800">Hi! I'm your AI barber assistant. I can help you find the perfect hairstyle, provide hair care tips, and answer any questions. What would you like to know?</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Suggestions -->
                <div class="px-6 pb-4">
                    <p class="text-sm text-gray-600 mb-2">Quick suggestions:</p>
                    <div class="flex flex-wrap gap-2">
                        <button class="suggestion-btn px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition">
                            What suits my face shape?
                        </button>
                        <button class="suggestion-btn px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition">
                            Show me fade styles
                        </button>
                        <button class="suggestion-btn px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition">
                            Hair care tips
                        </button>
                        <button class="suggestion-btn px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition">
                            Book appointment
                        </button>
                    </div>
                </div>

                <!-- Chat Input -->
                <form id="chat-form" class="border-t p-4">
                    <div class="flex gap-2">
                        <input type="text" id="chat-input" placeholder="Type your message..." class="flex-1 p-3 border-2 border-gray-300 rounded-full focus:border-purple-600 outline-none" required>
                        <button type="submit" class="bg-purple-600 text-white w-12 h-12 rounded-full hover:bg-purple-700 transition flex items-center justify-center">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script>
          const chatMessages = document.getElementById('chat-messages');
          const chatForm = document.getElementById('chat-form');
          const chatInput = document.getElementById('chat-input');
          const context = [];

          function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'flex items-start ' + (isUser ? 'justify-end' : '');
            
            if (isUser) {
              messageDiv.innerHTML = \`
                <div class="bg-purple-600 text-white rounded-2xl rounded-tr-none p-4 max-w-xs">
                  <p>\${text}</p>
                </div>
              \`;
            } else {
              messageDiv.innerHTML = \`
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <i class="fas fa-robot text-purple-600"></i>
                </div>
                <div class="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                  <p class="text-gray-800">\${text}</p>
                </div>
              \`;
            }
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }

          async function sendMessage(message) {
            addMessage(message, true);
            context.push(\`Client: \${message}\`);
            
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'flex items-center';
            typingDiv.innerHTML = \`
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-robot text-purple-600"></i>
              </div>
              <div class="bg-gray-100 rounded-2xl p-4">
                <i class="fas fa-spinner fa-spin text-purple-600"></i>
              </div>
            \`;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
              const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context })
              });

              const data = await response.json();
              document.getElementById('typing-indicator').remove();
              
              if (data.success) {
                addMessage(data.response);
                context.push(\`Barber AI: \${data.response}\`);
              } else {
                addMessage(data.fallback_response || "I'm here to help! What would you like to know?");
              }
            } catch (error) {
              document.getElementById('typing-indicator').remove();
              addMessage("I'm here to help! What would you like to know about hairstyles?");
            }
          }

          chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;
            
            sendMessage(message);
            chatInput.value = '';
          });

          document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              sendMessage(btn.textContent);
            });
          });
        </script>
    </body>
    </html>
  `)
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
                        <a href="/pricing" class="text-gray-700 hover:text-purple-600 transition">Pricing</a>
                        <a href="/demo/try-on" class="text-gray-700 hover:text-purple-600 transition">Try AI Demo</a>
                        <a href="/demo/booking" class="text-gray-700 hover:text-purple-600 transition">Booking Demo</a>
                        <a href="/demo/chat" class="text-gray-700 hover:text-purple-600 transition">Chat Demo</a>
                        <a href="/auth/login" class="text-gray-700 hover:text-purple-600 transition">Login</a>
                        <a href="/auth/register" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition hover-scale">
                            Start Free Trial
                        </a>
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
                    <a href="/pricing" class="block text-gray-700 hover:text-purple-600">Pricing</a>
                    <a href="/demo/try-on" class="block text-gray-700 hover:text-purple-600">Try AI Demo</a>
                    <a href="/demo/booking" class="block text-gray-700 hover:text-purple-600">Booking Demo</a>
                    <a href="/demo/chat" class="block text-gray-700 hover:text-purple-600">Chat Demo</a>
                    <a href="/auth/login" class="block text-gray-700 hover:text-purple-600">Login</a>
                    <a href="/auth/register" class="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-center">
                        Start Free Trial
                    </a>
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
                        <a href="/auth/register" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition hover-scale inline-block text-center">
                            <i class="fas fa-rocket mr-2"></i>
                            Start Free 14-Day Trial
                        </a>
                        <a href="/demo/try-on" class="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition hover-scale inline-block text-center">
                            <i class="fas fa-wand-magic-sparkles mr-2"></i>
                            Try AI Demo
                        </a>
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
                        <a href="/auth/register" class="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition text-center">
                            Start Free Trial
                        </a>
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
                        <a href="/auth/register" class="block w-full bg-white text-purple-600 py-3 rounded-full font-semibold hover:bg-purple-50 transition text-center">
                            Start Free Trial
                        </a>
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
                    <a href="/auth/register" class="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition hover-scale inline-block text-center">
                        <i class="fas fa-rocket mr-2"></i>
                        Start Free 14-Day Trial
                    </a>
                    <a href="/demo/try-on" class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transition hover-scale inline-block text-center">
                        <i class="fas fa-calendar mr-2"></i>
                        Try Demo
                    </a>
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
                            <li><a href="/pricing" class="hover:text-white">Pricing</a></li>
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
