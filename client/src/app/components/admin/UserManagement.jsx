import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff, faTrash, faEdit, faSave, faTimes, faChevronDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

const ROLES = ['student', 'instructor', 'admin'];

function UserManagement({ onStatsChange }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
    const [actionLoading, setActionLoading] = useState(null);
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
        if (!window.confirm('Permanently delete this user?')) return;
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
            {error && (
                <div className={adminStyles.toast}>
                    {error}
                </div>
            )}
            <div className={adminStyles.tableHeader}>
                <h2>All Users ({users.length})</h2>
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
                        {users.map(u => (
                            <tr key={u.user_id}>
                                <td>
                                    {editingId === u.user_id ? (
                                        <div className={adminStyles.editRow}>
                                            <input
                                                value={editForm.first_name}
                                                onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))}
                                                className={adminStyles.editInput}
                                            />
                                            <input
                                                value={editForm.last_name}
                                                onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))}
                                                className={adminStyles.editInput}
                                            />
                                        </div>
                                    ) : (
                                        `${u.first_name} ${u.last_name}`
                                    )}
                                </td>
                                <td>
                                    {editingId === u.user_id ? (
                                        <input
                                            value={editForm.email}
                                            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                            className={adminStyles.editInput}
                                            style={{ width: '100%' }}
                                        />
                                    ) : (
                                        u.email
                                    )}
                                </td>
                                <td>
                                    {editingId === u.user_id ? (
                                        <div className={adminStyles.selectWrapper}>
                                            <select
                                                value={editForm.role}
                                                onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                                                className={adminStyles.editSelect}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <FontAwesomeIcon icon={faChevronDown} className={adminStyles.selectIcon} />
                                        </div>
                                    ) : (
                                        <span className={`${adminStyles.badge} ${roleBadgeClass(u.role)}`}>{u.role}</span>
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
                                                <button
                                                    className={adminStyles.actionBtn}
                                                    onClick={() => saveEdit(u.user_id)}
                                                    disabled={actionLoading === u.user_id}
                                                    title="Save"
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button
                                                    className={adminStyles.actionBtn}
                                                    onClick={cancelEdit}
                                                    title="Cancel"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className={adminStyles.actionBtn}
                                                    onClick={() => startEdit(u)}
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    className={adminStyles.actionBtn}
                                                    onClick={() => toggleStatus(u.user_id, u.is_active)}
                                                    disabled={actionLoading === u.user_id}
                                                    title="Toggle Status"
                                                >
                                                    <FontAwesomeIcon icon={u.is_active ? faToggleOn : faToggleOff} />
                                                </button>
                                                <button
                                                    className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`}
                                                    onClick={() => deleteUser(u.user_id)}
                                                    disabled={actionLoading === u.user_id}
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className={adminStyles.emptyRow}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserManagement;