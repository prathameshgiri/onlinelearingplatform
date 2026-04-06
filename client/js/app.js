// ===== HOME PAGE SCRIPT =====
document.addEventListener('DOMContentLoaded', async () => {
  initHeroParticles();

  // Load popular courses
  try {
    const courses = await api('/courses?sort=rating');
    const grid = document.getElementById('popularCoursesGrid');
    
    if (grid && courses.length > 0) {
      // Show top 6
      const topCourses = courses.slice(0, 6);
      grid.innerHTML = topCourses.map(c => courseCardHTML(c)).join('');
    }
  } catch (err) {
    console.error('Failed to load courses:', err);
    const grid = document.getElementById('popularCoursesGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">⚠️</div>
          <h3>Failed to load courses</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  hideLoader();
});
