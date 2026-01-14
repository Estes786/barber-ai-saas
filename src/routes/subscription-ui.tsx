import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Subscription Dashboard - Current Subscription Status
app.get('/subscription', async (c) => {
  // Simple check for auth - will be validated on API calls
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .usage-bar { background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); }
            .loader { border-top-color: #667eea; animation: spinner 1s linear infinite; }
            @keyframes spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-scissors text-3xl gradient-text mr-2"></i>
                            <span class="text-2xl font-bold gradient-text">Barber AI</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="#" onclick="goToDashboard()" class="text-gray-600 hover:text-purple-600">
                            <i class="fas fa-dashboard mr-1"></i> Dashboard
                        </a>
                        <a href="/subscription" class="text-purple-600 font-semibold">
                            <i class="fas fa-crown mr-1"></i> Subscription
                        </a>
                        <button onclick="logout()" class="text-gray-600 hover:text-purple-600">
                            <i class="fas fa-sign-out-alt mr-1"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold mb-2">
                    <i class="fas fa-crown text-yellow-500 mr-2"></i>
                    <span class="gradient-text">Subscription Management</span>
                </h1>
                <p class="text-gray-600">Manage your plan, usage, and billing</p>
            </div>

            <div id="loading" class="text-center py-20">
                <div class="loader ease-linear rounded-full border-4 border-gray-200 h-16 w-16 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading subscription data...</p>
            </div>

            <div id="subscription-content" class="hidden">
                <!-- Current Plan Card -->
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">Current Plan</h2>
                            <p class="text-gray-600">You're on the <span id="current-tier" class="font-semibold"></span> plan</p>
                        </div>
                        <div class="text-right">
                            <div class="text-4xl font-bold gradient-text" id="current-price"></div>
                            <div class="text-gray-500" id="billing-cycle"></div>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4 mb-6">
                        <div class="flex-1 bg-gray-100 rounded-lg p-4">
                            <div class="text-sm text-gray-600 mb-1">Status</div>
                            <div class="flex items-center">
                                <span id="status-badge" class="px-3 py-1 rounded-full text-sm font-semibold"></span>
                            </div>
                        </div>
                        <div class="flex-1 bg-gray-100 rounded-lg p-4">
                            <div class="text-sm text-gray-600 mb-1">Next Billing Date</div>
                            <div class="font-semibold text-gray-900" id="next-billing"></div>
                        </div>
                        <div class="flex-1 bg-gray-100 rounded-lg p-4">
                            <div class="text-sm text-gray-600 mb-1">Payment Method</div>
                            <div class="font-semibold text-gray-900" id="payment-method"></div>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button onclick="upgradePlan()" class="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                            <i class="fas fa-arrow-up mr-2"></i>Upgrade Plan
                        </button>
                        <button onclick="manageBilling()" class="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition">
                            <i class="fas fa-credit-card mr-2"></i>Manage Billing
                        </button>
                        <button onclick="cancelSubscription()" class="border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
                            <i class="fas fa-times mr-2"></i>Cancel Plan
                        </button>
                    </div>
                </div>

                <!-- Usage Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-gray-700">Bookings This Month</h3>
                            <i class="fas fa-calendar-check text-blue-500 text-2xl"></i>
                        </div>
                        <div class="mb-4">
                            <div class="flex items-baseline space-x-2">
                                <span class="text-3xl font-bold text-gray-900" id="bookings-used">0</span>
                                <span class="text-gray-500">/ <span id="bookings-limit">Unlimited</span></span>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div id="bookings-bar" class="usage-bar h-3 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-sm text-gray-600"><span id="bookings-remaining">Unlimited</span> remaining</p>
                    </div>

                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-gray-700">AI Try-Ons</h3>
                            <i class="fas fa-magic text-purple-500 text-2xl"></i>
                        </div>
                        <div class="mb-4">
                            <div class="flex items-baseline space-x-2">
                                <span class="text-3xl font-bold text-gray-900" id="tryons-used">0</span>
                                <span class="text-gray-500">/ <span id="tryons-limit">Unlimited</span></span>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div id="tryons-bar" class="usage-bar h-3 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-sm text-gray-600"><span id="tryons-remaining">Unlimited</span> remaining</p>
                    </div>

                    <div class="bg-white rounded-xl shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-gray-700">AI Chatbot Queries</h3>
                            <i class="fas fa-robot text-green-500 text-2xl"></i>
                        </div>
                        <div class="mb-4">
                            <div class="flex items-baseline space-x-2">
                                <span class="text-3xl font-bold text-gray-900" id="queries-used">0</span>
                                <span class="text-gray-500">/ <span id="queries-limit">Unlimited</span></span>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div id="queries-bar" class="usage-bar h-3 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-sm text-gray-600"><span id="queries-remaining">Unlimited</span> remaining</p>
                    </div>
                </div>

                <!-- Available Plans to Upgrade -->
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-arrow-up mr-2 text-green-500"></i>
                        Available Upgrades
                    </h2>
                    <div id="upgrade-options" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Upgrade options will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <script>
            const token = localStorage.getItem('auth_token');
            const userRole = localStorage.getItem('user_role') || 'client';

            // Redirect to dashboard based on role
            function goToDashboard() {
                window.location.href = '/dashboard/' + userRole.toLowerCase();
            }

            // Check if user is logged in
            if (!token) {
                window.location.href = '/auth/login';
            }

            async function loadSubscription() {
                try {
                    const response = await fetch('/api/subscription/current', {
                        headers: {
                            'Authorization': \`Bearer \${token}\`
                        }
                    });

                    if (!response.ok) throw new Error('Failed to load subscription');

                    const data = await response.json();
                    renderSubscription(data);
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('subscription-content').classList.remove('hidden');
                } catch (error) {
                    console.error('Error loading subscription:', error);
                    document.getElementById('loading').innerHTML = \`
                        <div class="text-center">
                            <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
                            <p class="text-gray-600 mb-4">Failed to load subscription data</p>
                            <button onclick="loadSubscription()" class="gradient-bg text-white px-6 py-3 rounded-lg">
                                Try Again
                            </button>
                        </div>
                    \`;
                }
            }

            function renderSubscription(data) {
                // Current plan details
                document.getElementById('current-tier').textContent = data.subscription.tier;
                document.getElementById('current-price').textContent = \`$\${data.subscription.amount}/mo\`;
                document.getElementById('billing-cycle').textContent = data.subscription.billing_cycle;

                // Status badge
                const statusBadge = document.getElementById('status-badge');
                statusBadge.textContent = data.subscription.status;
                statusBadge.className = \`px-3 py-1 rounded-full text-sm font-semibold \${
                    data.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    data.subscription.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                }\`;

                // Billing info
                const nextBilling = new Date(data.subscription.next_billing_date);
                document.getElementById('next-billing').textContent = nextBilling.toLocaleDateString();
                document.getElementById('payment-method').textContent = data.subscription.payment_method || 'Not set';

                // Usage statistics
                renderUsage('bookings', data.usage.bookings_count, data.limits.bookings_limit);
                renderUsage('tryons', data.usage.tryons_count, data.limits.tryons_limit);
                renderUsage('queries', data.usage.ai_queries_count, data.limits.ai_queries_limit);

                // Upgrade options
                renderUpgradeOptions(data.subscription.tier, data.availablePlans);
            }

            function renderUsage(type, used, limit) {
                const isUnlimited = limit === -1;
                const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
                const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - used);

                document.getElementById(\`\${type}-used\`).textContent = used;
                document.getElementById(\`\${type}-limit\`).textContent = isUnlimited ? 'Unlimited' : limit;
                document.getElementById(\`\${type}-remaining\`).textContent = remaining;
                document.getElementById(\`\${type}-bar\`).style.width = \`\${percentage}%\`;
            }

            function renderUpgradeOptions(currentTier, plans) {
                const container = document.getElementById('upgrade-options');
                const tierOrder = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
                const currentIndex = tierOrder.indexOf(currentTier);

                const upgradePlans = plans.filter(plan => 
                    tierOrder.indexOf(plan.tier) > currentIndex
                );

                if (upgradePlans.length === 0) {
                    container.innerHTML = \`
                        <div class="col-span-3 text-center py-12">
                            <i class="fas fa-star text-yellow-500 text-5xl mb-4"></i>
                            <p class="text-gray-600 text-lg">You're on the highest plan! 🎉</p>
                        </div>
                    \`;
                    return;
                }

                container.innerHTML = upgradePlans.map(plan => \`
                    <div class="border-2 border-purple-200 rounded-xl p-6 hover:border-purple-500 transition">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">\${plan.tier}</h3>
                        <div class="text-3xl font-bold gradient-text mb-4">
                            $\${plan.price}<span class="text-lg text-gray-500">/mo</span>
                        </div>
                        <ul class="space-y-2 mb-6">
                            <li class="text-sm text-gray-600">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                \${plan.bookings_limit === -1 ? 'Unlimited' : plan.bookings_limit} bookings
                            </li>
                            <li class="text-sm text-gray-600">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                Advanced AI features
                            </li>
                            <li class="text-sm text-gray-600">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                Priority support
                            </li>
                        </ul>
                        <button onclick="selectUpgrade('\${plan.tier}', \${plan.price})" 
                                class="w-full gradient-bg text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                            Upgrade to \${plan.tier}
                        </button>
                    </div>
                \`).join('');
            }

            function upgradePlan() {
                window.location.href = '/pricing';
            }

            function manageBilling() {
                window.location.href = '/subscription/billing';
            }

            async function cancelSubscription() {
                if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
                    return;
                }

                try {
                    const response = await fetch('/api/subscription/cancel', {
                        method: 'POST',
                        headers: {
                            'Authorization': \`Bearer \${token}\`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) throw new Error('Failed to cancel subscription');

                    alert('Subscription cancelled successfully. You will retain access until the end of your billing period.');
                    loadSubscription();
                } catch (error) {
                    console.error('Error cancelling subscription:', error);
                    alert('Failed to cancel subscription. Please try again.');
                }
            }

            async function selectUpgrade(tier, price) {
                if (!confirm(\`Upgrade to \${tier} plan for $\${price}/month?\`)) {
                    return;
                }

                window.location.href = \`/payment/upgrade?tier=\${tier}\`;
            }

            function logout() {
                localStorage.removeItem('auth_token');
                window.location.href = '/auth/login';
            }

            // Load subscription on page load
            loadSubscription();
        </script>
    </body>
    </html>
  `)
})

// Upgrade flow - select new plan and initiate payment
app.get('/subscription/upgrade', async (c) => {
  // Simple check - will validate on API side
  const tier = c.req.query('tier') || 'STARTER'
  const billing = c.req.query('billing') || 'MONTHLY'

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Subscription - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="max-w-3xl mx-auto px-4 py-12">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold mb-2">
                    <i class="fas fa-rocket text-purple-600 mr-2"></i>
                    <span class="gradient-text">Upgrade Your Plan</span>
                </h1>
                <p class="text-gray-600">You're upgrading to <strong>${tier}</strong> plan</p>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-8">
                <div class="mb-8 pb-8 border-b">
                    <h2 class="text-xl font-bold mb-4">Order Summary</h2>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-700">Plan:</span>
                        <span class="font-semibold">${tier}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-700">Billing Cycle:</span>
                        <span class="font-semibold">${billing}</span>
                    </div>
                    <div class="flex justify-between items-center text-2xl font-bold">
                        <span>Total:</span>
                        <span id="total-price" class="gradient-text">$0</span>
                    </div>
                </div>

                <div class="mb-8">
                    <h2 class="text-xl font-bold mb-4">Payment Method</h2>
                    <div class="space-y-4">
                        <label class="flex items-center p-4 border-2 border-purple-600 rounded-lg cursor-pointer">
                            <input type="radio" name="payment_method" value="duitku" checked class="mr-3">
                            <div class="flex-1">
                                <div class="font-semibold">Duitku Payment Gateway</div>
                                <div class="text-sm text-gray-500">Credit Card, Bank Transfer, E-Wallet</div>
                            </div>
                            <i class="fas fa-credit-card text-2xl text-purple-600"></i>
                        </label>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="flex items-center">
                        <input type="checkbox" id="terms" class="mr-2">
                        <span class="text-sm text-gray-600">
                            I agree to the <a href="#" class="text-purple-600 hover:underline">Terms of Service</a> 
                            and <a href="#" class="text-purple-600 hover:underline">Privacy Policy</a>
                        </span>
                    </label>
                </div>

                <button onclick="processPayment()" id="pay-button" 
                        class="w-full gradient-bg text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition disabled:opacity-50">
                    <i class="fas fa-lock mr-2"></i>Proceed to Payment
                </button>

                <p class="text-center text-sm text-gray-500 mt-4">
                    <i class="fas fa-shield-alt mr-1"></i>
                    Your payment is secured with 256-bit SSL encryption
                </p>
            </div>
        </div>

        <script>
            const tier = '${tier}';
            const billing = '${billing}';
            const token = localStorage.getItem('auth_token');

            const prices = {
                'STARTER': { MONTHLY: 19, YEARLY: 228 },
                'PRO': { MONTHLY: 49, YEARLY: 588 },
                'ENTERPRISE': { MONTHLY: 99, YEARLY: 1188 }
            };

            const price = prices[tier]?.[billing] || 0;
            document.getElementById('total-price').textContent = \`$\${price}\`;

            async function processPayment() {
                const termsChecked = document.getElementById('terms').checked;
                
                if (!termsChecked) {
                    alert('Please agree to the Terms of Service and Privacy Policy');
                    return;
                }

                const button = document.getElementById('pay-button');
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

                try {
                    const response = await fetch('/api/payment/create', {
                        method: 'POST',
                        headers: {
                            'Authorization': \`Bearer \${token}\`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            tier: tier,
                            billing_cycle: billing,
                            amount: price
                        })
                    });

                    if (!response.ok) throw new Error('Payment creation failed');

                    const data = await response.json();
                    
                    // Redirect to Duitku payment page
                    if (data.paymentUrl) {
                        window.location.href = data.paymentUrl;
                    } else {
                        throw new Error('No payment URL received');
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    alert('Failed to process payment. Please try again.');
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-lock mr-2"></i>Proceed to Payment';
                }
            }
        </script>
    </body>
    </html>
  `)
})

export default app
