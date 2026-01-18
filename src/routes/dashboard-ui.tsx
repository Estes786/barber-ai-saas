import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Main Dashboard Page
app.get('/dashboard', (c) => {
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
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                            <span class="text-xl font-bold">Barber AI</span>
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard" class="text-purple-600 font-semibold">Dashboard</a>
                            <a href="/dashboard/bookings" class="text-gray-700 hover:text-purple-600">Bookings</a>
                            <a href="/dashboard/clients" class="text-gray-700 hover:text-purple-600">Clients</a>
                            <a href="/dashboard/portfolio" class="text-gray-700 hover:text-purple-600">Portfolio</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-name" class="text-gray-700"></span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                    Dashboard
                </h1>
                <p class="text-gray-600">Track your business performance and manage operations</p>
            </div>

            <!-- Stats Cards -->
            <div id="stats-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Loading skeleton -->
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-8 bg-gray-300 rounded"></div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-8 bg-gray-300 rounded"></div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-8 bg-gray-300 rounded"></div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-8 bg-gray-300 rounded"></div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Revenue Trend Chart -->
                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Revenue Trend (30 Days)</h2>
                    <canvas id="revenue-chart"></canvas>
                </div>

                <!-- Peak Hours Chart -->
                <div class="bg-white rounded-xl p-6 shadow-lg">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Peak Hours</h2>
                    <canvas id="hours-chart"></canvas>
                </div>
            </div>

            <!-- Recent Bookings -->
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-900">Recent Bookings</h2>
                    <a href="/dashboard/bookings" class="text-purple-600 hover:text-purple-700 font-semibold">
                        View All <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                <div id="recent-bookings" class="space-y-4">
                    <!-- Loading -->
                    <div class="animate-pulse">
                        <div class="h-16 bg-gray-200 rounded mb-2"></div>
                        <div class="h-16 bg-gray-200 rounded mb-2"></div>
                        <div class="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        <script>
          // Check authentication
          const token = localStorage.getItem('sb-access-token');
          if (!token) {
            window.location.href = '/auth/login';
          }

          // Set user name
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          document.getElementById('user-name').textContent = user.name || user.email;

          // Logout handler
          document.getElementById('logout-btn').addEventListener('click', async () => {
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('sb-refresh-token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          });

          // Fetch dashboard stats
          async function fetchDashboardStats() {
            try {
              const response = await fetch('/api/dashboard/stats', {
                headers: {
                  'Authorization': \`Bearer \${token}\`
                }
              });

              if (!response.ok) {
                if (response.status === 401) {
                  window.location.href = '/auth/login';
                  return;
                }
                throw new Error('Failed to fetch stats');
              }

              const data = await response.json();
              if (data.success) {
                renderStats(data.stats);
              }
            } catch (error) {
              console.error('Error fetching stats:', error);
            }
          }

          // Render stats cards
          function renderStats(stats) {
            const statsHtml = \`
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p class="text-3xl font-bold text-green-600">$\${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-dollar-sign text-white text-xl"></i>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">This month</p>
              </div>

              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p class="text-3xl font-bold text-blue-600">\${stats.totalBookings}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-calendar-check text-white text-xl"></i>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  <span class="text-orange-600 font-semibold">\${stats.pendingBookings} pending</span>
                </p>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Total Clients</p>
                    <p class="text-3xl font-bold text-purple-600">\${stats.totalClients}</p>
                  </div>
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-white text-xl"></i>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">Active clients</p>
              </div>

              <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 mb-1">Portfolio</p>
                    <p class="text-3xl font-bold text-amber-600">\${stats.portfolioCount}</p>
                  </div>
                  <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-images text-white text-xl"></i>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">Items</p>
              </div>
            \`;

            document.getElementById('stats-cards').innerHTML = statsHtml;
          }

          // Fetch analytics data
          async function fetchAnalytics() {
            try {
              const response = await fetch('/api/dashboard/analytics?period=30', {
                headers: {
                  'Authorization': \`Bearer \${token}\`
                }
              });

              if (!response.ok) throw new Error('Failed to fetch analytics');

              const data = await response.json();
              if (data.success) {
                renderRevenueChart(data.analytics.revenueTrend);
                renderPeakHoursChart(data.analytics.peakHours);
              }
            } catch (error) {
              console.error('Error fetching analytics:', error);
            }
          }

          // Render revenue chart
          function renderRevenueChart(revenueTrend) {
            const ctx = document.getElementById('revenue-chart').getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: revenueTrend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                  label: 'Revenue ($)',
                  data: revenueTrend.map(item => item.revenue),
                  borderColor: 'rgb(147, 51, 234)',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          }

          // Render peak hours chart
          function renderPeakHoursChart(peakHours) {
            const ctx = document.getElementById('hours-chart').getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: peakHours.map(item => \`\${item.hour}:00\`),
                datasets: [{
                  label: 'Bookings',
                  data: peakHours.map(item => item.count),
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }
            });
          }

          // Fetch recent bookings
          async function fetchRecentBookings() {
            try {
              const response = await fetch('/api/dashboard/bookings?limit=5', {
                headers: {
                  'Authorization': \`Bearer \${token}\`
                }
              });

              if (!response.ok) throw new Error('Failed to fetch bookings');

              const data = await response.json();
              if (data.success) {
                renderRecentBookings(data.bookings);
              }
            } catch (error) {
              console.error('Error fetching bookings:', error);
              document.getElementById('recent-bookings').innerHTML = \`
                <p class="text-center text-gray-500 py-4">No bookings found</p>
              \`;
            }
          }

          // Render recent bookings
          function renderRecentBookings(bookings) {
            if (bookings.length === 0) {
              document.getElementById('recent-bookings').innerHTML = \`
                <p class="text-center text-gray-500 py-4">No recent bookings</p>
              \`;
              return;
            }

            const bookingsHtml = bookings.map(booking => {
              const statusColors = {
                PENDING: 'bg-yellow-100 text-yellow-800',
                CONFIRMED: 'bg-blue-100 text-blue-800',
                COMPLETED: 'bg-green-100 text-green-800',
                CANCELLED: 'bg-red-100 text-red-800'
              };

              return \`
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div class="flex items-center space-x-4">
                    <img src="\${booking.client.profile_photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(booking.client.name)}" 
                         alt="\${booking.client.name}" 
                         class="w-12 h-12 rounded-full">
                    <div>
                      <p class="font-semibold text-gray-900">\${booking.client.name}</p>
                      <p class="text-sm text-gray-600">\${booking.service.name} - $\${booking.service.price}</p>
                      <p class="text-xs text-gray-500">\${new Date(booking.start_time).toLocaleString()}</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold \${statusColors[booking.status]}">
                    \${booking.status}
                  </span>
                </div>
              \`;
            }).join('');

            document.getElementById('recent-bookings').innerHTML = bookingsHtml;
          }

          // Initialize dashboard
          fetchDashboardStats();
          fetchAnalytics();
          fetchRecentBookings();
        </script>
    </body>
    </html>
  `)
})

// Bookings Management Page
app.get('/dashboard/bookings', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bookings Management - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                            <span class="text-xl font-bold">Barber AI</span>
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard" class="text-gray-700 hover:text-purple-600">Dashboard</a>
                            <a href="/dashboard/bookings" class="text-purple-600 font-semibold">Bookings</a>
                            <a href="/dashboard/clients" class="text-gray-700 hover:text-purple-600">Clients</a>
                            <a href="/dashboard/portfolio" class="text-gray-700 hover:text-purple-600">Portfolio</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-name" class="text-gray-700"></span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-calendar-check text-purple-600 mr-2"></i>
                    Bookings Management
                </h1>
                <p class="text-gray-600">Accept, reject, or reschedule client bookings</p>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl p-6 shadow-lg mb-8">
                <div class="flex flex-wrap gap-4">
                    <button class="filter-btn active px-6 py-2 rounded-full font-semibold transition" data-status="all">
                        All
                    </button>
                    <button class="filter-btn px-6 py-2 rounded-full font-semibold transition" data-status="PENDING">
                        <i class="fas fa-clock mr-2"></i>Pending
                    </button>
                    <button class="filter-btn px-6 py-2 rounded-full font-semibold transition" data-status="CONFIRMED">
                        <i class="fas fa-check mr-2"></i>Confirmed
                    </button>
                    <button class="filter-btn px-6 py-2 rounded-full font-semibold transition" data-status="COMPLETED">
                        <i class="fas fa-check-double mr-2"></i>Completed
                    </button>
                    <button class="filter-btn px-6 py-2 rounded-full font-semibold transition" data-status="CANCELLED">
                        <i class="fas fa-times mr-2"></i>Cancelled
                    </button>
                </div>
            </div>

            <!-- Bookings List -->
            <div id="bookings-list" class="space-y-4">
                <!-- Loading -->
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-4 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>

        <script>
          const token = localStorage.getItem('sb-access-token');
          if (!token) window.location.href = '/auth/login';

          const user = JSON.parse(localStorage.getItem('user') || '{}');
          document.getElementById('user-name').textContent = user.name || user.email;

          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          let currentStatus = 'all';

          // Fetch bookings
          async function fetchBookings(status = 'all') {
            try {
              const url = status === 'all' 
                ? '/api/dashboard/bookings' 
                : \`/api/dashboard/bookings?status=\${status}\`;

              const response = await fetch(url, {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              if (!response.ok) {
                if (response.status === 401) {
                  window.location.href = '/auth/login';
                  return;
                }
                throw new Error('Failed to fetch bookings');
              }

              const data = await response.json();
              if (data.success) {
                renderBookings(data.bookings);
              }
            } catch (error) {
              console.error('Error:', error);
              document.getElementById('bookings-list').innerHTML = \`
                <div class="bg-white rounded-xl p-6 shadow-lg text-center">
                  <p class="text-gray-500">Failed to load bookings</p>
                </div>
              \`;
            }
          }

          // Render bookings
          function renderBookings(bookings) {
            if (bookings.length === 0) {
              document.getElementById('bookings-list').innerHTML = \`
                <div class="bg-white rounded-xl p-6 shadow-lg text-center">
                  <p class="text-gray-500">No bookings found</p>
                </div>
              \`;
              return;
            }

            const statusColors = {
              PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
              CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
              COMPLETED: 'bg-green-100 text-green-800 border-green-300',
              CANCELLED: 'bg-red-100 text-red-800 border-red-300'
            };

            const bookingsHtml = bookings.map(booking => \`
              <div class="bg-white rounded-xl p-6 shadow-lg border-l-4 \${statusColors[booking.status]}">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 flex-1">
                    <img src="\${booking.client.profile_photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(booking.client.name)}" 
                         alt="\${booking.client.name}" 
                         class="w-16 h-16 rounded-full">
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xl font-bold text-gray-900">\${booking.client.name}</h3>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold \${statusColors[booking.status]}">
                          \${booking.status}
                        </span>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p class="text-sm text-gray-600"><i class="fas fa-cut mr-2"></i>Service: \${booking.service.name}</p>
                          <p class="text-sm text-gray-600"><i class="fas fa-user mr-2"></i>Barber: \${booking.barber.name}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600"><i class="fas fa-calendar mr-2"></i>\${new Date(booking.start_time).toLocaleDateString()}</p>
                          <p class="text-sm text-gray-600"><i class="fas fa-clock mr-2"></i>\${new Date(booking.start_time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2 text-sm">
                        <span class="text-gray-600"><i class="fas fa-dollar-sign mr-1"></i>$\${booking.service.price}</span>
                        <span class="text-gray-400">•</span>
                        <span class="text-gray-600"><i class="fas fa-hourglass-half mr-1"></i>\${booking.service.duration_minutes} min</span>
                        <span class="text-gray-400">•</span>
                        <span class="text-gray-600"><i class="fas fa-phone mr-1"></i>\${booking.client.phone}</span>
                      </div>
                      \${booking.notes ? \`<p class="text-sm text-gray-500 mt-2"><i class="fas fa-sticky-note mr-2"></i>\${booking.notes}</p>\` : ''}
                    </div>
                  </div>
                </div>
                
                \${booking.status === 'PENDING' ? \`
                  <div class="flex justify-end space-x-3 mt-4 pt-4 border-t">
                    <button onclick="updateBookingStatus('\${booking.id}', 'CONFIRMED')" 
                            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                      <i class="fas fa-check mr-2"></i>Accept
                    </button>
                    <button onclick="updateBookingStatus('\${booking.id}', 'CANCELLED')" 
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                      <i class="fas fa-times mr-2"></i>Reject
                    </button>
                  </div>
                \` : booking.status === 'CONFIRMED' ? \`
                  <div class="flex justify-end space-x-3 mt-4 pt-4 border-t">
                    <button onclick="updateBookingStatus('\${booking.id}', 'COMPLETED')" 
                            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                      <i class="fas fa-check-double mr-2"></i>Mark Complete
                    </button>
                    <button onclick="updateBookingStatus('\${booking.id}', 'CANCELLED')" 
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                      <i class="fas fa-ban mr-2"></i>Cancel
                    </button>
                  </div>
                \` : ''}
              </div>
            \`).join('');

            document.getElementById('bookings-list').innerHTML = bookingsHtml;
          }

          // Update booking status
          window.updateBookingStatus = async function(bookingId, status) {
            try {
              const response = await fetch(\`/api/dashboard/bookings/\${bookingId}\`, {
                method: 'PUT',
                headers: {
                  'Authorization': \`Bearer \${token}\`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
              });

              if (!response.ok) throw new Error('Failed to update booking');

              const data = await response.json();
              if (data.success) {
                fetchBookings(currentStatus);
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to update booking status');
            }
          };

          // Filter buttons
          document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-purple-600', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
              });
              btn.classList.add('active', 'bg-purple-600', 'text-white');
              btn.classList.remove('bg-gray-200', 'text-gray-700');
              
              currentStatus = btn.dataset.status;
              fetchBookings(currentStatus);
            });
          });

          // Style active button
          document.querySelector('.filter-btn.active').classList.add('bg-purple-600', 'text-white');
          document.querySelectorAll('.filter-btn:not(.active)').forEach(btn => {
            btn.classList.add('bg-gray-200', 'text-gray-700');
          });

          // Initial fetch
          fetchBookings();
        </script>
    </body>
    </html>
  `)
})

// Clients Management Page
app.get('/dashboard/clients', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clients Management - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                            <span class="text-xl font-bold">Barber AI</span>
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard" class="text-gray-700 hover:text-purple-600">Dashboard</a>
                            <a href="/dashboard/bookings" class="text-gray-700 hover:text-purple-600">Bookings</a>
                            <a href="/dashboard/clients" class="text-purple-600 font-semibold">Clients</a>
                            <a href="/dashboard/portfolio" class="text-gray-700 hover:text-purple-600">Portfolio</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-name" class="text-gray-700"></span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-users text-purple-600 mr-2"></i>
                    Client Management
                </h1>
                <p class="text-gray-600">View client information and booking history</p>
            </div>

            <!-- Clients Grid -->
            <div id="clients-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Loading -->
                <div class="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                    <div class="h-4 bg-gray-200 rounded mb-4"></div>
                    <div class="h-4 bg-gray-300 rounded"></div>
                </div>
            </div>

            <!-- Client History Modal -->
            <div id="history-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div class="p-6 border-b sticky top-0 bg-white">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-gray-900" id="modal-client-name"></h2>
                            <button onclick="closeHistoryModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6" id="modal-history-content">
                        <!-- History will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <script>
          const token = localStorage.getItem('sb-access-token');
          if (!token) window.location.href = '/auth/login';

          const user = JSON.parse(localStorage.getItem('user') || '{}');
          document.getElementById('user-name').textContent = user.name || user.email;

          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          // Fetch clients
          async function fetchClients() {
            try {
              const response = await fetch('/api/dashboard/clients', {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              if (!response.ok) {
                if (response.status === 401) {
                  window.location.href = '/auth/login';
                  return;
                }
                throw new Error('Failed to fetch clients');
              }

              const data = await response.json();
              if (data.success) {
                renderClients(data.clients);
              }
            } catch (error) {
              console.error('Error:', error);
              document.getElementById('clients-grid').innerHTML = \`
                <div class="col-span-3 text-center text-gray-500 py-8">
                  Failed to load clients
                </div>
              \`;
            }
          }

          // Render clients
          function renderClients(clients) {
            if (clients.length === 0) {
              document.getElementById('clients-grid').innerHTML = \`
                <div class="col-span-3 text-center text-gray-500 py-8">
                  No clients found
                </div>
              \`;
              return;
            }

            const clientsHtml = clients.map(client => \`
              <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div class="flex items-center space-x-4 mb-4">
                  <img src="\${client.profile_photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(client.name)}" 
                       alt="\${client.name}" 
                       class="w-16 h-16 rounded-full">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900">\${client.name}</h3>
                    <p class="text-sm text-gray-600">\${client.email}</p>
                  </div>
                </div>
                <div class="space-y-2 mb-4">
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-phone mr-2"></i>\${client.phone || 'N/A'}
                  </p>
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-calendar mr-2"></i>Member since \${new Date(client.created_at).toLocaleDateString()}
                  </p>
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-history mr-2"></i>\${client.bookings?.[0]?.count || 0} bookings
                  </p>
                  \${client.face_shape ? \`<p class="text-sm text-gray-600"><i class="fas fa-user-circle mr-2"></i>Face: \${client.face_shape}</p>\` : ''}
                </div>
                \${client.notes ? \`<p class="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">\${client.notes}</p>\` : ''}
                <button onclick="viewClientHistory('\${client.id}', '\${client.name}')" 
                        class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                  <i class="fas fa-history mr-2"></i>View History
                </button>
              </div>
            \`).join('');

            document.getElementById('clients-grid').innerHTML = clientsHtml;
          }

          // View client history
          window.viewClientHistory = async function(clientId, clientName) {
            document.getElementById('history-modal').classList.remove('hidden');
            document.getElementById('modal-client-name').textContent = clientName;
            document.getElementById('modal-history-content').innerHTML = \`
              <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                <p class="text-gray-600 mt-4">Loading history...</p>
              </div>
            \`;

            try {
              const response = await fetch(\`/api/dashboard/clients/\${clientId}/history\`, {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              if (!response.ok) throw new Error('Failed to fetch history');

              const data = await response.json();
              if (data.success) {
                renderClientHistory(data.bookings);
              }
            } catch (error) {
              console.error('Error:', error);
              document.getElementById('modal-history-content').innerHTML = \`
                <p class="text-center text-gray-500">Failed to load history</p>
              \`;
            }
          };

          // Render client history
          function renderClientHistory(bookings) {
            if (bookings.length === 0) {
              document.getElementById('modal-history-content').innerHTML = \`
                <p class="text-center text-gray-500">No booking history</p>
              \`;
              return;
            }

            const statusColors = {
              PENDING: 'bg-yellow-100 text-yellow-800',
              CONFIRMED: 'bg-blue-100 text-blue-800',
              COMPLETED: 'bg-green-100 text-green-800',
              CANCELLED: 'bg-red-100 text-red-800'
            };

            const historyHtml = bookings.map(booking => \`
              <div class="border-b pb-4 mb-4 last:border-b-0">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-semibold text-gray-900">\${booking.service.name}</p>
                    <p class="text-sm text-gray-600">with \${booking.barber.name}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold \${statusColors[booking.status]}">
                    \${booking.status}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  <i class="fas fa-calendar mr-2"></i>\${new Date(booking.start_time).toLocaleString()}
                </p>
                <p class="text-sm text-gray-600">
                  <i class="fas fa-dollar-sign mr-2"></i>$\${booking.service.price}
                </p>
                \${booking.notes ? \`<p class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">\${booking.notes}</p>\` : ''}
              </div>
            \`).join('');

            document.getElementById('modal-history-content').innerHTML = historyHtml;
          }

          // Close modal
          window.closeHistoryModal = function() {
            document.getElementById('history-modal').classList.add('hidden');
          };

          // Close modal on outside click
          document.getElementById('history-modal').addEventListener('click', (e) => {
            if (e.target.id === 'history-modal') {
              closeHistoryModal();
            }
          });

          // Initial fetch
          fetchClients();
        </script>
    </body>
    </html>
  `)
})

// Portfolio Management Page
app.get('/dashboard/portfolio', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio Management - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-2xl text-purple-600 mr-2"></i>
                            <span class="text-xl font-bold">Barber AI</span>
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/dashboard" class="text-gray-700 hover:text-purple-600">Dashboard</a>
                            <a href="/dashboard/bookings" class="text-gray-700 hover:text-purple-600">Bookings</a>
                            <a href="/dashboard/clients" class="text-gray-700 hover:text-purple-600">Clients</a>
                            <a href="/dashboard/portfolio" class="text-purple-600 font-semibold">Portfolio</a>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="user-name" class="text-gray-700"></span>
                        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">
                        <i class="fas fa-images text-purple-600 mr-2"></i>
                        Portfolio Management
                    </h1>
                    <p class="text-gray-600">Showcase your best work with before/after photos</p>
                </div>
                <button id="upload-btn" class="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition">
                    <i class="fas fa-plus mr-2"></i>Upload New
                </button>
            </div>

            <!-- Portfolio Grid -->
            <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Loading -->
                <div class="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                    <div class="h-48 bg-gray-200"></div>
                    <div class="p-4">
                        <div class="h-4 bg-gray-300 rounded mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            <!-- Upload Modal -->
            <div id="upload-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-2xl w-full">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-gray-900">Upload Portfolio Item</h2>
                            <button onclick="closeUploadModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>
                    <form id="upload-form" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Hairstyle Name</label>
                            <input type="text" id="hairstyle-name" required
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                            <textarea id="description" rows="3"
                                      class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 outline-none"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Before Photo (Optional)</label>
                            <input type="file" id="before-photo" accept="image/*"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg">
                            <div id="before-preview" class="mt-2 hidden">
                                <img class="w-full h-48 object-cover rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">After Photo (Required)</label>
                            <input type="file" id="after-photo" accept="image/*" required
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg">
                            <div id="after-preview" class="mt-2 hidden">
                                <img class="w-full h-48 object-cover rounded-lg">
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                            <i class="fas fa-upload mr-2"></i>Upload Portfolio
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <script>
          const token = localStorage.getItem('sb-access-token');
          if (!token) window.location.href = '/auth/login';

          const user = JSON.parse(localStorage.getItem('user') || '{}');
          document.getElementById('user-name').textContent = user.name || user.email;

          document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/auth/login';
          });

          let beforePhotoUrl = null;
          let afterPhotoUrl = null;

          // Fetch portfolio
          async function fetchPortfolio() {
            try {
              const response = await fetch('/api/dashboard/portfolio', {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              if (!response.ok) {
                if (response.status === 401) {
                  window.location.href = '/auth/login';
                  return;
                }
                throw new Error('Failed to fetch portfolio');
              }

              const data = await response.json();
              if (data.success) {
                renderPortfolio(data.portfolio);
              }
            } catch (error) {
              console.error('Error:', error);
              document.getElementById('portfolio-grid').innerHTML = \`
                <div class="col-span-3 text-center text-gray-500 py-8">
                  Failed to load portfolio
                </div>
              \`;
            }
          }

          // Render portfolio
          function renderPortfolio(portfolio) {
            if (portfolio.length === 0) {
              document.getElementById('portfolio-grid').innerHTML = \`
                <div class="col-span-3 text-center text-gray-500 py-8">
                  <i class="fas fa-images text-6xl mb-4"></i>
                  <p>No portfolio items yet</p>
                  <button onclick="document.getElementById('upload-btn').click()" 
                          class="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">
                    Upload Your First Work
                  </button>
                </div>
              \`;
              return;
            }

            const portfolioHtml = portfolio.map(item => \`
              <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition">
                <div class="relative h-64">
                  \${item.before_photo_url ? \`
                    <div class="absolute inset-0 flex">
                      <div class="w-1/2 relative">
                        <img src="\${item.before_photo_url}" alt="Before" class="w-full h-full object-cover">
                        <span class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">Before</span>
                      </div>
                      <div class="w-1/2 relative">
                        <img src="\${item.after_photo_url}" alt="After" class="w-full h-full object-cover">
                        <span class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">After</span>
                      </div>
                    </div>
                  \` : \`
                    <img src="\${item.after_photo_url}" alt="\${item.hairstyle_name}" class="w-full h-full object-cover">
                  \`}
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-bold text-gray-900 mb-2">\${item.hairstyle_name || 'Untitled'}</h3>
                  \${item.description ? \`<p class="text-sm text-gray-600 mb-3">\${item.description}</p>\` : ''}
                  <div class="flex items-center justify-between text-sm text-gray-500">
                    <span><i class="fas fa-heart mr-1"></i>\${item.likes || 0} likes</span>
                    <span>\${new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <button onclick="deletePortfolio('\${item.id}')" 
                          class="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm">
                    <i class="fas fa-trash mr-2"></i>Delete
                  </button>
                </div>
              </div>
            \`).join('');

            document.getElementById('portfolio-grid').innerHTML = portfolioHtml;
          }

          // Delete portfolio item
          window.deletePortfolio = async function(id) {
            if (!confirm('Are you sure you want to delete this portfolio item?')) return;

            try {
              const response = await fetch(\`/api/dashboard/portfolio/\${id}\`, {
                method: 'DELETE',
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              if (!response.ok) throw new Error('Failed to delete');

              const data = await response.json();
              if (data.success) {
                fetchPortfolio();
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to delete portfolio item');
            }
          };

          // Upload button
          document.getElementById('upload-btn').addEventListener('click', () => {
            document.getElementById('upload-modal').classList.remove('hidden');
          });

          // Close upload modal
          window.closeUploadModal = function() {
            document.getElementById('upload-modal').classList.add('hidden');
            document.getElementById('upload-form').reset();
            document.getElementById('before-preview').classList.add('hidden');
            document.getElementById('after-preview').classList.add('hidden');
            beforePhotoUrl = null;
            afterPhotoUrl = null;
          };

          // Photo preview handlers
          document.getElementById('before-photo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                beforePhotoUrl = event.target.result;
                document.getElementById('before-preview').classList.remove('hidden');
                document.querySelector('#before-preview img').src = beforePhotoUrl;
              };
              reader.readAsDataURL(file);
            }
          });

          document.getElementById('after-photo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                afterPhotoUrl = event.target.result;
                document.getElementById('after-preview').classList.remove('hidden');
                document.querySelector('#after-preview img').src = afterPhotoUrl;
              };
              reader.readAsDataURL(file);
            }
          });

          // Upload form submit
          document.getElementById('upload-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!afterPhotoUrl) {
              alert('After photo is required');
              return;
            }

            try {
              const formData = {
                hairstyle_name: document.getElementById('hairstyle-name').value,
                description: document.getElementById('description').value,
                before_photo_url: beforePhotoUrl,
                after_photo_url: afterPhotoUrl
              };

              const response = await fetch('/api/dashboard/portfolio', {
                method: 'POST',
                headers: {
                  'Authorization': \`Bearer \${token}\`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              });

              if (!response.ok) throw new Error('Failed to upload');

              const data = await response.json();
              if (data.success) {
                closeUploadModal();
                fetchPortfolio();
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Failed to upload portfolio item');
            }
          });

          // Initial fetch
          fetchPortfolio();
        </script>
    </body>
    </html>
  `)
})

export default app
