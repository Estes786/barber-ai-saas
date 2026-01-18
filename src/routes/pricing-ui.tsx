import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Pricing Page with Subscription Tiers
app.get('/pricing', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pricing - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .tier-card { transition: all 0.3s ease; }
            .tier-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .popular-badge { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
            .feature-check { color: #10b981; }
            .feature-disabled { color: #d1d5db; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-md fixed w-full top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-3xl gradient-text mr-2"></i>
                            <span class="text-2xl font-bold gradient-text">Barber AI</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/" class="text-gray-600 hover:text-purple-600">Home</a>
                        <a href="/pricing" class="text-purple-600 font-semibold">Pricing</a>
                        <a href="/auth/login" class="text-gray-600 hover:text-purple-600">Login</a>
                        <a href="/auth/register" class="gradient-bg text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                            Get Started
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="pt-24 pb-20 px-4">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-16">
                    <h1 class="text-5xl font-bold mb-4">
                        <span class="gradient-text">Simple, Transparent Pricing</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8">
                        Choose the perfect plan for your barbershop. No hidden fees.
                    </p>
                    
                    <!-- Billing Toggle -->
                    <div class="flex items-center justify-center space-x-4 mb-8">
                        <span id="monthly-label" class="text-gray-700 font-semibold">Monthly</span>
                        <button id="billing-toggle" class="relative inline-flex h-8 w-14 items-center rounded-full bg-purple-600 transition">
                            <span id="toggle-dot" class="inline-block h-6 w-6 transform rounded-full bg-white transition translate-x-1"></span>
                        </button>
                        <span id="yearly-label" class="text-gray-500">
                            Yearly <span class="text-sm text-green-600 font-semibold">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                <!-- Social Proof Section -->
                <div class="bg-white rounded-2xl shadow-md p-8 mb-12">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div class="text-4xl font-bold text-purple-600 mb-2">500+</div>
                            <div class="text-gray-600">Active Barbershops</div>
                        </div>
                        <div>
                            <div class="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                            <div class="text-gray-600">Bookings Processed</div>
                        </div>
                        <div>
                            <div class="text-4xl font-bold text-purple-600 mb-2">4.9/5</div>
                            <div class="text-gray-600">User Satisfaction</div>
                        </div>
                        <div>
                            <div class="text-4xl font-bold text-purple-600 mb-2">$2M+</div>
                            <div class="text-gray-600">Revenue Generated</div>
                        </div>
                    </div>
                </div>

                <!-- Pricing Tiers -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <!-- FREE TIER -->
                    <div class="tier-card bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                            <div class="mb-6">
                                <span class="text-4xl font-bold text-gray-900">$0</span>
                                <span class="text-gray-500">/month</span>
                            </div>
                            <p class="text-gray-600 mb-6">Perfect for trying out</p>
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Up to <strong>5 bookings/month</strong></span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Basic AI virtual try-on</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Email support</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times feature-disabled mt-1 mr-3"></i>
                                <span class="text-gray-400">AI chatbot consultation</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times feature-disabled mt-1 mr-3"></i>
                                <span class="text-gray-400">Advanced analytics</span>
                            </li>
                        </ul>

                        <button onclick="selectPlan('FREE', 0)" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                            Start Free
                        </button>
                    </div>

                    <!-- STARTER TIER -->
                    <div class="tier-card bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-300">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                            <div class="mb-6">
                                <span class="text-4xl font-bold text-gray-900">
                                    <span class="monthly-price">$19</span>
                                    <span class="yearly-price hidden">$15</span>
                                </span>
                                <span class="text-gray-500">/month</span>
                            </div>
                            <p class="text-gray-600 mb-6">For small barbershops</p>
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Up to <strong>50 bookings/month</strong></span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Full AI virtual try-on</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">AI chatbot consultation</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Basic analytics</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Priority email support</span>
                            </li>
                        </ul>

                        <button onclick="selectPlan('STARTER', 19)" class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
                            Get Started
                        </button>
                    </div>

                    <!-- PRO TIER (Popular) -->
                    <div class="tier-card bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-600 relative transform scale-105">
                        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span class="popular-badge text-white px-4 py-1 rounded-full text-sm font-semibold">
                                <i class="fas fa-star mr-1"></i> Most Popular
                            </span>
                        </div>

                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-purple-600 mb-2">Pro</h3>
                            <div class="mb-6">
                                <span class="text-4xl font-bold text-gray-900">
                                    <span class="monthly-price">$49</span>
                                    <span class="yearly-price hidden">$39</span>
                                </span>
                                <span class="text-gray-500">/month</span>
                            </div>
                            <p class="text-gray-600 mb-6">For growing businesses</p>
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700"><strong>Unlimited bookings</strong></span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Premium AI features</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Advanced analytics & insights</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">Multi-staff management</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check feature-check mt-1 mr-3"></i>
                                <span class="text-gray-700">24/7 priority support</span>
                            </li>
                        </ul>

                        <button onclick="selectPlan('PRO', 49)" class="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg">
                            Start Pro Plan
                        </button>
                    </div>

                    <!-- ENTERPRISE TIER -->
                    <div class="tier-card bg-gray-900 rounded-2xl shadow-lg p-8 border-2 border-gray-800 text-white">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold mb-2">Enterprise</h3>
                            <div class="mb-6">
                                <span class="text-4xl font-bold">
                                    <span class="monthly-price">$99</span>
                                    <span class="yearly-price hidden">$79</span>
                                </span>
                                <span class="text-gray-400">/month</span>
                            </div>
                            <p class="text-gray-300 mb-6">For large chains</p>
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-400 mt-1 mr-3"></i>
                                <span class="text-gray-200">Everything in Pro</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-400 mt-1 mr-3"></i>
                                <span class="text-gray-200">Multiple locations</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-400 mt-1 mr-3"></i>
                                <span class="text-gray-200">Custom branding</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-400 mt-1 mr-3"></i>
                                <span class="text-gray-200">API access</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-yellow-400 mt-1 mr-3"></i>
                                <span class="text-gray-200">Dedicated account manager</span>
                            </li>
                        </ul>

                        <button onclick="selectPlan('ENTERPRISE', 99)" class="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                            Contact Sales
                        </button>
                    </div>
                </div>

                <!-- Testimonials Section -->
                <div class="mt-20">
                    <h2 class="text-3xl font-bold text-center mb-12">
                        <span class="gradient-text">What Our Customers Say</span>
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="bg-white rounded-2xl p-8 shadow-lg">
                            <div class="flex items-center mb-4">
                                <div class="flex text-yellow-400 text-xl">
                                    ★★★★★
                                </div>
                            </div>
                            <p class="text-gray-700 mb-4 italic">"Reduced our no-show rate from 40% to 10%. The AI try-on feature is a game changer for customer engagement."</p>
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    JD
                                </div>
                                <div>
                                    <div class="font-semibold">John Doe</div>
                                    <div class="text-sm text-gray-500">Owner, Prestige Barbers</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-2xl p-8 shadow-lg">
                            <div class="flex items-center mb-4">
                                <div class="flex text-yellow-400 text-xl">
                                    ★★★★★
                                </div>
                            </div>
                            <p class="text-gray-700 mb-4 italic">"Increased bookings by 300% in the first month. The automated reminders alone are worth the subscription."</p>
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    MK
                                </div>
                                <div>
                                    <div class="font-semibold">Mike Kumar</div>
                                    <div class="text-sm text-gray-500">Owner, Urban Cuts</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-2xl p-8 shadow-lg">
                            <div class="flex items-center mb-4">
                                <div class="flex text-yellow-400 text-xl">
                                    ★★★★★
                                </div>
                            </div>
                            <p class="text-gray-700 mb-4 italic">"Best investment for our barbershop. The analytics help us make data-driven decisions every day."</p>
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    AS
                                </div>
                                <div>
                                    <div class="font-semibold">Alex Smith</div>
                                    <div class="text-sm text-gray-500">Manager, Style Studio</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Features Comparison Table -->
                <div class="mt-20">
                    <h2 class="text-3xl font-bold text-center mb-10">
                        <span class="gradient-text">Compare All Features</span>
                    </h2>
                    
                    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table class="w-full">
                            <thead class="gradient-bg text-white">
                                <tr>
                                    <th class="px-6 py-4 text-left">Features</th>
                                    <th class="px-6 py-4 text-center">Free</th>
                                    <th class="px-6 py-4 text-center">Starter</th>
                                    <th class="px-6 py-4 text-center">Pro</th>
                                    <th class="px-6 py-4 text-center">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <td class="px-6 py-4 font-semibold">Monthly Bookings</td>
                                    <td class="px-6 py-4 text-center">5</td>
                                    <td class="px-6 py-4 text-center">50</td>
                                    <td class="px-6 py-4 text-center">Unlimited</td>
                                    <td class="px-6 py-4 text-center">Unlimited</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-semibold">AI Virtual Try-On</td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-semibold">AI Chatbot</td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-times text-gray-300"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                    <td class="px-6 py-4 text-center"><i class="fas fa-check text-green-500"></i></td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-semibold">Analytics & Insights</td>
                                    <td class="px-6 py-4 text-center">Basic</td>
                                    <td class="px-6 py-4 text-center">Standard</td>
                                    <td class="px-6 py-4 text-center">Advanced</td>
                                    <td class="px-6 py-4 text-center">Custom</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-semibold">Staff Management</td>
                                    <td class="px-6 py-4 text-center">1</td>
                                    <td class="px-6 py-4 text-center">3</td>
                                    <td class="px-6 py-4 text-center">Unlimited</td>
                                    <td class="px-6 py-4 text-center">Unlimited</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 font-semibold">Support</td>
                                    <td class="px-6 py-4 text-center">Email</td>
                                    <td class="px-6 py-4 text-center">Priority</td>
                                    <td class="px-6 py-4 text-center">24/7</td>
                                    <td class="px-6 py-4 text-center">Dedicated</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ROI Calculator Section -->
                <div class="mt-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-12 text-white">
                    <h2 class="text-4xl font-bold text-center mb-8">Calculate Your ROI</h2>
                    
                    <div class="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label class="block text-sm font-semibold mb-2">Average Booking Price ($)</label>
                                <input type="number" id="booking-price" value="50" class="w-full px-4 py-3 rounded-lg text-gray-900" placeholder="50">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-2">Bookings per Month</label>
                                <input type="number" id="bookings-month" value="100" class="w-full px-4 py-3 rounded-lg text-gray-900" placeholder="100">
                            </div>
                        </div>
                        
                        <div class="bg-white/20 backdrop-blur-xl rounded-xl p-6">
                            <div class="text-center">
                                <div class="text-sm mb-2">With Barber AI Pro ($49/month):</div>
                                <div class="text-5xl font-bold mb-4" id="roi-result">+$1,951</div>
                                <div class="text-sm opacity-90">Additional monthly revenue (after reducing no-shows by 40%)</div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 mt-6 text-center">
                            <div>
                                <div class="text-2xl font-bold" id="roi-year-1">$23,412</div>
                                <div class="text-sm opacity-90">Year 1 Gain</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold">4,000%</div>
                                <div class="text-sm opacity-90">ROI</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold">3 days</div>
                                <div class="text-sm opacity-90">Payback Period</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FAQ Section -->
                <div class="mt-20">
                    <h2 class="text-3xl font-bold text-center mb-10">
                        <span class="gradient-text">Frequently Asked Questions</span>
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div class="bg-white rounded-xl p-6 shadow-md">
                            <h3 class="font-bold text-lg mb-2"><i class="fas fa-question-circle text-purple-600 mr-2"></i>Can I switch plans anytime?</h3>
                            <p class="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md">
                            <h3 class="font-bold text-lg mb-2"><i class="fas fa-question-circle text-purple-600 mr-2"></i>What payment methods do you accept?</h3>
                            <p class="text-gray-600">We accept all major credit cards, bank transfers, and e-wallets through Duitku payment gateway.</p>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md">
                            <h3 class="font-bold text-lg mb-2"><i class="fas fa-question-circle text-purple-600 mr-2"></i>Is there a free trial?</h3>
                            <p class="text-gray-600">Yes! Our Free plan is available forever with no credit card required.</p>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-md">
                            <h3 class="font-bold text-lg mb-2"><i class="fas fa-question-circle text-purple-600 mr-2"></i>Can I cancel anytime?</h3>
                            <p class="text-gray-600">Absolutely! Cancel anytime with no penalties. Your account remains active until the end of billing cycle.</p>
                        </div>
                    </div>
                </div>

                <!-- CTA Section -->
                <div class="mt-20 text-center gradient-bg rounded-3xl p-12 shadow-2xl">
                    <h2 class="text-4xl font-bold text-white mb-4">Ready to Transform Your Barbershop?</h2>
                    <p class="text-xl text-purple-100 mb-8">Join thousands of barbers already using AI to grow their business</p>
                    <div class="flex justify-center space-x-4">
                        <a href="/auth/register" class="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition text-lg">
                            <i class="fas fa-rocket mr-2"></i>Start Free Today
                        </a>
                        <a href="#" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;" class="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition text-lg">
                            View Plans
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-gray-400">© 2026 Barber AI SaaS. All rights reserved.</p>
                <div class="mt-4 space-x-4">
                    <a href="#" class="text-gray-400 hover:text-white">Privacy Policy</a>
                    <a href="#" class="text-gray-400 hover:text-white">Terms of Service</a>
                    <a href="#" class="text-gray-400 hover:text-white">Contact</a>
                </div>
            </div>
        </footer>

        <script>
            let isYearly = false;

            const billingToggle = document.getElementById('billing-toggle');
            const toggleDot = document.getElementById('toggle-dot');
            const monthlyLabel = document.getElementById('monthly-label');
            const yearlyLabel = document.getElementById('yearly-label');
            const monthlyPrices = document.querySelectorAll('.monthly-price');
            const yearlyPrices = document.querySelectorAll('.yearly-price');

            billingToggle.addEventListener('click', () => {
                isYearly = !isYearly;

                if (isYearly) {
                    toggleDot.classList.add('translate-x-7');
                    monthlyLabel.classList.remove('font-semibold');
                    monthlyLabel.classList.add('text-gray-500');
                    yearlyLabel.classList.add('font-semibold');
                    yearlyLabel.classList.remove('text-gray-500');
                    monthlyPrices.forEach(el => el.classList.add('hidden'));
                    yearlyPrices.forEach(el => el.classList.remove('hidden'));
                } else {
                    toggleDot.classList.remove('translate-x-7');
                    monthlyLabel.classList.add('font-semibold');
                    monthlyLabel.classList.remove('text-gray-500');
                    yearlyLabel.classList.remove('font-semibold');
                    yearlyLabel.classList.add('text-gray-500');
                    monthlyPrices.forEach(el => el.classList.remove('hidden'));
                    yearlyPrices.forEach(el => el.classList.add('hidden'));
                }
            });

            function selectPlan(tier, price) {
                const billing = isYearly ? 'YEARLY' : 'MONTHLY';
                const finalPrice = isYearly ? Math.round(price * 0.8 * 12) : price;
                
                // Check if user is logged in (using Supabase token naming)
                const token = localStorage.getItem('sb-access-token');
                
                if (!token) {
                    // Redirect to register with plan selection
                    localStorage.setItem('selected_plan', JSON.stringify({ tier, billing, price: finalPrice }));
                    window.location.href = '/auth/register';
                } else {
                    // Redirect to subscription page
                    window.location.href = \`/subscription/upgrade?tier=\${tier}&billing=\${billing}\`;
                }
            }

            // ROI Calculator
            function calculateROI() {
                const bookingPrice = parseFloat(document.getElementById('booking-price').value) || 50;
                const bookingsMonth = parseFloat(document.getElementById('bookings-month').value) || 100;
                
                const currentRevenue = bookingPrice * bookingsMonth;
                const improvedRevenue = currentRevenue * 1.4; // 40% increase from reducing no-shows
                const planCost = 49;
                const monthlyGain = improvedRevenue - currentRevenue - planCost;
                const yearlyGain = monthlyGain * 12;
                
                document.getElementById('roi-result').textContent = \`+$\${monthlyGain.toLocaleString()}\`;
                document.getElementById('roi-year-1').textContent = \`$\${yearlyGain.toLocaleString()}\`;
            }

            // Initialize ROI Calculator
            document.getElementById('booking-price').addEventListener('input', calculateROI);
            document.getElementById('bookings-month').addEventListener('input', calculateROI);
            calculateROI();
        </script>
    </body>
    </html>
  `)
})

export default app
