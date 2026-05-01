import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

const PAGE_SIZE = 10;

function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ course_code: '', course_name: '', description: '', credit_hours: 3 });
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/courses', { signal: abortRef.current.signal });
            if (res.data.success) setCourses(res.data.data.courses);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchCourses]);

    const filteredCourses = useMemo(() => {
        if (!search) return courses;
        const s = search.toLowerCase();
        return courses.filter(c => c.course_name.toLowerCase().includes(s) || c.course_code.toLowerCase().includes(s));
    }, [courses, search]);

    const paginatedCourses = useMemo(() => filteredCourses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredCourses, page]);
    const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);
    useEffect(() => { setPage(0); }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiClient.post('/api/courses', form);
            if (res.data.success) {
                setCourses(prev => [...prev, res.data.data.course]);
                setShowForm(false);
                setForm({ course_code: '', course_name: '', description: '', credit_hours: 3 });
            }
        } catch {
            setError('Failed to create course.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCourse = async (courseId) => {
        if (!window.confirm('Delete this course? All associated exams will also be deleted.')) return;
        try {
            await apiClient.delete(`/api/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c.course_id !== courseId));
        } catch {
            setError('Delete failed.');
        }
    };

    if (loading) {
        return <div className={adminStyles.centerState}><FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} /><span>Loading courses...</span></div>;
    }

    return (
        <div className={adminStyles.tableContainer}>
            {error && <div className={adminStyles.toast}>{error}</div>}
            <div className={adminStyles.toolbar}>
                <div className={adminStyles.searchWrap}>
                    <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                    <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className={adminStyles.searchInput} maxLength={100} />
                </div>
                <button className={adminStyles.addBtn} onClick={() => setShowForm(!showForm)}>
                    <FontAwesomeIcon icon={faPlus} /> Add Course
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={adminStyles.formCard}>
                    <div className={adminStyles.formRow}>
                        <input placeholder="Course Code" value={form.course_code} onChange={e => setForm(p => ({ ...p, course_code: e.target.value }))} className={adminStyles.editInput} required maxLength={20} />
                        <input placeholder="Course Name" value={form.course_name} onChange={e => setForm(p => ({ ...p, course_name: e.target.value }))} className={adminStyles.editInput} required maxLength={100} />
                        <input type="number" min="1" max="6" placeholder="Credit Hours" value={form.credit_hours} onChange={e => setForm(p => ({ ...p, credit_hours: parseInt(e.target.value) || 3 }))} className={adminStyles.editInput} />
                    </div>
                    <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={adminStyles.editTextarea} rows={2} maxLength={500} />
                    <button type="submit" className={adminStyles.submitBtn} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Course'}
                    </button>
                </form>
            )}

            <div className={adminStyles.tableHeader}><h2>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</h2></div>
            <div className={adminStyles.tableWrap}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Credits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCourses.map(c => (
                            <tr key={c.course_id}>
                                <td><span className={adminStyles.badge}>{c.course_code}</span></td>
                                <td>{c.course_name}</td>
                                <td>{c.credit_hours}</td>
                                <td>
                                    <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteCourse(c.course_id)} title="Delete">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedCourses.length === 0 && <tr><td colSpan={4} className={adminStyles.emptyRow}>No courses found.</td></tr>}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className={adminStyles.pagination}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={adminStyles.pageBtn}>Previous</button>
                    <span className={adminStyles.pageInfo}>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={adminStyles.pageBtn}>Next</button>
                </div>
            )}
        </div>
    );
}

export default CourseManagement;