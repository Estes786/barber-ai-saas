import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Subscription Upgrade Page with Duitku Payment
app.get('/subscription/upgrade', async (c) => {
  const tier = c.req.query('tier') || 'STARTER';
  const billing = c.req.query('billing') || 'MONTHLY';

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Your Plan - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
        <div class="pt-12 pb-20 px-4">
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold mb-4">
                        <span class="gradient-text">Upgrade Your Plan</span>
                    </h1>
                    <p class="text-xl text-gray-600">
                        Complete your upgrade to ${tier} plan
                    </p>
                </div>

                <!-- Order Summary -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold mb-6">Order Summary</h2>
                    
                    <div class="border-b pb-4 mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-gray-700">Plan:</span>
                            <span class="font-bold text-gray-900">${tier}</span>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-gray-700">Billing Cycle:</span>
                            <span class="font-bold text-gray-900">${billing}</span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span id="total-amount" class="text-purple-600">$19</span>
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold mb-6">
                        <i class="fas fa-credit-card text-purple-600 mr-2"></i>
                        Payment Method
                    </h2>
                    
                    <div class="space-y-3" id="payment-methods">
                        <div class="text-center text-gray-500">
                            <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                            <p>Loading payment methods...</p>
                        </div>
                    </div>
                </div>

                <!-- Customer Information -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold mb-6">
                        <i class="fas fa-user text-purple-600 mr-2"></i>
                        Customer Information
                    </h2>
                    
                    <form id="payment-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input type="text" id="full-name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="John Doe">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="john@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" id="phone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="+6281234567890">
                        </div>

                        <div class="flex items-center mt-6">
                            <input type="checkbox" id="agree-tos" required class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                            <label for="agree-tos" class="ml-2 text-sm text-gray-600">
                                I agree to the <a href="#" class="text-purple-600 hover:underline">Terms of Service</a> and <a href="#" class="text-purple-600 hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <button type="submit" id="proceed-payment-btn" class="w-full gradient-bg text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg">
                            <i class="fas fa-lock mr-2"></i> Proceed to Payment
                        </button>
                    </form>
                </div>

                <!-- Security Notice -->
                <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <i class="fas fa-shield-alt text-green-600 text-2xl mb-2"></i>
                    <p class="text-sm text-green-800">Your payment is secured with 256-bit SSL encryption</p>
                </div>
            </div>
        </div>

        <script>
            let selectedPaymentMethod = null;
            const tier = '${tier}';
            const billing = '${billing}';

            // Fetch payment methods
            async function loadPaymentMethods() {
                try {
                    const response = await fetch('/api/payment/methods?amount=19000');
                    const data = await response.json();

                    if (data.success && data.paymentMethods) {
                        const container = document.getElementById('payment-methods');
                        container.innerHTML = data.paymentMethods.map(method => 
                            '<label class="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-600 transition payment-method-option">' +
                                '<input type="radio" name="payment-method" value="' + method.paymentMethod + '" class="w-5 h-5 text-purple-600" required>' +
                                '<div class="ml-4 flex-1">' +
                                    '<div class="font-semibold text-gray-900">' + method.paymentName + '</div>' +
                                    '<div class="text-sm text-gray-600">Fee: Rp ' + method.totalFee.toLocaleString() + '</div>' +
                                '</div>' +
                                '<img src="' + method.paymentImage + '" alt="' + method.paymentName + '" class="h-8 object-contain">' +
                            '</label>'
                        ).join('');

                        // Add event listeners
                        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
                            radio.addEventListener('change', (e) => {
                                selectedPaymentMethod = e.target.value;
                                document.querySelectorAll('.payment-method-option').forEach(opt => {
                                    opt.classList.remove('border-purple-600', 'bg-purple-50');
                                });
                                e.target.closest('.payment-method-option').classList.add('border-purple-600', 'bg-purple-50');
                            });
                        });
                    }
                } catch (error) {
                    console.error('Error loading payment methods:', error);
                    document.getElementById('payment-methods').innerHTML = 
                        '<div class="text-center text-red-600">' +
                            '<i class="fas fa-exclamation-triangle text-3xl mb-3"></i>' +
                            '<p>Failed to load payment methods. Please try again.</p>' +
                        '</div>';
                }
            }

            // Handle form submission
            document.getElementById('payment-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!selectedPaymentMethod) {
                    alert('Please select a payment method');
                    return;
                }

                const button = document.getElementById('proceed-payment-btn');
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

                try {
                    // Get user info from localStorage or form (using Supabase token)
                    const token = localStorage.getItem('sb-access-token');
                    if (!token) {
                        window.location.href = '/auth/login?redirect=/subscription/upgrade?tier=${tier}&billing=${billing}';
                        return;
                    }

                    // Create payment transaction
                    const response = await fetch('/api/payment/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            tierId: tier, // Use tier string directly (STARTER, PRO, ENTERPRISE)
                            billingCycle: billing,
                            paymentMethod: selectedPaymentMethod,
                            email: document.getElementById('email').value,
                            fullName: document.getElementById('full-name').value,
                            phoneNumber: document.getElementById('phone').value
                        })
                    });

                    const data = await response.json();

                    if (data.success && data.transaction.paymentUrl) {
                        // Redirect to Duitku payment page
                        window.location.href = data.transaction.paymentUrl;
                    } else {
                        alert('Failed to process payment: ' + (data.error || 'Unknown error'));
                        button.disabled = false;
                        button.innerHTML = '<i class="fas fa-lock mr-2"></i> Proceed to Payment';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to process payment. Please try again.');
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-lock mr-2"></i> Proceed to Payment';
                }
            });

            // Load payment methods on page load
            loadPaymentMethods();
        </script>
    </body>
    </html>
  `);
});

// Subscription Management Page
app.get('/subscription', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Management - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
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
                        <a href="/pricing" class="text-gray-600 hover:text-purple-600">Pricing</a>
                        <a href="/subscription" class="text-purple-600 font-semibold">Subscription</a>
                        <a href="/auth/login" class="gradient-bg text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                            Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="pt-24 pb-20 px-4">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-5xl font-bold mb-4">
                        <span class="gradient-text">Manage Your Subscription</span>
                    </h1>
                    <p class="text-xl text-gray-600">
                        View your current plan, usage, and billing information
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
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                    <div class="flex space-x-4">
                        <button onclick="window.location.href='/subscription'" class="flex-1 bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition text-center">
                            <i class="fas fa-arrow-up mr-2"></i>View Available Plans
                        </button>
                        <button class="bg-red-500 bg-opacity-20 border-2 border-red-300 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-500 transition">
                            <i class="fas fa-times-circle mr-2"></i>Cancel Plan
                        </button>
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
                                Upgrade
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
                                Upgrade
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
                                Upgrade
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Billing History -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-file-invoice text-purple-600 mr-2"></i>
                        Billing History
                    </h2>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 1, 2026</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">FREE Plan - Trial Started</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">$0.00</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <button class="text-purple-600 hover:text-purple-800 font-semibold">
                                            <i class="fas fa-download mr-1"></i>Download
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 text-center text-gray-500 text-sm">
                        No payment history yet. Upgrade to a paid plan to see invoices here.
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-credit-card text-purple-600 mr-2"></i>
                        Payment Method
                    </h2>
                    
                    <div class="bg-gray-50 rounded-xl p-6 text-center">
                        <i class="fas fa-credit-card text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 mb-4">No payment method added yet</p>
                        <button class="gradient-bg text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition">
                            <i class="fas fa-plus mr-2"></i>Add Payment Method
                        </button>
                    </div>
                </div>

                <!-- Usage Statistics -->
                <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-chart-bar text-purple-600 mr-2"></i>
                        Usage Statistics (This Month)
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="border-2 border-gray-200 rounded-xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="bg-blue-100 p-3 rounded-full">
                                    <i class="fas fa-calendar-check text-blue-600 text-2xl"></i>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-gray-900">5</div>
                                    <div class="text-sm text-gray-600">of 10</div>
                                </div>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1">Bookings</h3>
                            <p class="text-sm text-gray-600">50% of limit used</p>
                            <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>

                        <div class="border-2 border-gray-200 rounded-xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="bg-purple-100 p-3 rounded-full">
                                    <i class="fas fa-magic text-purple-600 text-2xl"></i>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-gray-900">3</div>
                                    <div class="text-sm text-gray-600">of 5</div>
                                </div>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1">AI Try-Ons</h3>
                            <p class="text-sm text-gray-600">60% of limit used</p>
                            <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div class="bg-purple-600 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>

                        <div class="border-2 border-gray-200 rounded-xl p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="bg-green-100 p-3 rounded-full">
                                    <i class="fas fa-robot text-green-600 text-2xl"></i>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-gray-900">15</div>
                                    <div class="text-sm text-gray-600">of 30</div>
                                </div>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1">Chat Messages</h3>
                            <p class="text-sm text-gray-600">50% of limit used</p>
                            <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div class="bg-green-600 h-2 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                            <div>
                                <p class="font-semibold text-yellow-900">You're approaching your monthly limits</p>
                                <p class="text-sm text-yellow-700">Upgrade now to avoid service interruption</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FAQ -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">
                        <i class="fas fa-question-circle text-purple-600 mr-2"></i>
                        Subscription FAQ
                    </h2>
                    
                    <div class="space-y-4">
                        <div class="border-b border-gray-200 pb-4">
                            <h3 class="font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
                            <p class="text-gray-600 text-sm">Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.</p>
                        </div>
                        <div class="border-b border-gray-200 pb-4">
                            <h3 class="font-semibold text-gray-900 mb-2">What happens when I reach my usage limit?</h3>
                            <p class="text-gray-600 text-sm">You'll receive notifications as you approach limits. Once reached, you can upgrade or wait until next billing cycle.</p>
                        </div>
                        <div class="border-b border-gray-200 pb-4">
                            <h3 class="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
                            <p class="text-gray-600 text-sm">Yes, you can change plans anytime. Upgrades take effect immediately, downgrades at the end of billing period.</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                            <p class="text-gray-600 text-sm">We accept all major credit cards, bank transfers, and e-wallets through Duitku payment gateway.</p>
                        </div>
                    </div>
                </div>

                <!-- Contact Support -->
                <div class="text-center mt-12">
                    <p class="text-gray-600 mb-4">Need help with your subscription?</p>
                    <a href="mailto:support@barber-ai-saas.com" class="inline-flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-800">
                        <i class="fas fa-envelope"></i>
                        <span>Contact Support</span>
                    </a>
                </div>
            </div>
        </div>

        <script>
            function upgradeToPlan(planName, price) {
                // Get authentication token
                const token = localStorage.getItem('sb-access-token');
                
                if (!token) {
                    // Redirect to login if not authenticated
                    window.location.href = '/auth/login?redirect=/subscription';
                    return;
                }
                
                // Redirect to upgrade page with tier and billing cycle
                // This allows user to select payment method properly
                window.location.href = '/subscription/upgrade?tier=' + planName + '&billing=MONTHLY';
            }

            // Check if user is authenticated using server-side session verification
            const token = localStorage.getItem('sb-access-token');
            if (!token) {
                window.location.href = '/auth/login?redirect=/subscription';
            } else {
                // Verify session with backend
                fetch('/auth/session', {
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    }
                })
                .then(r => r.json())
                .then(data => {
                    if (!data.authenticated || !data.session) {
                        // Token invalid or expired, clear and redirect to login
                        localStorage.removeItem('sb-access-token');
                        localStorage.removeItem('sb-refresh-token');
                        window.location.href = '/auth/login?redirect=/subscription';
                    }
                    // Session valid, page can load normally
                })
                .catch(err => {
                    console.error('Session verification failed:', err);
                    // On error, redirect to login
                    window.location.href = '/auth/login?redirect=/subscription';
                });
            }
        </script>
    </body>
    </html>
  `)
})

export default app
