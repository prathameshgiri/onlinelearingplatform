// ===== DASHBOARD PAGE SCRIPT =====

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  // Update greeting
  const greeting = document.getElementById('dashboardGreeting');
  if (greeting) {
    greeting.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
  }

  try {
    const enrollments = await api(`/enrollments/user/${user.id}`);
    renderDashboard(enrollments);
  } catch (err) {
    console.error(err);
    showToast('Failed to load dashboard data', 'error');
  }

  hideLoader();
});

function renderDashboard(enrollments) {
  // Stats
  const totalEnrolled = enrollments.length;
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
    : 0;
  const completed = enrollments.filter(e => e.progress >= 100).length;

  document.getElementById('statEnrolled').textContent = totalEnrolled;
  document.getElementById('statAvgProgress').textContent = avgProgress + '%';
  document.getElementById('statCompleted').textContent = completed;

  // Courses grid
  const grid = document.getElementById('enrolledCoursesGrid');
  const emptyState = document.getElementById('emptyState');

  if (enrollments.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  grid.innerHTML = enrollments.map(enrollment => {
    const course = enrollment.course;
    if (!course) return '';

    const statusClass = enrollment.progress >= 100 ? 'completed' : 'in-progress';
    const statusText = enrollment.progress >= 100 ? 'Completed' : 'In Progress';

    return `
      <div class="enrolled-card" onclick="window.location.href='course.html?id=${course.id}'">
        <div class="enrolled-card-image">
          <img src="${course.image}" alt="${course.title}" loading="lazy">
        </div>
        <div class="enrolled-card-body">
          <h3 class="enrolled-card-title">${course.title}</h3>
          <div class="enrolled-card-instructor">👤 ${course.instructor}</div>
          <div class="progress-bar-container">
            <div class="progress-bar-header">
              <span class="progress-bar-label">Progress</span>
              <span class="progress-bar-value">${enrollment.progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${enrollment.progress}%"></div>
            </div>
          </div>
          <div class="enrolled-card-footer">
            <span class="enrolled-status ${statusClass}">${statusText}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              ${new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
