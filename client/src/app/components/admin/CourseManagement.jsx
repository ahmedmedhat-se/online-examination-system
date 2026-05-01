import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        if (!window.confirm('Delete this course?')) return;
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
            <div className={adminStyles.tableHeader}>
                <h2>Courses ({courses.length})</h2>
                <button className={adminStyles.addBtn} onClick={() => setShowForm(!showForm)}>
                    <FontAwesomeIcon icon={faPlus} /> Add Course
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={adminStyles.formCard}>
                    <div className={adminStyles.formRow}>
                        <input placeholder="Course Code" value={form.course_code} onChange={e => setForm(p => ({ ...p, course_code: e.target.value }))} className={adminStyles.editInput} required />
                        <input placeholder="Course Name" value={form.course_name} onChange={e => setForm(p => ({ ...p, course_name: e.target.value }))} className={adminStyles.editInput} required />
                        <input type="number" min="1" max="6" placeholder="Credit Hours" value={form.credit_hours} onChange={e => setForm(p => ({ ...p, credit_hours: parseInt(e.target.value) || 3 }))} className={adminStyles.editInput} />
                    </div>
                    <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={adminStyles.editTextarea} rows={2} />
                    <button type="submit" className={adminStyles.submitBtn} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Course'}
                    </button>
                </form>
            )}

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
                        {courses.map(c => (
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
                        {courses.length === 0 && <tr><td colSpan={4} className={adminStyles.emptyRow}>No courses found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CourseManagement;