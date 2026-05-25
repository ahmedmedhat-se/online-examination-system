import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faPlus, faSearch, faHashtag, faAlignLeft, faClock, faBookOpen, faEdit, faSave, faTimes, faUserPlus, faUserMinus, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

const PAGE_SIZE = 10;

const INITIAL_FORM = { course_code: '', course_name: '', description: '', credit_hours: 3 };

function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState(null);
    const [showInstructorModal, setShowInstructorModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseInstructors, setCourseInstructors] = useState([]);
    const [assigningInstructor, setAssigningInstructor] = useState(false);
    const [allInstructors, setAllInstructors] = useState([]);
    const abortRef = useRef(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/v1/courses', { signal: abortRef.current.signal });
            if (res.data.success) setCourses(res.data.data.courses);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInstructors = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/v1/instructor');
            if (res.data.success) {
                setAllInstructors(res.data.data.instructors);
            }
        } catch (err) {
            console.error('Failed to fetch instructors');
            setAllInstructors([]);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchCourses, fetchInstructors]);

    const fetchCourseInstructors = async (courseId) => {
        try {
            const res = await apiClient.get(`/api/v1/courses/${courseId}`);
            if (res.data.success) {
                setCourseInstructors(res.data.data.instructors || []);
            }
        } catch (err) {
            setError('Failed to load course instructors');
        }
    };

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
        if (!form.course_code.trim() || !form.course_name.trim()) return;
        setSubmitting(true);
        try {
            const payload = {
                course_code: form.course_code.trim().toUpperCase().slice(0, 20),
                course_name: form.course_name.trim().slice(0, 100),
                description: form.description.trim().slice(0, 500) || null,
                credit_hours: Math.max(1, Math.min(6, parseInt(form.credit_hours) || 3)),
            };
            const res = await apiClient.post('/api/v1/courses', payload);
            if (res.data.success) {
                setCourses(prev => [...prev, res.data.data.course]);
                setShowForm(false);
                setForm({ ...INITIAL_FORM });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (courseId) => {
        if (!editingData.course_code.trim() || !editingData.course_name.trim()) return;
        setSubmitting(true);
        try {
            const payload = {
                course_code: editingData.course_code.trim().toUpperCase().slice(0, 20),
                course_name: editingData.course_name.trim().slice(0, 100),
                description: editingData.description?.trim().slice(0, 500) || null,
                credit_hours: Math.max(1, Math.min(6, parseInt(editingData.credit_hours) || 3)),
            };
            const res = await apiClient.put(`/api/v1/courses/${courseId}`, payload);
            if (res.data.success) {
                setCourses(prev => prev.map(c => c.course_id === courseId ? res.data.data.course : c));
                setEditingId(null);
                setEditingData(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update course.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCourse = async (courseId) => {
        if (!window.confirm('Delete this course? All associated exams will also be deleted.')) return;
        try {
            await apiClient.delete(`/api/v1/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c.course_id !== courseId));
        } catch {
            setError('Delete failed.');
        }
    };

    const openInstructorModal = async (course) => {
        setSelectedCourse(course);
        await fetchCourseInstructors(course.course_id);
        setShowInstructorModal(true);
    };

    const assignInstructor = async (instructorId) => {
        setAssigningInstructor(true);
        try {
            await apiClient.post(`/api/v1/courses/${selectedCourse.course_id}/instructors`, { instructor_id: instructorId });
            await fetchCourseInstructors(selectedCourse.course_id);
            await fetchInstructors();
        } catch (err) {
            setError('Failed to assign instructor');
        } finally {
            setAssigningInstructor(false);
        }
    };

    const removeInstructor = async (instructorId) => {
        if (!window.confirm('Remove this instructor from the course?')) return;
        try {
            await apiClient.delete(`/api/v1/courses/${selectedCourse.course_id}/instructors`, { data: { instructor_id: instructorId } });
            await fetchCourseInstructors(selectedCourse.course_id);
            await fetchInstructors();
        } catch (err) {
            setError('Failed to remove instructor');
        }
    };

    const availableInstructors = allInstructors.filter(inst =>
        !courseInstructors.some(ci => ci.instructor_id === inst.instructor_id)
    );

    if (loading) {
        return <div className={adminStyles.centerState}><FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} /><span>Loading courses...</span></div>;
    }

    return (
        <div className={adminStyles.tableContainer}>
            {error && <div className={adminStyles.toast}>{error}</div>}
            <div className={adminStyles.toolbar}>
                <div className={adminStyles.searchWrap}>
                    <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                    <input type="text" placeholder="Search courses by name or code..." value={search} onChange={e => setSearch(e.target.value.slice(0, 100))} className={adminStyles.searchInput} maxLength={100} />
                </div>
                <button className={adminStyles.addBtn} onClick={() => { setShowForm(!showForm); setForm({ ...INITIAL_FORM }); }}>
                    <FontAwesomeIcon icon={faPlus} /> Add Course
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={adminStyles.formCard}>
                    <h3 className={adminStyles.formTitle}><FontAwesomeIcon icon={faBookOpen} /> Create New Course</h3>

                    <div className={adminStyles.formRow3}>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faHashtag} /> Course Code</label>
                            <input
                                placeholder="e.g. CS101"
                                value={form.course_code}
                                onChange={e => setForm(p => ({ ...p, course_code: e.target.value }))}
                                className={adminStyles.editInput}
                                required
                                maxLength={20}
                            />
                        </div>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Course Name</label>
                            <input
                                placeholder="e.g. Introduction to Programming"
                                value={form.course_name}
                                onChange={e => setForm(p => ({ ...p, course_name: e.target.value }))}
                                className={adminStyles.editInput}
                                required
                                maxLength={100}
                            />
                        </div>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faClock} /> Credit Hours</label>
                            <input
                                type="number"
                                placeholder="3"
                                value={form.credit_hours}
                                onChange={e => setForm(p => ({ ...p, credit_hours: parseInt(e.target.value) || 3 }))}
                                className={adminStyles.editInput}
                                min="1"
                                max="6"
                            />
                        </div>
                    </div>

                    <div className={adminStyles.formGroup}>
                        <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Description</label>
                        <textarea
                            placeholder="Brief course description (optional)..."
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className={adminStyles.editTextarea}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className={adminStyles.submitBtn} disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Course'}
                        </button>
                        <button type="button" className={adminStyles.addBtn} style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </div>
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
                            <th>Instructors</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCourses.map(c => (
                            <tr key={c.course_id}>
                                {editingId === c.course_id ? (
                                    <>
                                        <td><input className={adminStyles.editInput} value={editingData.course_code} onChange={e => setEditingData({ ...editingData, course_code: e.target.value })} maxLength={20} /></td>
                                        <td><input className={adminStyles.editInput} value={editingData.course_name} onChange={e => setEditingData({ ...editingData, course_name: e.target.value })} maxLength={100} /></td>
                                        <td><input type="number" className={adminStyles.editInput} value={editingData.credit_hours} onChange={e => setEditingData({ ...editingData, credit_hours: parseInt(e.target.value) || 3 })} min="1" max="6" style={{ width: '80px' }} /></td>
                                        <td colSpan="2">
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className={adminStyles.submitBtn} onClick={() => handleUpdate(c.course_id)} disabled={submitting} style={{ padding: '6px 12px' }}>
                                                    <FontAwesomeIcon icon={faSave} /> Save
                                                </button>
                                                <button className={adminStyles.addBtn} onClick={() => { setEditingId(null); setEditingData(null); }} style={{ background: '#e2e8f0', color: '#475569', padding: '6px 12px' }}>
                                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td><span className={adminStyles.badge}>{c.course_code}</span></td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.course_name}</div>
                                            {c.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.description.slice(0, 80)}{c.description.length > 80 ? '...' : ''}</div>}
                                        </td>
                                        <td>{c.credit_hours}</td>
                                        <td>
                                            <button className={adminStyles.actionBtn} onClick={() => openInstructorModal(c)} title="Manage Instructors" style={{ width: 'auto', padding: '0 12px' }}>
                                                <FontAwesomeIcon icon={faChalkboardTeacher} /> Manage
                                            </button>
                                        </td>
                                        <td className={adminStyles.actions}>
                                            <button className={adminStyles.actionBtn} onClick={() => { setEditingId(c.course_id); setEditingData({ course_code: c.course_code, course_name: c.course_name, description: c.description || '', credit_hours: c.credit_hours }); }} title="Edit">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteCourse(c.course_id)} title="Delete">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {paginatedCourses.length === 0 && <tr><td colSpan={5} className={adminStyles.emptyRow}>No courses found.</td></tr>}
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

            {showInstructorModal && selectedCourse && (
                <div className={adminStyles.modalOverlay} onClick={() => setShowInstructorModal(false)}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader}>
                            <h3><FontAwesomeIcon icon={faChalkboardTeacher} /> Manage Instructors - {selectedCourse.course_name}</h3>
                            <button className={adminStyles.closeBtn} onClick={() => setShowInstructorModal(false)}>&times;</button>
                        </div>
                        <div className={adminStyles.modalBody}>
                            <div className={adminStyles.section}>
                                <h4>Current Instructors</h4>
                                {courseInstructors.length === 0 ? (
                                    <p>No instructors assigned</p>
                                ) : (
                                    <ul className={adminStyles.instructorList}>
                                        {courseInstructors.map(inst => (
                                            <li key={inst.instructor_id}>
                                                <span><strong>{inst.first_name} {inst.last_name}</strong> ({inst.email})</span>
                                                <button onClick={() => removeInstructor(inst.instructor_id)} className={adminStyles.removeBtn}>
                                                    <FontAwesomeIcon icon={faUserMinus} /> Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className={adminStyles.section}>
                                <h4>Assign New Instructor</h4>
                                {availableInstructors.length === 0 ? (
                                    <p>No available instructors</p>
                                ) : (
                                    <div className={adminStyles.assignForm}>
                                        <select className={adminStyles.editSelect} id="instructorSelect">
                                            <option value="">Select instructor</option>
                                            {availableInstructors.map(inst => (
                                                <option key={inst.instructor_id} value={inst.instructor_id}>
                                                    {inst.first_name} {inst.last_name} ({inst.email})
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={() => {
                                            const select = document.getElementById('instructorSelect');
                                            if (select.value) {
                                                assignInstructor(parseInt(select.value));
                                                select.value = '';
                                            }
                                        }} className={adminStyles.submitBtn} disabled={assigningInstructor}>
                                            <FontAwesomeIcon icon={faUserPlus} /> Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseManagement;