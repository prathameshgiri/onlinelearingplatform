// ===== ADMIN USERS SCRIPT =====
let allUsers = [];
let allEnrollments = [];

document.addEventListener('DOMContentLoaded', async () => {
  const admin = requireAdmin();
  if (!admin) return;

  await loadUsers();
  setupSearch();
});

async function loadUsers() {
  try {
    const [users, enrollments] = await Promise.all([
      adminApi('/users'),
      adminApi('/enrollments')
    ]);

    allUsers = users;
    allEnrollments = enrollments;
    renderUsers(allUsers);
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  const countEl = document.getElementById('userCount');
  countEl.textContent = users.length;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => {
    const userEnrollments = allEnrollments.filter(e => e.userId === user.id);
    return `
      <tr>
        <td>
          <div class="table-user">
            <div class="table-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="table-name">${user.name}</div>
              <div class="table-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-light);">${formatDate(user.joinedAt)}</td>
        <td><span class="table-badge badge-primary">${userEnrollments.length} courses</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-icon" onclick="manageEnrollments('${user.id}', '${user.name.replace(/'/g, "\\'")}')" title="Manage Enrollments">🎓</button>
            <button class="btn btn-ghost btn-icon" onclick="editUser('${user.id}')" title="Edit">✏️</button>
            <button class="btn btn-danger btn-icon" onclick="deleteUser('${user.id}', '${user.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupSearch() {
  const searchInput = document.getElementById('userSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderUsers(allUsers);
      return;
    }
    const filtered = allUsers.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
    renderUsers(filtered);
  }, 300));
}

function editUser(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserName').value = user.name;
  document.getElementById('editUserEmail').value = user.email;
  openModal('editUserModal');
}

async function saveUser() {
  const id = document.getElementById('editUserId').value;
  const name = document.getElementById('editUserName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();

  if (!name || !email) {
    showAdminToast('Name and email are required', 'warning');
    return;
  }

  try {
    await adminApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });

    showAdminToast('User updated successfully', 'success');
    closeModal('editUserModal');
    await loadUsers();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This will also remove all their enrollments.`)) return;

  try {
    await adminApi(`/users/${id}`, { method: 'DELETE' });
    showAdminToast(`User "${name}" deleted`, 'success');
    await loadUsers();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

// ===== ENROLLMENT MANAGEMENT =====
let currentCourses = [];

async function manageEnrollments(userId, userName) {
  document.getElementById('enrollmentUserId').value = userId;
  document.getElementById('enrollmentUserName').textContent = userName;
  
  openModal('manageEnrollmentsModal');
  await renderUserEnrollments(userId);
}

async function renderUserEnrollments(userId) {
  const listEl = document.getElementById('userEnrollmentsList');
  const selectEl = document.getElementById('courseSelect');
  listEl.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px;">Loading...</div>';
  
  try {
    const [enrollments, courses] = await Promise.all([
      adminApi(`/enrollments/user/${userId}`),
      adminApi('/courses')
    ]);
    currentCourses = courses;

    // Filter courses not yet enrolled in for the dropdown
    const enrolledIds = enrollments.map(e => e.courseId);
    const availableCourses = courses.filter(c => !enrolledIds.includes(c.id));
    
    selectEl.innerHTML = availableCourses.length > 0 
      ? '<option value="">Select a course to enroll...</option>' + availableCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')
      : '<option value="">User is enrolled in all courses!</option>';

    if (enrollments.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: var(--text-light); padding: 20px;">No courses currently enrolled.</div>';
      return;
    }

    listEl.innerHTML = enrollments.map(e => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 8px;">
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">${e.course ? e.course.title : 'Course not found'}</div>
          <div style="font-size: 0.8rem; color: var(--text-light);">Enrolled: ${formatDate(e.enrolledAt)}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="removeEnrollment('${e.id}', '${e.course ? e.course.title.replace(/'/g, "\\'") : 'course'}', '${userId}')">Remove</button>
      </div>
    `).join('');
    
  } catch (err) {
    listEl.innerHTML = `<div style="text-align: center; color: #e74c3c; padding: 20px;">Error loading enrollments: ${err.message}</div>`;
  }
}

async function addEnrollment() {
  const userId = document.getElementById('enrollmentUserId').value;
  const courseId = document.getElementById('courseSelect').value;
  
  if (!courseId) {
    showAdminToast('Please select a course', 'warning');
    return;
  }
  
  try {
    await adminApi('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ userId, courseId })
    });
    
    showAdminToast('User enrolled successfully', 'success');
    await loadUsers(); // Refresh background data
    await renderUserEnrollments(userId); // Refresh modal data
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

async function removeEnrollment(enrollmentId, courseTitle, userId) {
  if (!confirm(`Are you sure you want to remove the user from "${courseTitle}"?`)) return;
  
  try {
    await adminApi(`/enrollments/${enrollmentId}`, { method: 'DELETE' });
    showAdminToast('Enrollment removed successfully', 'success');
    
    await loadUsers(); // Refresh background data
    await renderUserEnrollments(userId); // Refresh modal data
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}
