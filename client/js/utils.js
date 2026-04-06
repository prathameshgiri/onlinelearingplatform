// ===== UTILITY FUNCTIONS =====
const API_BASE = '/api';

// --- API Helper ---
async function api(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw err;
  }
}

// --- Auth/Session ---
function getUser() {
  const user = localStorage.getItem('learnhub_user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('learnhub_user', JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem('learnhub_user');
}

function requireAuth() {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}

// --- Dark Mode ---
function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  const saved = localStorage.getItem('learnhub_theme');
  
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggle) toggle.textContent = '☀️';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('learnhub_theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

// --- Navigation Auth State ---
function initNavAuth() {
  const user = getUser();
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const userAvatar = document.getElementById('userAvatar');
  const userNameEl = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
  } else {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearUser();
      showToast('Logged out successfully', 'success');
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }

  // Build mobile menu
  initMobileMenu(user);
}

// --- Mobile Menu ---
function initMobileMenu(user) {
  // Create mobile menu element
  const existingMenu = document.getElementById('mobileMenu');
  if (existingMenu) existingMenu.remove();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navLinksHTML = `
    <ul class="mobile-menu-nav">
      <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}"><span class="menu-icon">🏠</span> Home</a></li>
      <li><a href="courses.html" class="${currentPage === 'courses.html' ? 'active' : ''}"><span class="menu-icon">📚</span> Courses</a></li>
      <li><a href="dashboard.html" class="${currentPage === 'dashboard.html' ? 'active' : ''}"><span class="menu-icon">📊</span> Dashboard</a></li>
    </ul>
  `;

  let userSectionHTML = '';
  if (user) {
    userSectionHTML = `
      <div class="mobile-menu-user">
        <div class="mobile-menu-user-info">
          <div class="mobile-menu-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="mobile-menu-user-name">${user.name}</div>
            <div class="mobile-menu-user-email">${user.email}</div>
          </div>
        </div>
        <button class="mobile-menu-logout" id="mobileLogoutBtn">🚪 Logout</button>
      </div>
    `;
  } else {
    userSectionHTML = `
      <div class="mobile-menu-auth">
        <a href="login.html" class="btn btn-secondary btn-sm">Log In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Sign Up Free</a>
      </div>
    `;
  }

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.id = 'mobileMenu';
  mobileMenu.innerHTML = `
    <div class="mobile-menu-content">
      <div class="mobile-menu-header">
        <h3>📚 LearnHub</h3>
        <button class="mobile-menu-close" id="mobileMenuClose">✕</button>
      </div>
      ${navLinksHTML}
      <div class="mobile-menu-divider"></div>
      ${userSectionHTML}
    </div>
  `;

  document.body.appendChild(mobileMenu);

  // Event listeners
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileMenuClose');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

  // Close on overlay click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => {
      clearUser();
      showToast('Logged out successfully', 'success');
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }
}

// --- Navbar Scroll Effect ---
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar || navbar.classList.contains('scrolled')) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// --- Scroll Reveal Animations ---
function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// --- Page Loader ---
function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 300);
  }
}

// --- Hero Particles ---
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.width = (Math.random() * 4 + 2) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// --- Debounce ---
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Format Price ---
function formatPrice(price) {
  return '₹' + price.toLocaleString('en-IN');
}

// --- Render Stars ---
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// --- Course Card HTML ---
function courseCardHTML(course) {
  return `
    <div class="course-card" onclick="window.location.href='course.html?id=${course.id}'">
      <div class="course-card-image">
        <img src="${course.image}" alt="${course.title}" loading="lazy">
        <span class="course-card-badge">${course.category}</span>
        <span class="course-card-level">${course.level}</span>
      </div>
      <div class="course-card-body">
        <div class="course-card-category">${course.category}</div>
        <h3 class="course-card-title">${course.title}</h3>
        <div class="course-card-instructor">👤 ${course.instructor}</div>
        <div class="course-card-meta">
          <div class="course-card-rating">
            ${renderStars(course.rating)} ${course.rating}
            <span>(${course.students.toLocaleString()})</span>
          </div>
          <span>⏱ ${course.duration}</span>
        </div>
        <div class="course-card-footer">
          <div class="course-card-price">${formatPrice(course.price)}</div>
          <button class="btn btn-primary btn-sm">View Course</button>
        </div>
      </div>
    </div>
  `;
}

// --- Lazy Load Images ---
function initLazyLoad() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => observer.observe(img));
  }
}

// --- Init Common ---
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initNavAuth();
  initNavbarScroll();
  initScrollReveal();
  initLazyLoad();
});
