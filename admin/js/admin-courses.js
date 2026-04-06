// ===== ADMIN COURSES SCRIPT =====
let allCourses = [];
let editingCourseId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const admin = requireAdmin();
  if (!admin) return;

  await loadCourses();
  setupSearch();
});

async function loadCourses() {
  try {
    allCourses = await adminApi('/courses');
    renderCourses(allCourses);
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

function renderCourses(courses) {
  const tbody = document.getElementById('coursesTableBody');
  const countEl = document.getElementById('courseCount');
  countEl.textContent = courses.length;

  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No courses found</td></tr>';
    return;
  }

  tbody.innerHTML = courses.map(c => `
    <tr>
      <td>
        <div class="table-user">
          <img src="${c.image}" alt="${c.title}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;">
          <div>
            <div class="table-name" style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.title}</div>
            <div class="table-email">${c.instructor}</div>
          </div>
        </div>
      </td>
      <td><span class="table-badge badge-primary">${c.category}</span></td>
      <td><span class="table-badge ${c.level === 'Beginner' ? 'badge-success' : c.level === 'Advanced' ? 'badge-danger' : 'badge-warning'}">${c.level}</span></td>
      <td style="font-weight:600;">${c.students.toLocaleString()}</td>
      <td><span style="color:#f39c12;font-weight:600;">⭐ ${c.rating}</span></td>
      <td style="font-weight:700;color:var(--primary);">${formatPrice(c.price)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-ghost btn-icon" onclick="editCourse('${c.id}')" title="Edit">✏️</button>
          <button class="btn btn-danger btn-icon" onclick="deleteCourse('${c.id}', '${c.title.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupSearch() {
  const searchInput = document.getElementById('courseSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { renderCourses(allCourses); return; }
    const filtered = allCourses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
    renderCourses(filtered);
  }, 300));
}

function openAddCourseModal() {
  editingCourseId = null;
  document.getElementById('courseModalTitle').textContent = 'Add New Course';
  document.getElementById('saveCourseBtn').textContent = 'Add Course';
  clearCourseForm();
  openModal('courseModal');
}

function editCourse(id) {
  const course = allCourses.find(c => c.id === id);
  if (!course) return;

  editingCourseId = id;
  document.getElementById('courseModalTitle').textContent = 'Edit Course';
  document.getElementById('saveCourseBtn').textContent = 'Save Changes';

  document.getElementById('courseTitle').value = course.title;
  document.getElementById('courseDescription').value = course.description;
  document.getElementById('courseInstructor').value = course.instructor;
  document.getElementById('courseCategory').value = course.category;
  document.getElementById('courseLevel').value = course.level;
  document.getElementById('courseDuration').value = course.duration;
  document.getElementById('courseLessons').value = course.lessons;
  document.getElementById('coursePrice').value = course.price;
  document.getElementById('courseImage').value = course.image;
  document.getElementById('courseTags').value = (course.tags || []).join(', ');

  openModal('courseModal');
}

function clearCourseForm() {
  ['courseTitle', 'courseDescription', 'courseInstructor', 'courseDuration', 'courseLessons', 'coursePrice', 'courseImage', 'courseTags'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('courseCategory').value = '';
  document.getElementById('courseLevel').value = 'Beginner';
}

async function saveCourse() {
  const title = document.getElementById('courseTitle').value.trim();
  const description = document.getElementById('courseDescription').value.trim();
  const instructor = document.getElementById('courseInstructor').value.trim();
  const category = document.getElementById('courseCategory').value;

  if (!title || !description || !instructor || !category) {
    showAdminToast('Please fill in all required fields', 'warning');
    return;
  }

  const courseData = {
    title,
    description,
    instructor,
    category,
    level: document.getElementById('courseLevel').value,
    duration: document.getElementById('courseDuration').value || '0 hours',
    lessons: document.getElementById('courseLessons').value || 0,
    price: document.getElementById('coursePrice').value || 0,
    image: document.getElementById('courseImage').value || '',
    tags: document.getElementById('courseTags').value.split(',').map(t => t.trim()).filter(Boolean)
  };

  try {
    if (editingCourseId) {
      await adminApi(`/courses/${editingCourseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
      });
      showAdminToast('Course updated successfully', 'success');
    } else {
      await adminApi('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
      showAdminToast('Course added successfully', 'success');
    }

    closeModal('courseModal');
    await loadCourses();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

async function deleteCourse(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"? This will also remove all related enrollments.`)) return;

  try {
    await adminApi(`/courses/${id}`, { method: 'DELETE' });
    showAdminToast(`Course deleted`, 'success');
    await loadCourses();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}
