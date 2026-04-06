// ===== ADMIN ACTIVITY SCRIPT =====
document.addEventListener('DOMContentLoaded', async () => {
  const admin = requireAdmin();
  if (!admin) return;

  await loadActivities();
  
  // Real-time notification simulation (polls every 30 seconds)
  setInterval(loadActivities, 30000);
});

async function loadActivities() {
  try {
    const activities = await adminApi('/activities');
    renderActivities(activities);
  } catch (err) {
    showAdminToast('Failed to load activities', 'error');
  }
}

function renderActivities(activities) {
  const container = document.getElementById('activityFeed');
  
  if (!activities || activities.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">No recent activity</div>';
    return;
  }

  container.innerHTML = activities.map(act => {
    let icon = '⚡';
    let bgColor = 'rgba(108, 92, 231, 0.1)';
    let color = 'var(--primary)';

    if (act.type === 'user_registered') {
      icon = '👤';
      bgColor = 'rgba(0, 206, 201, 0.1)';
      color = 'var(--secondary)';
    } else if (act.type === 'course_enrolled') {
      icon = '🎓';
      bgColor = 'rgba(253, 203, 110, 0.1)';
      color = '#e67e22';
    } else if (act.type === 'contact_received') {
      icon = '📩';
      bgColor = 'rgba(253, 121, 168, 0.1)';
      color = 'var(--accent)';
    } else if (act.type === 'review_added') {
      icon = '⭐';
      bgColor = 'rgba(241, 196, 15, 0.1)';
      color = '#f39c12';
    }

    return `
      <div class="activity-item">
        <div class="activity-icon" style="background: ${bgColor}; color: ${color};">${icon}</div>
        <div class="activity-content">
          <div class="activity-desc">${act.description}</div>
          <div class="activity-time">${formatDate(act.timestamp)}</div>
        </div>
      </div>
    `;
  }).join('');
}
