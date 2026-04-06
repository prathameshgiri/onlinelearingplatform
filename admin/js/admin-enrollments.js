// ===== ADMIN ENROLLMENTS SCRIPT =====
let refreshInterval;

document.addEventListener('DOMContentLoaded', async () => {
  const admin = requireAdmin();
  if (!admin) return;

  await loadEnrollments();

  // Auto-refresh every 10 seconds
  refreshInterval = setInterval(loadEnrollments, 10000);
});

async function loadEnrollments() {
  try {
    const enrollments = await adminApi('/enrollments');
    renderEnrollments(enrollments);
  } catch (err) {
    console.error('Enrollments load error:', err);
  }
}

function renderEnrollments(enrollments) {
  const tbody = document.getElementById('enrollmentsTableBody');
  const countEl = document.getElementById('enrollmentCount');
  countEl.textContent = enrollments.length;

  if (enrollments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No enrollments found</td></tr>';
    return;
  }

  // Sort by newest first
  enrollments.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

  tbody.innerHTML = enrollments.map(e => {
    const progressColor = e.progress >= 100 ? 'var(--gradient-2)' : e.progress >= 50 ? 'var(--gradient-1)' : 'var(--gradient-3)';
    const statusBadge = e.progress >= 100 ? 'badge-success' : e.progress >= 50 ? 'badge-primary' : 'badge-warning';
    const statusText = e.progress >= 100 ? 'Completed' : e.progress >= 50 ? 'In Progress' : 'Started';

    return `
      <tr>
        <td>
          <div class="table-user">
            <div class="table-avatar">${e.userName.charAt(0).toUpperCase()}</div>
            <div>
              <div class="table-name">${e.userName}</div>
              <div class="table-email">${e.userEmail}</div>
            </div>
          </div>
        </td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;" title="${e.courseTitle}">${e.courseTitle}</td>
        <td><span class="table-badge badge-primary">${e.courseCategory || 'N/A'}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;min-width:120px;">
            <div style="flex:1;height:8px;background:var(--border);border-radius:10px;overflow:hidden;">
              <div style="height:100%;width:${e.progress}%;background:${progressColor};border-radius:10px;transition:width 0.5s;"></div>
            </div>
            <span style="font-size:0.8rem;font-weight:700;min-width:32px;" class="table-badge ${statusBadge}">${e.progress}%</span>
          </div>
        </td>
        <td style="font-size:0.85rem;color:var(--text-light);">${formatDate(e.enrolledAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteEnrollment('${e.id}')" title="Remove">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteEnrollment(id) {
  if (!confirm('Remove this enrollment?')) return;

  try {
    await adminApi(`/enrollments/${id}`, { method: 'DELETE' });
    showAdminToast('Enrollment removed', 'success');
    await loadEnrollments();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}
