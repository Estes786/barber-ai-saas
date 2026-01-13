// Main Frontend JavaScript
console.log('🚀 Barber AI SaaS Platform Loaded!');

// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// Smooth Scroll for Navigation
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Pricing Toggle (Monthly/Yearly)
function initPricingToggle() {
  const toggleBtn = document.getElementById('pricing-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('change', (e) => {
      const isYearly = e.target.checked;
      document.querySelectorAll('[data-monthly]').forEach(el => {
        const monthly = parseFloat(el.dataset.monthly);
        const yearly = monthly * 10; // 2 months free
        el.textContent = isYearly ? `$${yearly}` : `$${monthly}`;
      });
      document.querySelectorAll('[data-period]').forEach(el => {
        el.textContent = isYearly ? '/year' : '/month';
      });
    });
  }
}

// AI Try-On Demo
function initAITryOnDemo() {
  const tryOnBtn = document.getElementById('try-on-demo-btn');
  if (tryOnBtn) {
    tryOnBtn.addEventListener('click', () => {
      alert('🤖 AI Try-On Demo\n\nUpload your photo to try 200+ hairstyles instantly!\n\nThis feature uses Cloudflare AI for real-time image processing.');
    });
  }
}

// Scroll Animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start).toLocaleString();
    }
  }, 16);
}

function initStatsCounter() {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        entry.target.dataset.animated = 'true';
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => {
    statsObserver.observe(el);
  });
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initPricingToggle();
  initAITryOnDemo();
  initScrollAnimations();
  initStatsCounter();
});
