import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faToggleOn, faToggleOff, faSearch, faPlus, faQuestionCircle, faClock, faBullseye, faCheckCircle, faCalendarAlt, faBookOpen, faAlignLeft, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';
import QuestionManagement from './QuestionManagement.jsx';

const PAGE_SIZE = 10;

const sanitizeText = (value) => value.replace(/[<>]/g, '').slice(0, 150);
const sanitizeDesc = (value) => value.replace(/[<>]/g, '').slice(0, 500);

function ExamManagement() {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', duration_minutes: 60, total_marks: 100, passing_marks: 50, start_time: '', end_time: '', course_id: '', instructor_id: '', is_published: false });
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef(null);

    const fetchExams = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/exams', { signal: abortRef.current.signal });
            if (res.data.success) setExams(res.data.data.exams);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load exams.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        let role = null;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                role = parsed.role;
            } catch {}
        }
        setUserRole(role);

        fetchExams();

        apiClient.get('/api/courses').then(res => {
            if (res.data.success) setCourses(res.data.data.courses);
        }).catch(() => {});

        if (role === 'admin') {
            apiClient.get('/api/admin/instructors').then(res => {
                if (res.data.success) setInstructors(res.data.data.instructors);
            }).catch(() => {});
        }

        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchExams]);

    const filteredExams = useMemo(() => {
        if (!search) return exams;
        const s = search.toLowerCase();
        return exams.filter(e => e.title.toLowerCase().includes(s) || (e.course_name && e.course_name.toLowerCase().includes(s)));
    }, [exams, search]);

    const paginatedExams = useMemo(() => filteredExams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredExams, page]);
    const totalPages = Math.ceil(filteredExams.length / PAGE_SIZE);
    useEffect(() => { setPage(0); }, [search]);

    const togglePublish = async (examId, currentStatus) => {
        try {
            await apiClient.put(`/api/exams/${examId}`, { is_published: !currentStatus });
            setExams(prev => prev.map(e => e.exam_id === examId ? { ...e, is_published: !currentStatus } : e));
        } catch {
            setError('Action failed.');
        }
    };

    const deleteExam = async (examId) => {
        if (!window.confirm('Delete this exam and all its questions?')) return;
        try {
            await apiClient.delete(`/api/exams/${examId}`);
            setExams(prev => prev.filter(e => e.exam_id !== examId));
        } catch {
            setError('Delete failed.');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title: sanitizeText(form.title),
                description: sanitizeDesc(form.description),
                duration_minutes: Math.max(1, Math.min(480, parseInt(form.duration_minutes) || 60)),
                total_marks: Math.max(1, Math.min(1000, parseInt(form.total_marks) || 100)),
                passing_marks: Math.max(1, Math.min(parseInt(form.total_marks) || 100, parseInt(form.passing_marks) || 50)),
                start_time: form.start_time,
                end_time: form.end_time,
                course_id: parseInt(form.course_id),
                is_published: form.is_published,
                instructor_id: userRole === 'admin' && form.instructor_id ? parseInt(form.instructor_id) : undefined,
            };
            const res = await apiClient.post('/api/exams', payload);
            if (res.data.success) {
                setExams(prev => [...prev, res.data.data.exam]);
                setShowAdd(false);
                setForm({ title: '', description: '', duration_minutes: 60, total_marks: 100, passing_marks: 50, start_time: '', end_time: '', course_id: '', instructor_id: '', is_published: false });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exam.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={adminStyles.centerState}><FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} /><span>Loading exams...</span></div>;
    }

    if (selectedExam) {
        return <QuestionManagement examId={selectedExam} onClose={() => { setSelectedExam(null); fetchExams(); }} />;
    }

    return (
        <div className={adminStyles.tableContainer}>
            {error && <div className={adminStyles.toast}>{error}</div>}
            <div className={adminStyles.toolbar}>
                <div className={adminStyles.searchWrap}>
                    <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                    <input type="text" placeholder="Search exams..." value={search} onChange={e => setSearch(sanitizeText(e.target.value))} className={adminStyles.searchInput} maxLength={100} />
                </div>
                <button className={adminStyles.addBtn} onClick={() => setShowAdd(!showAdd)}>
                    <FontAwesomeIcon icon={faPlus} /> Create Exam
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className={adminStyles.formCard}>
                    <h3 className={adminStyles.formTitle}>Create New Exam</h3>
                    <div className={adminStyles.formGroup}>
                        <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Exam Title</label>
                        <input placeholder="e.g. CS101 Midterm Exam" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={adminStyles.editInput} required maxLength={150} />
                    </div>
                    <div className={adminStyles.formGroup}>
                        <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Description</label>
                        <textarea placeholder="Brief description of the exam..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={adminStyles.editTextarea} rows={2} maxLength={500} />
                    </div>
                    <div className={adminStyles.formRow3}>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Course</label>
                            <select value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))} className={adminStyles.editSelect} required>
                                <option value="">Select course...</option>
                                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code} — {c.course_name}</option>)}
                            </select>
                        </div>
                        {userRole === 'admin' && (
                            <div className={adminStyles.formGroup}>
                                <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faChalkboardTeacher} /> Instructor</label>
                                <select value={form.instructor_id} onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))} className={adminStyles.editSelect} required>
                                    <option value="">Select instructor...</option>
                                    {instructors.map(i => <option key={i.instructor_id} value={i.instructor_id}>{i.first_name} {i.last_name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faClock} /> Duration (min)</label>
                            <input type="number" placeholder="60" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} className={adminStyles.editInput} min="1" max="480" />
                        </div>
                    </div>
                    <div className={adminStyles.formRow3}>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faBullseye} /> Total Marks</label>
                            <input type="number" placeholder="100" value={form.total_marks} onChange={e => setForm(p => ({ ...p, total_marks: parseInt(e.target.value) || 100 }))} className={adminStyles.editInput} min="1" max="1000" />
                        </div>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCheckCircle} /> Passing Marks</label>
                            <input type="number" placeholder="50" value={form.passing_marks} onChange={e => setForm(p => ({ ...p, passing_marks: parseInt(e.target.value) || 50 }))} className={adminStyles.editInput} min="1" max={form.total_marks || 100} />
                        </div>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCalendarAlt} /> Start Time</label>
                            <input type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className={adminStyles.editInput} required />
                        </div>
                    </div>
                    <div className={adminStyles.formRow3}>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCalendarAlt} /> End Time</label>
                            <input type="datetime-local" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className={adminStyles.editInput} required />
                        </div>
                    </div>
                    <label className={adminStyles.checkLabel}>
                        <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} /> Publish immediately after creation
                    </label>
                    <button type="submit" className={adminStyles.submitBtn} disabled={submitting}>{submitting ? 'Creating...' : 'Create Exam'}</button>
                </form>
            )}

            <div className={adminStyles.tableHeader}><h2>{filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}</h2></div>
            <div className={adminStyles.tableWrap}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Course</th>
                            <th>Duration</th>
                            <th>Marks</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedExams.map(e => (
                            <tr key={e.exam_id}>
                                <td>{e.title}</td>
                                <td>{e.course_name || '—'}</td>
                                <td>{e.duration_minutes} min</td>
                                <td>{e.passing_marks}/{e.total_marks}</td>
                                <td>
                                    <span className={e.is_published ? adminStyles.statusActive : adminStyles.statusInactive}>
                                        {e.is_published ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <div className={adminStyles.actions}>
                                        <button className={adminStyles.actionBtn} onClick={() => setSelectedExam(e.exam_id)} title="Manage Questions">
                                            <FontAwesomeIcon icon={faQuestionCircle} />
                                        </button>
                                        <button className={adminStyles.actionBtn} onClick={() => togglePublish(e.exam_id, e.is_published)} title="Toggle Publish">
                                            <FontAwesomeIcon icon={e.is_published ? faToggleOn : faToggleOff} />
                                        </button>
                                        <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteExam(e.exam_id)} title="Delete">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedExams.length === 0 && <tr><td colSpan={6} className={adminStyles.emptyRow}>No exams found.</td></tr>}
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

export default ExamManagement;