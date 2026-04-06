// ===== AUTH SCRIPTS (Login/Register) =====

// Detect which page we're on
const isLoginPage = window.location.pathname.includes('login');

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = document.getElementById('submitBtn');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  // Reset errors
  emailError.classList.remove('show');
  passwordError.classList.remove('show');

  // Validate
  let hasError = false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    emailError.classList.add('show');
    hasError = true;
  }

  if (!password) {
    passwordError.classList.add('show');
    hasError = true;
  }

  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setUser(data.user);
    showToast('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const submitBtn = document.getElementById('submitBtn');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmError = document.getElementById('confirmError');

  // Reset errors
  [nameError, emailError, passwordError, confirmError].forEach(el => el.classList.remove('show'));

  // Validate
  let hasError = false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 2) {
    nameError.classList.add('show');
    hasError = true;
  }

  if (!emailRegex.test(email)) {
    emailError.classList.add('show');
    hasError = true;
  }

  if (password.length < 6) {
    passwordError.classList.add('show');
    hasError = true;
  }

  if (password !== confirmPassword) {
    confirmError.classList.add('show');
    hasError = true;
  }

  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    setUser(data.user);
    showToast('Account created successfully! Welcome to LearnHub!', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
});
