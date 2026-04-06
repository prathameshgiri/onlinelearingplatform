// ===== COURSES PAGE SCRIPT =====
let allCourses = [];
let filteredCourses = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadCourses();
  setupFilters();
  hideLoader();
});

async function loadCourses() {
  try {
    allCourses = await api('/courses');
    filteredCourses = [...allCourses];
    renderCourses(filteredCourses);
  } catch (err) {
    console.error('Failed to load courses:', err);
    showToast(err.message, 'error');
    document.getElementById('coursesGrid').innerHTML = '';
    document.getElementById('emptyState').style.display = 'block';
  }
}

function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('courseCount');

  if (courses.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    countEl.textContent = 'No courses found';
    return;
  }

  emptyState.style.display = 'none';
  countEl.textContent = `Showing ${courses.length} course${courses.length > 1 ? 's' : ''}`;
  grid.innerHTML = courses.map(c => courseCardHTML(c)).join('');
}

function setupFilters() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const levelFilter = document.getElementById('levelFilter');
  const sortFilter = document.getElementById('sortFilter');

  // Debounced search
  const debouncedFilter = debounce(applyFilters, 300);

  searchInput.addEventListener('input', debouncedFilter);
  categoryFilter.addEventListener('change', applyFilters);
  levelFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const level = document.getElementById('levelFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let results = [...allCourses];

  // Search
  if (search) {
    results = results.filter(c =>
      c.title.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.instructor.toLowerCase().includes(search) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(search)))
    );
  }

  // Category filter
  if (category) {
    results = results.filter(c => c.category === category);
  }

  // Level filter
  if (level) {
    results = results.filter(c => c.level === level);
  }

  // Sort
  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  else if (sort === 'students') results.sort((a, b) => b.students - a.students);
  else if (sort === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'price-low') results.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') results.sort((a, b) => b.price - a.price);

  filteredCourses = results;
  renderCourses(filteredCourses);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('levelFilter').value = '';
  document.getElementById('sortFilter').value = '';
  filteredCourses = [...allCourses];
  renderCourses(filteredCourses);
}
