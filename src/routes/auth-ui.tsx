// Phase 3: Authentication UI Pages
import { Hono } from 'hono'

const authUI = new Hono()

// Login Page
authUI.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full">
            <!-- Logo & Title -->
            <div class="text-center mb-8">
                <div class="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
                    <i class="fas fa-scissors text-4xl text-purple-600"></i>
                </div>
                <h1 class="text-4xl font-bold text-white mb-2">Barber AI SaaS</h1>
                <p class="text-purple-100">Sign in to your account</p>
            </div>

            <!-- Login Form -->
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div class="relative">
                            <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="email" 
                                id="email" 
                                required
                                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                                placeholder="you@example.com"
                            >
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div class="relative">
                            <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="password" 
                                id="password" 
                                required
                                class="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                                placeholder="••••••••"
                            >
                            <button type="button" id="toggle-password" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input type="checkbox" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                            <span class="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <a href="/auth/forgot-password" class="text-sm text-purple-600 hover:text-purple-700 font-semibold">
                            Forgot password?
                        </a>
                    </div>

                    <div id="error-message" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm"></div>

                    <button 
                        type="submit" 
                        id="submit-btn"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span id="submit-text">
                            <i class="fas fa-sign-in-alt mr-2"></i>Sign In
                        </span>
                        <span id="loading-spinner" class="hidden">
                            <i class="fas fa-spinner fa-spin mr-2"></i>Signing in...
                        </span>
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        Don't have an account? 
                        <a href="/auth/register" class="text-purple-600 hover:text-purple-700 font-semibold">Sign up</a>
                    </p>
                </div>

                <!-- Quick Demo Access -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-sm text-gray-600 text-center mb-3">Or explore without signing in</p>
                    <div class="flex gap-2 justify-center flex-wrap">
                        <a href="/demo/try-on" class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs hover:bg-purple-100">
                            <i class="fas fa-wand-magic-sparkles mr-1"></i>Try AI Demo
                        </a>
                        <a href="/demo/booking" class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs hover:bg-purple-100">
                            <i class="fas fa-calendar mr-1"></i>Booking
                        </a>
                        <a href="/demo/chat" class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs hover:bg-purple-100">
                            <i class="fas fa-robot mr-1"></i>Chatbot
                        </a>
                    </div>
                </div>
            </div>

            <!-- Back to Home -->
            <div class="text-center mt-6">
                <a href="/" class="text-white hover:text-purple-100 text-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Home
                </a>
            </div>
        </div>

        <script>
          // Toggle password visibility
          document.getElementById('toggle-password').addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = document.querySelector('#toggle-password i');
            
            if (passwordInput.type === 'password') {
              passwordInput.type = 'text';
              icon.classList.remove('fa-eye');
              icon.classList.add('fa-eye-slash');
            } else {
              passwordInput.type = 'password';
              icon.classList.remove('fa-eye-slash');
              icon.classList.add('fa-eye');
            }
          });

          // Login form submission
          document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');
            const errorMessage = document.getElementById('error-message');
            
            // Disable submit button
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            errorMessage.classList.add('hidden');

            try {
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;

              const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              });

              const data = await response.json();

              if (data.success) {
                // Save token to localStorage (consistent key naming)
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Role-based redirect - ISOLATED DASHBOARDS
                if (data.user.role === 'owner') {
                  window.location.href = '/dashboard/owner';
                } else if (data.user.role === 'barber') {
                  window.location.href = '/dashboard/barber';
                } else if (data.user.role === 'client') {
                  window.location.href = '/dashboard/client';
                } else {
                  // Fallback to unified dashboard
                  window.location.href = '/dashboard';
                }
              } else {
                errorMessage.textContent = data.error || 'Login failed. Please try again.';
                errorMessage.classList.remove('hidden');
              }
            } catch (error) {
              errorMessage.textContent = 'Network error. Please check your connection and try again.';
              errorMessage.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              loadingSpinner.classList.add('hidden');
            }
          });
        </script>
    </body>
    </html>
  `)
})

// Register Page
authUI.get('/register', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Register - Barber AI SaaS</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-2xl w-full">
            <!-- Logo & Title -->
            <div class="text-center mb-8">
                <div class="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
                    <i class="fas fa-scissors text-4xl text-purple-600"></i>
                </div>
                <h1 class="text-4xl font-bold text-white mb-2">Join Barber AI SaaS</h1>
                <p class="text-purple-100">Create your account to get started</p>
            </div>

            <!-- Register Form -->
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <form id="register-form" class="space-y-6">
                    <!-- Full Name -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            id="full_name" 
                            required
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                            placeholder="John Doe"
                        >
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                            placeholder="you@example.com"
                        >
                    </div>

                    <!-- Phone -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</label>
                        <input 
                            type="tel" 
                            id="phone"
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                            placeholder="+1 (555) 123-4567"
                        >
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            required
                            minlength="6"
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                            placeholder="Min. 6 characters"
                        >
                        <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                    </div>

                    <!-- Role Selection -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-3">I am a...</label>
                        <div class="grid grid-cols-3 gap-4">
                            <label class="role-option cursor-pointer">
                                <input type="radio" name="role" value="client" class="peer hidden" checked>
                                <div class="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-purple-500 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition">
                                    <i class="fas fa-user text-2xl text-purple-600 mb-2"></i>
                                    <p class="font-semibold text-sm">Client</p>
                                    <p class="text-xs text-gray-600">Book services</p>
                                </div>
                            </label>
                            <label class="role-option cursor-pointer">
                                <input type="radio" name="role" value="barber" class="peer hidden">
                                <div class="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-purple-500 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition">
                                    <i class="fas fa-cut text-2xl text-purple-600 mb-2"></i>
                                    <p class="font-semibold text-sm">Barber</p>
                                    <p class="text-xs text-gray-600">Manage clients</p>
                                </div>
                            </label>
                            <label class="role-option cursor-pointer">
                                <input type="radio" name="role" value="owner" class="peer hidden">
                                <div class="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-purple-500 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition">
                                    <i class="fas fa-store text-2xl text-purple-600 mb-2"></i>
                                    <p class="font-semibold text-sm">Owner</p>
                                    <p class="text-xs text-gray-600">Manage shop</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Terms & Conditions -->
                    <label class="flex items-start">
                        <input type="checkbox" id="terms" required class="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                        <span class="ml-2 text-sm text-gray-600">
                            I agree to the <a href="/terms" class="text-purple-600 hover:underline">Terms of Service</a> and <a href="/privacy" class="text-purple-600 hover:underline">Privacy Policy</a>
                        </span>
                    </label>

                    <div id="error-message" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm"></div>
                    <div id="success-message" class="hidden bg-green-50 text-green-600 p-3 rounded-lg text-sm"></div>

                    <button 
                        type="submit" 
                        id="submit-btn"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span id="submit-text">
                            <i class="fas fa-user-plus mr-2"></i>Create Account
                        </span>
                        <span id="loading-spinner" class="hidden">
                            <i class="fas fa-spinner fa-spin mr-2"></i>Creating account...
                        </span>
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        Already have an account? 
                        <a href="/auth/login" class="text-purple-600 hover:text-purple-700 font-semibold">Sign in</a>
                    </p>
                </div>
            </div>

            <!-- Back to Home -->
            <div class="text-center mt-6">
                <a href="/" class="text-white hover:text-purple-100 text-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Home
                </a>
            </div>
        </div>

        <script>
          // Register form submission
          document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            
            // Disable submit button
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');

            try {
              const full_name = document.getElementById('full_name').value;
              const email = document.getElementById('email').value;
              const phone = document.getElementById('phone').value;
              const password = document.getElementById('password').value;
              const role = document.querySelector('input[name="role"]:checked').value;

              const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email, 
                  password, 
                  full_name, 
                  phone, 
                  role 
                })
              });

              const data = await response.json();

              if (data.success) {
                successMessage.textContent = data.message + ' Redirecting to login...';
                successMessage.classList.remove('hidden');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                  window.location.href = '/auth/login';
                }, 2000);
              } else {
                errorMessage.textContent = data.error || 'Registration failed. Please try again.';
                errorMessage.classList.remove('hidden');
              }
            } catch (error) {
              errorMessage.textContent = 'Network error. Please check your connection and try again.';
              errorMessage.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              loadingSpinner.classList.add('hidden');
            }
          });
        </script>
    </body>
    </html>
  `)
})

export default authUI
