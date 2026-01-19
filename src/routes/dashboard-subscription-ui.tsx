import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Dashboard-integrated subscription management (authenticated users only)
app.get('/dashboard/subscription', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Management - Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <button onclick="history.back()" class="text-white hover:text-gray-200 transition">
                            <i class="fas fa-arrow-left text-xl mr-2"></i>
                        </button>
                        <div class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-white mr-2"></i>
                            <span class="text-xl font-bold text-white">Subscription Management</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-info" class="text-white font-semibold"></span>
                        <span id="role-badge" class="px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-bold rounded-full"></span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="pt-8 pb-20 px-4">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold mb-4">
                        <span class="gradient-text">Manage Your Subscription</span>
                    </h1>
                    <p class="text-xl text-gray-600">
                        Choose the perfect plan for your needs
                    </p>
                </div>

                <!-- Current Plan Overview -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <div class="flex items-center space-x-3 mb-2">
                                <i class="fas fa-crown text-4xl text-yellow-300"></i>
                                <div>
                                    <h2 class="text-3xl font-bold">FREE Plan</h2>
                                    <p class="text-purple-200">Active since January 2026</p>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-5xl font-bold mb-1">$0</div>
                            <div class="text-purple-200">per month</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white bg-opacity-20 rounded-xl p-4">
                            <div class="text-sm text-purple-200 mb-1">Monthly Bookings</div>
                            <div class="text-2xl font-bold">5 / 10</div>
                            <div class="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                                <div class="bg-yellow-400 h-2 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-xl p-4">
                            <div class="text-sm text-purple-200 mb-1">AI Try-Ons</div>
                            <div class="text-2xl font-bold">3 / 5</div>
                            <div class="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                                <div class="bg-green-400 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>
                        <div class="bg-white bg-opacity-20 rounded-xl p-4">
                            <div class="text-sm text-purple-200 mb-1">Chat Messages</div>
                            <div class="text-2xl font-bold">15 / 30</div>
                            <div class="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                                <div class="bg-blue-400 h-2 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Plan Comparison -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-layer-group text-purple-600 mr-2"></i>
                        Available Plans
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <!-- FREE -->
                        <div class="border-2 border-purple-600 rounded-xl p-6 relative">
                            <div class="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full absolute top-4 right-4">CURRENT</div>
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">FREE</h3>
                                <div class="text-3xl font-bold text-gray-900 mb-1">$0</div>
                                <div class="text-gray-600 text-sm">per month</div>
                            </div>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>10 bookings/month
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>5 AI try-ons
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Basic AI chatbot
                                </li>
                                <li class="flex items-center text-gray-400">
                                    <i class="fas fa-times text-gray-300 mr-2"></i>Advanced analytics
                                </li>
                            </ul>
                        </div>

                        <!-- STARTER -->
                        <div class="border-2 border-gray-300 rounded-xl p-6 hover:border-purple-600 transition">
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">STARTER</h3>
                                <div class="text-3xl font-bold text-gray-900 mb-1">$19</div>
                                <div class="text-gray-600 text-sm">per month</div>
                            </div>
                            <ul class="space-y-2 text-sm mb-4">
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>50 bookings/month
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>20 AI try-ons
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Full AI chatbot
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Basic analytics
                                </li>
                            </ul>
                            <button onclick="upgradeToPlan('STARTER', 19)" class="w-full gradient-bg text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                Upgrade Now
                            </button>
                        </div>

                        <!-- PRO -->
                        <div class="border-2 border-purple-600 rounded-xl p-6 relative bg-purple-50">
                            <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full absolute top-4 right-4">POPULAR</div>
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">PRO</h3>
                                <div class="text-3xl font-bold text-gray-900 mb-1">$49</div>
                                <div class="text-gray-600 text-sm">per month</div>
                            </div>
                            <ul class="space-y-2 text-sm mb-4">
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Unlimited bookings
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Unlimited AI try-ons
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Advanced AI features
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Advanced analytics
                                </li>
                            </ul>
                            <button onclick="upgradeToPlan('PRO', 49)" class="w-full gradient-bg text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                Upgrade Now
                            </button>
                        </div>

                        <!-- ENTERPRISE -->
                        <div class="border-2 border-gray-300 rounded-xl p-6 hover:border-purple-600 transition">
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">ENTERPRISE</h3>
                                <div class="text-3xl font-bold text-gray-900 mb-1">$99</div>
                                <div class="text-gray-600 text-sm">per month</div>
                            </div>
                            <ul class="space-y-2 text-sm mb-4">
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Everything in PRO
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Multi-location
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Priority support
                                </li>
                                <li class="flex items-center text-gray-700">
                                    <i class="fas fa-check text-green-500 mr-2"></i>Custom branding
                                </li>
                            </ul>
                            <button onclick="upgradeToPlan('ENTERPRISE', 99)" class="w-full gradient-bg text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Billing History -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-file-invoice text-purple-600 mr-2"></i>
                        Recent Billing History
                    </h2>
                    
                    <div class="text-center text-gray-500 text-sm py-8">
                        <i class="fas fa-inbox text-4xl mb-4"></i>
                        <p>No billing history yet. Upgrade to a paid plan to see invoices here.</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
          // Auth check inherited from dashboard - user already authenticated
          const token = localStorage.getItem('sb-access-token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          // No aggressive auth check - trust dashboard auth
          // If token missing, user wouldn't even reach dashboard
          if (!token || !user.role) {
            // Gentle redirect with message
            alert('Session expired. Please login again.');
            window.location.href = '/auth/login';
          }

          // Display user info
          document.getElementById('user-info').textContent = user.full_name || user.email;
          document.getElementById('role-badge').textContent = (user.role || '').toUpperCase();

          // Logout
          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          // Upgrade to plan
          function upgradeToPlan(planName, price) {
            // Redirect to upgrade page with tier and billing cycle
            window.location.href = '/subscription/upgrade?tier=' + planName + '&billing=MONTHLY';
          }
        </script>
    </body>
    </html>
  `)
})

export default app
