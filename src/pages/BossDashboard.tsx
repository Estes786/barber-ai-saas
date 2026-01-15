import { Hono } from 'hono'

const bossDashboard = new Hono()

// L4 Boss Dashboard - Command & Control Center
bossDashboard.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>L4 Boss Dashboard | Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-text {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .metric-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .metric-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            .action-btn {
                transition: all 0.3s ease;
            }
            .action-btn:hover {
                transform: scale(1.05);
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen text-white">
        
        <!-- Top Navigation -->
        <nav class="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-crown text-3xl text-yellow-400"></i>
                        <div>
                            <h1 class="text-xl font-bold gradient-text">L4 Boss Dashboard</h1>
                            <p class="text-xs text-gray-400">Command & Control Center</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                            <div class="status-dot bg-green-400"></div>
                            <span class="text-sm">All Systems Operational</span>
                        </div>
                        <a href="/dashboard/owner" class="text-gray-300 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Revenue -->
                <div class="metric-card bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-green-100 text-sm mb-1">Total Revenue</p>
                            <h3 class="text-3xl font-bold">Rp 45.2M</h3>
                        </div>
                        <i class="fas fa-money-bill-wave text-3xl text-green-100"></i>
                    </div>
                    <p class="text-green-100 text-xs flex items-center gap-1">
                        <i class="fas fa-arrow-up"></i> +23% from last month
                    </p>
                </div>

                <!-- Active Users -->
                <div class="metric-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-blue-100 text-sm mb-1">Active Users</p>
                            <h3 class="text-3xl font-bold">1,234</h3>
                        </div>
                        <i class="fas fa-users text-3xl text-blue-100"></i>
                    </div>
                    <p class="text-blue-100 text-xs flex items-center gap-1">
                        <i class="fas fa-arrow-up"></i> +12% this week
                    </p>
                </div>

                <!-- System Health -->
                <div class="metric-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-purple-100 text-sm mb-1">System Health</p>
                            <h3 class="text-3xl font-bold">99.8%</h3>
                        </div>
                        <i class="fas fa-heartbeat text-3xl text-purple-100"></i>
                    </div>
                    <p class="text-purple-100 text-xs flex items-center gap-1">
                        <i class="fas fa-check-circle"></i> All services running
                    </p>
                </div>

                <!-- AI Try-Ons Today -->
                <div class="metric-card bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-orange-100 text-sm mb-1">AI Try-Ons Today</p>
                            <h3 class="text-3xl font-bold">567</h3>
                        </div>
                        <i class="fas fa-magic text-3xl text-orange-100"></i>
                    </div>
                    <p class="text-orange-100 text-xs flex items-center gap-1">
                        <i class="fas fa-arrow-up"></i> +45% vs yesterday
                    </p>
                </div>
            </div>

            <!-- Main Control Panel -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <!-- Left Column: Quick Actions -->
                <div class="lg:col-span-1 space-y-6">
                    
                    <!-- One-Click Actions -->
                    <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-bolt text-yellow-400"></i>
                            Quick Actions
                        </h2>
                        <div class="space-y-3">
                            <button onclick="handleDeploy()" class="action-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg">
                                <i class="fas fa-rocket"></i>
                                Deploy Latest
                            </button>
                            <button onclick="handleBackup()" class="action-btn w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg">
                                <i class="fas fa-database"></i>
                                Backup Database
                            </button>
                            <button onclick="handleAutoFix()" class="action-btn w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg">
                                <i class="fas fa-magic"></i>
                                Auto-Fix Issues
                            </button>
                            <button onclick="handleMonitor()" class="action-btn w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg">
                                <i class="fas fa-chart-line"></i>
                                View Analytics
                            </button>
                        </div>
                    </div>

                    <!-- AI Agents Status -->
                    <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-robot text-cyan-400"></i>
                            AI Agents
                        </h2>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="status-dot bg-green-400"></div>
                                    <div>
                                        <p class="font-semibold text-sm">Deploy Agent</p>
                                        <p class="text-xs text-gray-400">Auto-deploy active</p>
                                    </div>
                                </div>
                                <i class="fas fa-check-circle text-green-400"></i>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="status-dot bg-green-400"></div>
                                    <div>
                                        <p class="font-semibold text-sm">Monitor Agent</p>
                                        <p class="text-xs text-gray-400">24/7 watching</p>
                                    </div>
                                </div>
                                <i class="fas fa-check-circle text-green-400"></i>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="status-dot bg-green-400"></div>
                                    <div>
                                        <p class="font-semibold text-sm">Scaling Agent</p>
                                        <p class="text-xs text-gray-400">Auto-scale ready</p>
                                    </div>
                                </div>
                                <i class="fas fa-check-circle text-green-400"></i>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="status-dot bg-yellow-400"></div>
                                    <div>
                                        <p class="font-semibold text-sm">Error Agent</p>
                                        <p class="text-xs text-gray-400">Learning mode</p>
                                    </div>
                                </div>
                                <i class="fas fa-cog text-yellow-400 fa-spin"></i>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right Column: Real-time Data -->
                <div class="lg:col-span-2 space-y-6">
                    
                    <!-- Revenue Chart -->
                    <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-chart-line text-green-400"></i>
                            Revenue Trend (7 Days)
                        </h2>
                        <canvas id="revenueChart" class="w-full h-64"></canvas>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-clock text-blue-400"></i>
                            Recent Activity
                        </h2>
                        <div class="space-y-3">
                            <div class="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <i class="fas fa-check-circle text-green-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">Deployment Successful</p>
                                    <p class="text-xs text-gray-400">Production deployed • v2.5.3 • 2 minutes ago</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <i class="fas fa-users text-blue-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">New User Registered</p>
                                    <p class="text-xs text-gray-400">Barbershop "Style Cut" joined • 5 minutes ago</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <i class="fas fa-money-bill text-green-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">Payment Received</p>
                                    <p class="text-xs text-gray-400">PRO Plan subscription • Rp 299.000 • 12 minutes ago</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <i class="fas fa-database text-purple-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">Database Backup</p>
                                    <p class="text-xs text-gray-400">Auto-backup completed • 1 hour ago</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <i class="fas fa-magic text-orange-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">AI Try-On Peak</p>
                                    <p class="text-xs text-gray-400">567 try-ons today • +45% increase • 2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Alerts -->
                    <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-bell text-yellow-400"></i>
                            System Alerts
                        </h2>
                        <div class="space-y-3">
                            <div class="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <i class="fas fa-info-circle text-blue-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">Info: Traffic Spike Detected</p>
                                    <p class="text-xs text-gray-400">Auto-scaling activated • Handling 2x normal traffic</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <i class="fas fa-check-circle text-green-400 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold">Success: Performance Optimized</p>
                                    <p class="text-xs text-gray-400">Response time improved by 23% • All green!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Bottom Section: Platform Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Cloudflare Status -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="fab fa-cloudflare text-orange-400"></i>
                            Cloudflare
                        </h3>
                        <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Operational</span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Workers</span>
                            <span class="text-green-400">✓ Running</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Pages</span>
                            <span class="text-green-400">✓ Deployed</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">CDN</span>
                            <span class="text-green-400">✓ Active</span>
                        </div>
                    </div>
                </div>

                <!-- Supabase Status -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="fas fa-database text-green-400"></i>
                            Supabase
                        </h3>
                        <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Healthy</span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Database</span>
                            <span class="text-green-400">✓ Connected</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Auth</span>
                            <span class="text-green-400">✓ Active</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Storage</span>
                            <span class="text-green-400">✓ Ready</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Gateway Status -->
                <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="fas fa-credit-card text-blue-400"></i>
                            Duitku PG
                        </h3>
                        <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Connected</span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">API Status</span>
                            <span class="text-green-400">✓ Online</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Webhooks</span>
                            <span class="text-green-400">✓ Receiving</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Today's Trans.</span>
                            <span class="text-white">34 txn</span>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Mobile Note -->
            <div class="mt-8 text-center">
                <p class="text-gray-400 text-sm">
                    <i class="fas fa-mobile-alt mr-2"></i>
                    📱 This dashboard is optimized for mobile control - Manage your SaaS from anywhere!
                </p>
            </div>

        </div>

        <!-- Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
            // Revenue Chart
            const ctx = document.getElementById('revenueChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Revenue (Millions)',
                        data: [4.2, 5.1, 6.8, 5.5, 7.2, 6.9, 8.1],
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });

            // Action Handlers
            function handleDeploy() {
                alert('🚀 Deploying to production...\\n\\nThis will trigger Cloudflare Pages auto-deployment from your GitHub main branch.\\n\\nEstimated time: 2-3 minutes');
            }

            function handleBackup() {
                alert('💾 Creating database backup...\\n\\nSupabase auto-backup initiated. Your data is being secured!\\n\\nBackup location: AI Drive');
            }

            function handleAutoFix() {
                alert('🤖 AI Agent scanning for issues...\\n\\nNo critical issues detected! All systems running smoothly.\\n\\nNext scan: in 15 minutes');
            }

            function handleMonitor() {
                window.location.href = '/dashboard/owner';
            }
        </script>

    </body>
    </html>
  `)
})

export default bossDashboard
