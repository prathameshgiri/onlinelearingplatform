// ===== ADMIN UTILITY FUNCTIONS =====
const API_BASE = '/api';

// --- API Helper ---
async function adminApi(endpoint, options = {}) {
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
      throw new Error('Unable to connect to server');
    }
    throw err;
  }
}

// --- Admin Auth ---
function getAdmin() {
  const admin = localStorage.getItem('learnhub_admin');
  return admin ? JSON.parse(admin) : null;
}

function setAdmin(admin) {
  localStorage.setItem('learnhub_admin', JSON.stringify(admin));
}

function requireAdmin() {
  const admin = getAdmin();
  if (!admin) {
    window.location.href = 'index.html';
    return null;
  }
  return admin;
}

function adminLogout() {
  localStorage.removeItem('learnhub_admin');
  showAdminToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = 'index.html', 500);
}

// --- Toast ---
function showAdminToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}

// --- Dark Mode ---
function initAdminDarkMode() {
  const saved = localStorage.getItem('learnhub_admin_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('darkModeBtn');
    if (btn) btn.textContent = '☀️';
  }
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('learnhub_admin_theme', next);
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// --- Modal ---
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// --- Init Admin Info in Sidebar ---
function initAdminInfo() {
  const admin = getAdmin();
  if (admin) {
    const avatar = document.getElementById('adminAvatar');
    const name = document.getElementById('adminName');
    if (avatar) avatar.textContent = admin.name.charAt(0).toUpperCase();
    if (name) name.textContent = admin.name;
  }
}

// --- Format ---
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatPrice(price) {
  return '₹' + price.toLocaleString('en-IN');
}

// --- Debounce ---
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Common Init ---
document.addEventListener('DOMContentLoaded', () => {
  initAdminDarkMode();
  initAdminInfo();
  initMobileSidebar();
});

// --- Mobile Sidebar Toggle ---
function initMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  document.body.appendChild(overlay);

  // Add hamburger button to topbar
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.id = 'mobileMenuToggle';
    toggleBtn.textContent = '☰';
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    topbar.insertBefore(toggleBtn, topbar.firstChild);
  }

  // Close on overlay click
  overlay.addEventListener('click', closeMobileSidebar);

  // Close on link click (mobile)
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

  // Wrap data tables in scrollable wrapper for mobile
  document.querySelectorAll('.data-table').forEach(table => {
    if (!table.parentElement.classList.contains('data-table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'data-table-wrapper';
      table.parentElement.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
