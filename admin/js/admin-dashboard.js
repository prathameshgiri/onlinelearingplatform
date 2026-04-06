// ===== ADMIN DASHBOARD SCRIPT =====
let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  const admin = requireAdmin();
  if (!admin) return;

  loadDashboard();

  // Auto-refresh every 10 seconds
  refreshInterval = setInterval(loadDashboard, 10000);
});

async function loadDashboard() {
  try {
    const analytics = await adminApi('/analytics');

    // Update stat cards
    document.getElementById('totalUsers').textContent = analytics.totalUsers;
    document.getElementById('totalCourses').textContent = analytics.totalCourses;
    document.getElementById('totalEnrollments').textContent = analytics.totalEnrollments;
    document.getElementById('avgProgress').textContent = analytics.avgProgress + '%';

    // Category chart
    renderCategoryChart(analytics.categories);

    // Top courses
    renderTopCourses(analytics.topCourses);

    // Recent enrollments
    renderRecentEnrollments(analytics.recentEnrollments);

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function renderCategoryChart(categories) {
  const container = document.getElementById('categoryChart');
  if (!container) return;

  const entries = Object.entries(categories);
  if (entries.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No data</p>';
    return;
  }

  const max = Math.max(...entries.map(([, v]) => v));
  const colors = [
    'var(--gradient-1)', 'var(--gradient-2)', 'var(--gradient-3)',
    'var(--gradient-4)', 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
    'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)',
    'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)'
  ];

  container.innerHTML = entries.map(([label, value], i) => {
    const height = (value / max) * 100;
    const shortLabel = label.length > 8 ? label.slice(0, 7) + '…' : label;
    return `<div class="mini-chart-bar" style="height: ${height}%; background: ${colors[i % colors.length]};" data-label="${shortLabel}" title="${label}: ${value}"></div>`;
  }).join('');
}

function renderTopCourses(courses) {
  const container = document.getElementById('topCoursesList');
  if (!container) return;

  container.innerHTML = courses.map((c, i) => `
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; ${i < courses.length - 1 ? 'border-bottom: 1px solid var(--border);' : ''}">
      <span style="width: 28px; height: 28px; border-radius: 50%; background: var(--gradient-1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">${i + 1}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${c.students.toLocaleString()} students · ⭐ ${c.rating}</div>
      </div>
    </div>
  `).join('');
}

function renderRecentEnrollments(enrollments) {
  const tbody = document.getElementById('recentEnrollmentsTable');
  if (!tbody) return;

  if (enrollments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">No enrollments yet</td></tr>';
    return;
  }

  tbody.innerHTML = enrollments.map(e => `
    <tr>
      <td>
        <div class="table-user">
          <div class="table-avatar">${e.userName.charAt(0).toUpperCase()}</div>
          <div><div class="table-name">${e.userName}</div></div>
        </div>
      </td>
      <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.courseTitle}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 6px; background: var(--border); border-radius: 10px; overflow: hidden; min-width: 60px;">
            <div style="height: 100%; width: ${e.progress}%; background: var(--gradient-1); border-radius: 10px;"></div>
          </div>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">${e.progress}%</span>
        </div>
      </td>
      <td style="font-size: 0.85rem; color: var(--text-light);">${formatDate(e.enrolledAt)}</td>
    </tr>
  `).join('');
}
