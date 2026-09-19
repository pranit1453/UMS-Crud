const API_BASE_URL = (window.location.port === '8080' || window.location.port === '80')
    ? ''
    : 'http://localhost:5000';

let allUsers = [];

// Initialize Dashboard on DOM load
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    fetchUsers();
    
    // Periodically check health every 15s
    setInterval(checkHealth, 15000);
});

// Check API Health
async function checkHealth() {
    const statusEl = document.getElementById('connectionStatus');
    const statHealthEl = document.getElementById('statApiHealth');

    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            statusEl.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>Connected to Backend`;
            statHealthEl.textContent = 'Healthy (UP)';
            statHealthEl.className = 'text-lg font-bold mt-1 text-emerald-400';
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        statusEl.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20';
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-400 mr-2"></span>Disconnected`;
        statHealthEl.textContent = 'Offline';
        statHealthEl.className = 'text-lg font-bold mt-1 text-red-400';
    }
}

// Fetch All Users (GET /api/users)
async function fetchUsers() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch users');
        }

        allUsers = result.data || [];
        document.getElementById('statTotalUsers').textContent = allUsers.length;
        renderUsers(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        showToast(error.message || 'Cannot connect to backend server', 'error');
        renderUsers([]);
    } finally {
        showLoading(false);
    }
}

// Render Users in Table
function renderUsers(users) {
    const tableBody = document.getElementById('userTableBody');
    const emptyState = document.getElementById('emptyState');

    tableBody.innerHTML = '';

    if (users.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    users.forEach(user => {
        const fullName = `${user.firstName} ${user.lastName}`;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        const formattedDate = new Date(user.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-800/40 transition-colors group';
        row.innerHTML = `
            <td class="py-4 px-6 text-slate-400 font-mono text-xs">#${user.id}</td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 font-semibold text-xs flex items-center justify-center border border-indigo-500/30">
                        ${initials}
                    </div>
                    <div>
                        <div class="font-medium text-slate-100">${escapeHtml(fullName)}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6 text-slate-300">${escapeHtml(user.email)}</td>
            <td class="py-4 px-6 text-slate-400">${user.phone ? escapeHtml(user.phone) : '<span class="text-slate-600 text-xs">N/A</span>'}</td>
            <td class="py-4 px-6 text-slate-400 text-xs">${formattedDate}</td>
            <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="openViewModal(${user.id})" class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors" title="View Details">
                        <i class="fa-solid fa-eye text-sm"></i>
                    </button>
                    <button onclick="openEditModal(${user.id})" class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors" title="Edit User">
                        <i class="fa-solid fa-pen-to-square text-sm"></i>
                    </button>
                    <button onclick="openDeleteModal(${user.id}, '${escapeHtml(fullName).replace(/'/g, "\\'")}')" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors" title="Delete User">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Live Search Filter
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) {
        renderUsers(allUsers);
        return;
    }

    const filtered = allUsers.filter(u => {
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        return name.includes(query) || u.email.toLowerCase().includes(query);
    });

    renderUsers(filtered);
}

// Handle Create User (POST /api/users)
async function handleCreateUser(e) {
    e.preventDefault();

    const payload = {
        firstName: document.getElementById('createFirstName').value,
        lastName: document.getElementById('createLastName').value,
        email: document.getElementById('createEmail').value,
        phone: document.getElementById('createPhone').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to create user');
        }

        showToast('User created successfully!', 'success');
        closeCreateModal();
        document.getElementById('createForm').reset();
        fetchUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Open View User Details Modal (GET /api/users/<id>)
async function openViewModal(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to load user details');
        }

        const u = result.data;
        const fullName = `${u.firstName} ${u.lastName}`;
        const initials = `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();

        document.getElementById('viewAvatar').textContent = initials;
        document.getElementById('viewFullName').textContent = fullName;
        document.getElementById('viewUserIdBadge').textContent = `ID: #${u.id}`;
        document.getElementById('viewEmail').textContent = u.email;
        document.getElementById('viewPhone').textContent = u.phone || 'N/A';
        document.getElementById('viewCreatedAt').textContent = new Date(u.createdAt).toLocaleString();
        document.getElementById('viewUpdatedAt').textContent = new Date(u.updatedAt).toLocaleString();

        document.getElementById('viewModal').classList.remove('hidden');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function closeViewModal() {
    document.getElementById('viewModal').classList.add('hidden');
}

// Open Edit User Modal (GET /api/users/<id>)
async function openEditModal(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch user data');
        }

        const u = result.data;
        document.getElementById('editUserId').value = u.id;
        document.getElementById('editFirstName').value = u.firstName;
        document.getElementById('editLastName').value = u.lastName;
        document.getElementById('editEmail').value = u.email;
        document.getElementById('editPhone').value = u.phone || '';

        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// Handle Update User (PUT /api/users/<id>)
async function handleUpdateUser(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const payload = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update user');
        }

        showToast('User updated successfully!', 'success');
        closeEditModal();
        fetchUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Open Delete Confirmation Modal
function openDeleteModal(userId, name) {
    document.getElementById('deleteUserId').value = userId;
    document.getElementById('deleteUserName').textContent = name;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Confirm Delete User (DELETE /api/users/<id>)
async function confirmDeleteUser() {
    const userId = document.getElementById('deleteUserId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete user');
        }

        showToast('User deleted successfully', 'success');
        closeDeleteModal();
        fetchUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Open / Close Create Modal
function openCreateModal() {
    document.getElementById('createForm').reset();
    document.getElementById('createModal').classList.remove('hidden');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.add('hidden');
}

// UI State Helpers
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const tableBody = document.getElementById('userTableBody');

    if (show) {
        loadingState.classList.remove('hidden');
        if (allUsers.length === 0) tableBody.innerHTML = '';
    } else {
        loadingState.classList.add('hidden');
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const bgColors = {
        success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
        error: 'bg-red-950/90 border-red-500/50 text-red-200',
        info: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
    };

    const icons = {
        success: 'fa-circle-check text-emerald-400',
        error: 'fa-circle-xmark text-red-400',
        info: 'fa-circle-info text-indigo-400'
    };

    toast.className = `pointer-events-auto flex items-center space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-xl text-xs font-medium ${bgColors[type] || bgColors.info} toast-enter`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
        <span class="flex-1">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Helper to sanitize HTML inputs
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
