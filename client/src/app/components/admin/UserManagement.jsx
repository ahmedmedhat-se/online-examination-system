import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff, faTrash, faEdit, faSave, faTimes, faChevronDown, faSpinner, faSearch, faFilter, faUserPlus, faUserGraduate, faChalkboardTeacher, faUserShield } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

const ROLES = ['student', 'instructor', 'admin'];
const ROLE_FILTERS = ['all', 'student', 'instructor', 'admin'];
const STATUS_FILTERS = ['all', 'active', 'inactive'];
const PAGE_SIZE = 10;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function UserManagement({ onStatsChange }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'student' });
    const [addSubmitting, setAddSubmitting] = useState(false);
    const abortRef = useRef(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/admin/users', { signal: abortRef.current.signal });
            if (res.data.success) setUsers(res.data.data.users);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const searchLower = search.toLowerCase();
            const matchesSearch = !search ||
                u.first_name.toLowerCase().includes(searchLower) ||
                u.last_name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower);
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && u.is_active) ||
                (statusFilter === 'inactive' && !u.is_active);
            return matchesSearch && matchesRole && matchesStatus;
        }).sort((a, b) => a.first_name.localeCompare(b.first_name));
    }, [users, search, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    }, [filteredUsers, page]);

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

    useEffect(() => { setPage(0); }, [search, roleFilter, statusFilter]);

    const toggleStatus = useCallback(async (userId, currentStatus) => {
        setActionLoading(userId);
        try {
            await apiClient.put(`/api/admin/users/${userId}`, { is_active: !currentStatus });
            setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch {
            setError('Action failed.');
        } finally {
            setActionLoading(null);
            if (onStatsChange) onStatsChange();
        }
    }, [onStatsChange]);

    const deleteUser = useCallback(async (userId) => {
        if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
        setActionLoading(userId);
        try {
            await apiClient.delete(`/api/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.user_id !== userId));
        } catch {
            setError('Delete failed.');
        } finally {
            setActionLoading(null);
            if (onStatsChange) onStatsChange();
        }
    }, [onStatsChange]);

    const startEdit = (u) => {
        setEditingId(u.user_id);
        setEditForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ first_name: '', last_name: '', email: '', role: '' });
    };

    const saveEdit = async (userId) => {
        setActionLoading(userId);
        try {
            await apiClient.put(`/api/admin/users/${userId}`, editForm);
            setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, ...editForm } : u));
            cancelEdit();
        } catch {
            setError('Update failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddSubmitting(true);
        try {
            await apiClient.post('/api/auth/register', addForm);
            setShowAddForm(false);
            setAddForm({ first_name: '', last_name: '', email: '', password: '', role: 'student' });
            fetchUsers();
            if (onStatsChange) onStatsChange();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setAddSubmitting(false);
        }
    };

    const roleIcon = (role) => {
        if (role === 'admin') return faUserShield;
        if (role === 'instructor') return faChalkboardTeacher;
        return faUserGraduate;
    };

    const roleBadgeClass = (role) => {
        if (role === 'admin') return adminStyles.roleAdmin;
        if (role === 'instructor') return adminStyles.roleInstructor;
        return adminStyles.roleStudent;
    };

    if (loading) {
        return (
            <div className={adminStyles.centerState}>
                <FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} />
                <span>Loading users...</span>
            </div>
        );
    }

    return (
        <div className={adminStyles.tableContainer}>
            {error && <div className={adminStyles.toast}>{error}</div>}

            <div className={adminStyles.toolbar}>
                <div className={adminStyles.searchWrap}>
                    <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={adminStyles.searchInput}
                        maxLength={100}
                    />
                </div>
                <div className={adminStyles.filterGroup}>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={adminStyles.filterSelect}>
                        {ROLE_FILTERS.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={adminStyles.filterSelect}>
                        {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
                    </select>
                </div>
                <button className={adminStyles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
                    <FontAwesomeIcon icon={faUserPlus} /> Add User
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddUser} className={adminStyles.formCard}>
                    <div className={adminStyles.formRow}>
                        <input placeholder="First Name" value={addForm.first_name} onChange={e => setAddForm(p => ({ ...p, first_name: e.target.value }))} className={adminStyles.editInput} required maxLength={50} />
                        <input placeholder="Last Name" value={addForm.last_name} onChange={e => setAddForm(p => ({ ...p, last_name: e.target.value }))} className={adminStyles.editInput} required maxLength={50} />
                        <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className={adminStyles.editInput} required maxLength={100} />
                        <input type="password" placeholder="Password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className={adminStyles.editInput} required minLength={8} maxLength={128} />
                        <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} className={adminStyles.editSelect}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button type="submit" className={adminStyles.submitBtn} disabled={addSubmitting}>
                        {addSubmitting ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            )}

            <div className={adminStyles.tableHeader}>
                <h2>{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</h2>
            </div>

            <div className={adminStyles.tableWrap}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(u => (
                            <tr key={u.user_id}>
                                <td>
                                    {editingId === u.user_id ? (
                                        <div className={adminStyles.editRow}>
                                            <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className={adminStyles.editInput} maxLength={50} />
                                            <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className={adminStyles.editInput} maxLength={50} />
                                        </div>
                                    ) : (
                                        <>{u.first_name} {u.last_name}</>
                                    )}
                                </td>
                                <td>
                                    {editingId === u.user_id ? (
                                        <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className={adminStyles.editInput} style={{ width: '100%' }} maxLength={100} />
                                    ) : (
                                        u.email
                                    )}
                                </td>
                                <td>
                                    {editingId === u.user_id ? (
                                        <div className={adminStyles.selectWrapper}>
                                            <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className={adminStyles.editSelect}>
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <FontAwesomeIcon icon={faChevronDown} className={adminStyles.selectIcon} />
                                        </div>
                                    ) : (
                                        <span className={`${adminStyles.badge} ${roleBadgeClass(u.role)}`}>
                                            <FontAwesomeIcon icon={roleIcon(u.role)} className={adminStyles.badgeIcon} /> {u.role}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={u.is_active ? adminStyles.statusActive : adminStyles.statusInactive}>
                                        {u.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className={adminStyles.actions}>
                                        {editingId === u.user_id ? (
                                            <>
                                                <button className={adminStyles.actionBtn} onClick={() => saveEdit(u.user_id)} disabled={actionLoading === u.user_id} title="Save">
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button className={adminStyles.actionBtn} onClick={cancelEdit} title="Cancel">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className={adminStyles.actionBtn} onClick={() => startEdit(u)} title="Edit">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button className={adminStyles.actionBtn} onClick={() => toggleStatus(u.user_id, u.is_active)} disabled={actionLoading === u.user_id} title="Toggle Status">
                                                    <FontAwesomeIcon icon={u.is_active ? faToggleOn : faToggleOff} />
                                                </button>
                                                <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteUser(u.user_id)} disabled={actionLoading === u.user_id} title="Delete">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <tr><td colSpan={5} className={adminStyles.emptyRow}>No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={adminStyles.pagination}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={adminStyles.pageBtn}>
                        Previous
                    </button>
                    <span className={adminStyles.pageInfo}>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={adminStyles.pageBtn}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserManagement;