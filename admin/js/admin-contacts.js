// ===== ADMIN CONTACTS SCRIPT =====
let allContacts = [];

document.addEventListener('DOMContentLoaded', async () => {
  const admin = requireAdmin();
  if (!admin) return;

  await loadContacts();
});

async function loadContacts() {
  try {
    allContacts = await adminApi('/contacts');
    // Sort from newest to oldest
    allContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderContacts();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

function renderContacts() {
  const tbody = document.getElementById('contactsTableBody');
  document.getElementById('contactCount').textContent = allContacts.length;

  if (allContacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">No messages found</td></tr>';
    return;
  }

  tbody.innerHTML = allContacts.map(contact => {
    const preview = contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message;
    
    return `
      <tr>
        <td>
          <div style="font-weight: 600;">${contact.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-light);">${contact.email}</div>
        </td>
        <td><span class="table-badge" style="background: rgba(108,92,231,0.1); color: var(--primary);">${contact.subject}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-light);">
          ${preview}
        </td>
        <td style="font-size: 0.85rem; color: var(--text-light);">${formatDate(contact.createdAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-icon" onclick="viewMessage('${contact.id}')" title="View Full Message">👁️</button>
            <button class="btn btn-danger btn-icon" onclick="deleteMessage('${contact.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewMessage(id) {
  const contact = allContacts.find(c => c.id === id);
  if (!contact) return;

  document.getElementById('msgName').textContent = contact.name;
  
  const emailEl = document.getElementById('msgEmail');
  emailEl.textContent = contact.email;
  emailEl.href = 'mailto:' + contact.email;
  
  document.getElementById('msgSubject').textContent = contact.subject;
  document.getElementById('msgContent').textContent = contact.message;

  openModal('messageModal');
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    await adminApi(`/contacts/${id}`, { method: 'DELETE' });
    showAdminToast('Message deleted successfully', 'success');
    await loadContacts();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}
