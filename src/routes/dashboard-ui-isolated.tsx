import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// ======================
// OWNER DASHBOARD - Isolated
// ======================
app.get('/dashboard/owner', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Owner Dashboard - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <div class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-white mr-2"></i>
                            <span class="text-xl font-bold text-white">Owner Portal</span>
                        </div>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard/owner" class="text-white font-semibold border-b-2 border-white pb-1">
                                <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
                            </a>
                            <a href="/boss" class="text-purple-100 hover:text-white transition">
                                <i class="fas fa-crown mr-1"></i>Boss Control
                            </a>
                            <a href="/dashboard/owner/business" class="text-purple-100 hover:text-white transition">
                                <i class="fas fa-store mr-1"></i>Business
                            </a>
                            <a href="/dashboard/owner/staff" class="text-purple-100 hover:text-white transition">
                                <i class="fas fa-users mr-1"></i>Staff
                            </a>
                            <a href="/dashboard/owner/finances" class="text-purple-100 hover:text-white transition">
                                <i class="fas fa-chart-line mr-1"></i>Finances
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-info" class="text-white font-semibold"></span>
                        <span class="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">OWNER</span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Role Indicator -->
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <div class="flex items-center">
                    <i class="fas fa-crown text-yellow-600 text-2xl mr-3"></i>
                    <div>
                        <h3 class="font-bold text-yellow-900">Owner Dashboard</h3>
                        <p class="text-sm text-yellow-700">Manage your barbershop business, staff, and finances</p>
                    </div>
                </div>
            </div>

            <!-- Stats Cards - Owner Specific -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-dollar-sign text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">This Month</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Total Revenue</p>
                    <p class="text-3xl font-bold">$12,450</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-arrow-up mr-1"></i>+15.3% from last month
                    </p>
                </div>

                <div class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-users text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Staff Members</p>
                    <p class="text-3xl font-bold">8</p>
                    <p class="text-xs mt-2 opacity-75">
                        5 Barbers, 3 Support Staff
                    </p>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-calendar-check text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Today</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Bookings</p>
                    <p class="text-3xl font-bold">24</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-hourglass-half mr-1"></i>6 pending approval
                    </p>
                </div>

                <div class="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-user-friends text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Clients</p>
                    <p class="text-3xl font-bold">342</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-plus mr-1"></i>18 new this month
                    </p>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-chart-line text-green-600 mr-2"></i>
                        Revenue Trend (30 Days)
                    </h2>
                    <canvas id="revenue-chart"></canvas>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-user-clock text-blue-600 mr-2"></i>
                        Staff Performance
                    </h2>
                    <canvas id="staff-chart"></canvas>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-bolt text-purple-600 mr-2"></i>
                    Quick Actions
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button class="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center">
                        <i class="fas fa-user-plus text-3xl text-purple-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Add Staff</p>
                    </button>
                    <button class="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center">
                        <i class="fas fa-file-invoice-dollar text-3xl text-blue-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">View Reports</p>
                    </button>
                    <button class="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center">
                        <i class="fas fa-cog text-3xl text-green-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Settings</p>
                    </button>
                    <button class="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition text-center">
                        <i class="fas fa-bell text-3xl text-amber-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Notifications</p>
                    </button>
                </div>
            </div>
        </div>

        <script>
          // Auth check
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (!token || user.role !== 'owner') {
            alert('Access Denied: Owner account required');
            window.location.href = '/auth/login';
          }

          document.getElementById('user-info').textContent = user.full_name || user.email;

          // Logout
          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          // Revenue Chart
          const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
          new Chart(revenueCtx, {
            type: 'line',
            data: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: [{
                label: 'Revenue ($)',
                data: [2800, 3200, 2900, 3550],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true
            }
          });

          // Staff Performance Chart
          const staffCtx = document.getElementById('staff-chart').getContext('2d');
          new Chart(staffCtx, {
            type: 'bar',
            data: {
              labels: ['John', 'Mike', 'Sarah', 'Tom', 'Lisa'],
              datasets: [{
                label: 'Bookings Completed',
                data: [45, 38, 52, 41, 48],
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true
            }
          });
        </script>
    </body>
    </html>
  `)
})

// ======================
// BARBER DASHBOARD - Isolated
// ======================
app.get('/dashboard/barber', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Barber Dashboard - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <div class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-white mr-2"></i>
                            <span class="text-xl font-bold text-white">Barber Portal</span>
                        </div>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard/barber" class="text-white font-semibold border-b-2 border-white pb-1">
                                <i class="fas fa-calendar-alt mr-1"></i>My Schedule
                            </a>
                            <a href="/dashboard/barber/portfolio" class="text-blue-100 hover:text-white transition">
                                <i class="fas fa-images mr-1"></i>Portfolio
                            </a>
                            <a href="/dashboard/barber/clients" class="text-blue-100 hover:text-white transition">
                                <i class="fas fa-users mr-1"></i>My Clients
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-info" class="text-white font-semibold"></span>
                        <span class="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">BARBER</span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Role Indicator -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div class="flex items-center">
                    <i class="fas fa-cut text-blue-600 text-2xl mr-3"></i>
                    <div>
                        <h3 class="font-bold text-blue-900">Barber Dashboard</h3>
                        <p class="text-sm text-blue-700">Manage your schedule, clients, and portfolio</p>
                    </div>
                </div>
            </div>

            <!-- Stats Cards - Barber Specific -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-calendar-day text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Today</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Today's Appointments</p>
                    <p class="text-3xl font-bold">12</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-clock mr-1"></i>Next: 2:30 PM
                    </p>
                </div>

                <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-dollar-sign text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">This Week</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">My Earnings</p>
                    <p class="text-3xl font-bold">$1,850</p>
                    <p class="text-xs mt-2 opacity-75">
                        42 appointments completed
                    </p>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-user-friends text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">My Clients</p>
                    <p class="text-3xl font-bold">87</p>
                    <p class="text-xs mt-2 opacity-75">
                        5 returning today
                    </p>
                </div>

                <div class="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-star text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Rating</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">My Rating</p>
                    <p class="text-3xl font-bold">4.9</p>
                    <p class="text-xs mt-2 opacity-75">
                        Based on 124 reviews
                    </p>
                </div>
            </div>

            <!-- Today's Schedule -->
            <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-clock text-blue-600 mr-2"></i>
                    Today's Schedule
                </h2>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div class="flex items-center space-x-4">
                            <div class="text-center">
                                <p class="text-xs text-gray-600">2:30 PM</p>
                                <p class="text-xs text-gray-500">30 min</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">John Doe</p>
                                <p class="text-sm text-gray-600">Haircut + Beard Trim</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                                <i class="fas fa-check mr-1"></i>Accept
                            </button>
                            <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                                <i class="fas fa-times mr-1"></i>Decline
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <div class="text-center">
                                <p class="text-xs text-gray-600">3:00 PM</p>
                                <p class="text-xs text-gray-500">45 min</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">Mike Smith</p>
                                <p class="text-sm text-gray-600">Deluxe Package</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            CONFIRMED
                        </span>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <div class="text-center">
                                <p class="text-xs text-gray-600">4:00 PM</p>
                                <p class="text-xs text-gray-500">30 min</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">Sarah Johnson</p>
                                <p class="text-sm text-gray-600">Hair Styling</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            CONFIRMED
                        </span>
                    </div>
                </div>
                <button class="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                    <i class="fas fa-calendar mr-2"></i>View Full Schedule
                </button>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-chart-line text-green-600 mr-2"></i>
                        Weekly Earnings
                    </h2>
                    <canvas id="earnings-chart"></canvas>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-chart-pie text-purple-600 mr-2"></i>
                        Service Breakdown
                    </h2>
                    <canvas id="services-chart"></canvas>
                </div>
            </div>
        </div>

        <script>
          // Auth check
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (!token || user.role !== 'barber') {
            alert('Access Denied: Barber account required');
            window.location.href = '/auth/login';
          }

          document.getElementById('user-info').textContent = user.full_name || user.email;

          // Logout
          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          // Earnings Chart
          const earningsCtx = document.getElementById('earnings-chart').getContext('2d');
          new Chart(earningsCtx, {
            type: 'line',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Earnings ($)',
                data: [220, 280, 260, 310, 290, 350, 320],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true
            }
          });

          // Services Chart
          const servicesCtx = document.getElementById('services-chart').getContext('2d');
          new Chart(servicesCtx, {
            type: 'doughnut',
            data: {
              labels: ['Haircut', 'Beard Trim', 'Hair + Beard', 'Styling'],
              datasets: [{
                data: [45, 20, 25, 10],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(147, 51, 234, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(251, 191, 36, 0.8)'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true
            }
          });
        </script>
    </body>
    </html>
  `)
})

// ======================
// CLIENT DASHBOARD - Isolated
// ======================
app.get('/dashboard/client', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Client Dashboard - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <div class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-white mr-2"></i>
                            <span class="text-xl font-bold text-white">Client Portal</span>
                        </div>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard/client" class="text-white font-semibold border-b-2 border-white pb-1">
                                <i class="fas fa-calendar mr-1"></i>My Bookings
                            </a>
                            <a href="/demo/try-on" class="text-green-100 hover:text-white transition">
                                <i class="fas fa-wand-magic-sparkles mr-1"></i>Try Hairstyles
                            </a>
                            <a href="/demo/chat" class="text-green-100 hover:text-white transition">
                                <i class="fas fa-robot mr-1"></i>AI Consultant
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-info" class="text-white font-semibold"></span>
                        <span class="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">CLIENT</span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Role Indicator -->
            <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div class="flex items-center">
                    <i class="fas fa-user text-green-600 text-2xl mr-3"></i>
                    <div>
                        <h3 class="font-bold text-green-900">Client Dashboard</h3>
                        <p class="text-sm text-green-700">Book appointments, try new hairstyles, and manage your profile</p>
                    </div>
                </div>
            </div>

            <!-- Stats Cards - Client Specific -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-calendar-check text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">My Appointments</p>
                    <p class="text-3xl font-bold">24</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-clock mr-1"></i>Next: Tomorrow 2:00 PM
                    </p>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-heart text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Favorite</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Preferred Barber</p>
                    <p class="text-2xl font-bold">John Smith</p>
                    <p class="text-xs mt-2 opacity-75">
                        <i class="fas fa-star mr-1"></i>4.9 rating
                    </p>
                </div>

                <div class="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-gem text-3xl"></i>
                        <span class="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Points</span>
                    </div>
                    <p class="text-sm opacity-90 mb-1">Loyalty Points</p>
                    <p class="text-3xl font-bold">450</p>
                    <p class="text-xs mt-2 opacity-75">
                        50 more for free haircut
                    </p>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-bolt text-green-600 mr-2"></i>
                    Quick Actions
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/demo/booking" class="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center">
                        <i class="fas fa-calendar-plus text-3xl text-green-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Book Now</p>
                    </a>
                    <a href="/demo/try-on" class="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center">
                        <i class="fas fa-wand-magic-sparkles text-3xl text-purple-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Try Hairstyles</p>
                    </a>
                    <a href="/demo/chat" class="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center">
                        <i class="fas fa-robot text-3xl text-blue-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">Ask AI</p>
                    </a>
                    <button class="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition text-center">
                        <i class="fas fa-history text-3xl text-amber-600 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-900">My History</p>
                    </button>
                </div>
            </div>

            <!-- Upcoming Appointments -->
            <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-900">
                        <i class="fas fa-calendar-alt text-green-600 mr-2"></i>
                        Upcoming Appointments
                    </h2>
                    <a href="/demo/booking" class="text-green-600 hover:text-green-700 font-semibold text-sm">
                        Book New <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div class="flex items-center space-x-4">
                            <img src="https://ui-avatars.com/api/?name=John+Smith&background=10b981&color=fff" 
                                 class="w-16 h-16 rounded-full" alt="Barber">
                            <div>
                                <p class="font-semibold text-gray-900">Haircut + Beard Trim</p>
                                <p class="text-sm text-gray-600">with John Smith</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-calendar mr-1"></i>Tomorrow, 2:00 PM
                                    <span class="mx-2">•</span>
                                    <i class="fas fa-clock mr-1"></i>45 minutes
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-green-600">$35</p>
                            <button class="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200">
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <img src="https://ui-avatars.com/api/?name=Mike+Johnson&background=6366f1&color=fff" 
                                 class="w-16 h-16 rounded-full" alt="Barber">
                            <div>
                                <p class="font-semibold text-gray-900">Deluxe Package</p>
                                <p class="text-sm text-gray-600">with Mike Johnson</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-calendar mr-1"></i>Next Week, Friday 4:30 PM
                                    <span class="mx-2">•</span>
                                    <i class="fas fa-clock mr-1"></i>60 minutes
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-gray-900">$50</p>
                            <button class="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200">
                                Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Try-Ons -->
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-900">
                        <i class="fas fa-images text-purple-600 mr-2"></i>
                        My Try-On History
                    </h2>
                    <a href="/demo/try-on" class="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                        Try New Style <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="relative group cursor-pointer">
                        <div class="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl flex items-center justify-center">
                            <i class="fas fa-user text-4xl text-purple-600"></i>
                        </div>
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition flex items-center justify-center">
                            <button class="opacity-0 group-hover:opacity-100 bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
                                View
                            </button>
                        </div>
                        <p class="text-xs text-center mt-2 text-gray-600">Fade Style</p>
                    </div>
                    <div class="relative group cursor-pointer">
                        <div class="aspect-square bg-gradient-to-br from-blue-200 to-cyan-200 rounded-xl flex items-center justify-center">
                            <i class="fas fa-user text-4xl text-blue-600"></i>
                        </div>
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition flex items-center justify-center">
                            <button class="opacity-0 group-hover:opacity-100 bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                                View
                            </button>
                        </div>
                        <p class="text-xs text-center mt-2 text-gray-600">Pompadour</p>
                    </div>
                    <div class="relative group cursor-pointer">
                        <div class="aspect-square bg-gradient-to-br from-green-200 to-emerald-200 rounded-xl flex items-center justify-center">
                            <i class="fas fa-user text-4xl text-green-600"></i>
                        </div>
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl transition flex items-center justify-center">
                            <button class="opacity-0 group-hover:opacity-100 bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                                View
                            </button>
                        </div>
                        <p class="text-xs text-center mt-2 text-gray-600">Undercut</p>
                    </div>
                    <div class="relative group cursor-pointer">
                        <div class="aspect-square bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center">
                            <i class="fas fa-plus text-4xl text-amber-600"></i>
                        </div>
                        <p class="text-xs text-center mt-2 text-gray-600">Try New</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
          // Auth check
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (!token || user.role !== 'client') {
            alert('Access Denied: Client account required');
            window.location.href = '/auth/login';
          }

          document.getElementById('user-info').textContent = user.full_name || user.email;

          // Logout
          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });
        </script>
    </body>
    </html>
  `)
})

export default app
