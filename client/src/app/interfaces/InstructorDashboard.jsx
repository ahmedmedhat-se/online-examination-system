import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faFileAlt, faSpinner, faSyncAlt, faClock, faClipboardCheck, faQuestionCircle, faPlus, faEdit, faTrash, faCheck, faUserGraduate, faAlignLeft, faBullseye, faCheckCircle, faCalendarAlt, faLayerGroup, faListOl, faSave, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';
import adminStyles from '../styles/AdminDashboard.module.css';

const QUESTION_TYPES = ['MCQ', 'SHORT_ANSWER'];
const INITIAL_EXAM_FORM = { title: '', description: '', duration_minutes: 60, total_marks: 100, passing_marks: 40, start_time: '', end_time: '', course_id: '', is_published: false };
const INITIAL_QUESTION_FORM = { question_text: '', question_type: 'MCQ', options: ['', '', '', ''], correct_answer: '', marks: 1 };

function InstructorDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalExams: 0, totalCourses: 0, published: 0, drafts: 0 });
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const abortRef = useRef(null);

    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showExamModal, setShowExamModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [examForm, setExamForm] = useState({ ...INITIAL_EXAM_FORM });
    const [examSubmitting, setExamSubmitting] = useState(false);

    const [selectedExam, setSelectedExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionForm, setQuestionForm] = useState({ ...INITIAL_QUESTION_FORM });
    const [questionSubmitting, setQuestionSubmitting] = useState(false);

    const [students, setStudents] = useState([]);
    const [showStudentList, setShowStudentList] = useState(false);
    const [selectedExamForStudents, setSelectedExamForStudents] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const [examsRes, coursesRes] = await Promise.all([
                apiClient.get('/api/instructor/exams', { signal: abortRef.current.signal }),
                apiClient.get('/api/instructor/courses', { signal: abortRef.current.signal }),
            ]);
            const examsData = examsRes.data.success ? examsRes.data.data.exams || [] : [];
            const coursesData = coursesRes.data.success ? coursesRes.data.data.courses || [] : [];
            setExams(examsData);
            setCourses(coursesData);
            setStats({
                totalExams: examsData.length,
                totalCourses: coursesData.length,
                published: examsData.filter(e => e.is_published).length,
                drafts: examsData.filter(e => !e.is_published).length,
            });
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudents = async (examId) => {
        if (!examId) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/exams/${examId}/students`);
            if (response.data.success) {
                setStudents(response.data.data.students || []);
                setShowStudentList(true);
            }
        } catch {
            setError('Failed to load students list');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async (examId) => {
        if (!examId) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/questions/exam/${examId}`);
            if (response.data.success) {
                setQuestions(response.data.data.questions || []);
                setSelectedExam(exams.find(e => e.exam_id === parseInt(examId)) || null);
            }
        } catch {
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setExamSubmitting(true);
        try {
            const payload = {
                title: examForm.title.trim().slice(0, 150),
                description: examForm.description.trim().slice(0, 500) || null,
                duration_minutes: Math.max(1, Math.min(480, parseInt(examForm.duration_minutes) || 60)),
                total_marks: Math.max(1, Math.min(1000, parseInt(examForm.total_marks) || 100)),
                passing_marks: Math.max(1, Math.min(parseInt(examForm.total_marks) || 100, parseInt(examForm.passing_marks) || 40)),
                start_time: examForm.start_time || null,
                end_time: examForm.end_time || null,
                course_id: examForm.course_id ? parseInt(examForm.course_id) : null,
                is_published: examForm.is_published,
            };
            await apiClient.post('/api/exams', payload);
            setSuccess('Exam created successfully!');
            setShowExamModal(false);
            setExamForm({ ...INITIAL_EXAM_FORM });
            setEditingExam(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exam');
        } finally {
            setExamSubmitting(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const handleUpdateExam = async (e) => {
        e.preventDefault();
        if (!editingExam) return;
        setExamSubmitting(true);
        try {
            const payload = {
                title: examForm.title.trim().slice(0, 150),
                description: examForm.description.trim().slice(0, 500) || null,
                duration_minutes: Math.max(1, Math.min(480, parseInt(examForm.duration_minutes) || 60)),
                total_marks: Math.max(1, Math.min(1000, parseInt(examForm.total_marks) || 100)),
                passing_marks: Math.max(1, Math.min(parseInt(examForm.total_marks) || 100, parseInt(examForm.passing_marks) || 40)),
                start_time: examForm.start_time || null,
                end_time: examForm.end_time || null,
                course_id: examForm.course_id ? parseInt(examForm.course_id) : null,
                is_published: examForm.is_published,
            };
            await apiClient.put(`/api/exams/${editingExam.exam_id}`, payload);
            setSuccess('Exam updated successfully!');
            setShowExamModal(false);
            setExamForm({ ...INITIAL_EXAM_FORM });
            setEditingExam(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update exam');
        } finally {
            setExamSubmitting(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Delete this exam and all its questions? This cannot be undone.')) return;
        setLoading(true);
        try {
            await apiClient.delete(`/api/exams/${examId}`);
            setSuccess('Exam deleted successfully');
            if (selectedExam?.exam_id === examId) { setSelectedExam(null); setQuestions([]); }
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete exam');
        } finally {
            setLoading(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        if (!selectedExam) return;
        setQuestionSubmitting(true);
        try {
            const payload = {
                exam_id: selectedExam.exam_id,
                question_text: questionForm.question_text.trim().slice(0, 1000),
                question_type: questionForm.question_type,
                options: questionForm.question_type === 'MCQ' ? questionForm.options.map(o => o.trim()).filter(o => o) : null,
                correct_answer: questionForm.correct_answer.trim().slice(0, 500),
                marks: Math.max(1, Math.min(100, parseInt(questionForm.marks) || 1)),
                question_order: questions.length + 1,
            };
            await apiClient.post('/api/questions', payload);
            setSuccess('Question added successfully!');
            setShowQuestionModal(false);
            setQuestionForm({ ...INITIAL_QUESTION_FORM });
            setEditingQuestion(null);
            fetchQuestions(selectedExam.exam_id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add question');
        } finally {
            setQuestionSubmitting(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        if (!editingQuestion) return;
        setQuestionSubmitting(true);
        try {
            const payload = {
                question_text: questionForm.question_text.trim().slice(0, 1000),
                question_type: questionForm.question_type,
                options: questionForm.question_type === 'MCQ' ? questionForm.options.map(o => o.trim()).filter(o => o) : null,
                correct_answer: questionForm.correct_answer.trim().slice(0, 500),
                marks: Math.max(1, Math.min(100, parseInt(questionForm.marks) || 1)),
                question_order: editingQuestion.question_order,
            };
            await apiClient.put(`/api/questions/${editingQuestion.question_id}`, payload);
            setSuccess('Question updated successfully!');
            setShowQuestionModal(false);
            setQuestionForm({ ...INITIAL_QUESTION_FORM });
            setEditingQuestion(null);
            fetchQuestions(selectedExam.exam_id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update question');
        } finally {
            setQuestionSubmitting(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Delete this question?')) return;
        setLoading(true);
        try {
            await apiClient.delete(`/api/questions/${questionId}`);
            setSuccess('Question deleted successfully');
            fetchQuestions(selectedExam.exam_id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete question');
        } finally {
            setLoading(false);
            setTimeout(() => { setSuccess(''); setError(''); }, 3000);
        }
    };

    const openEditExam = (exam) => {
        setEditingExam(exam);
        setExamForm({
            title: exam.title || '',
            description: exam.description || '',
            duration_minutes: exam.duration_minutes || 60,
            total_marks: exam.total_marks || 100,
            passing_marks: exam.passing_marks || 40,
            start_time: exam.start_time ? exam.start_time.slice(0, 16) : '',
            end_time: exam.end_time ? exam.end_time.slice(0, 16) : '',
            course_id: exam.course_id || '',
            is_published: exam.is_published || false,
        });
        setShowExamModal(true);
    };

    const openEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionForm({
            question_text: question.question_text || '',
            question_type: question.question_type || 'MCQ',
            options: question.options?.length ? question.options : ['', '', '', ''],
            correct_answer: question.correct_answer || '',
            marks: question.marks || 1,
        });
        setShowQuestionModal(true);
    };

    const updateOption = (index, value) => {
        setQuestionForm(prev => {
            const opts = [...prev.options];
            opts[index] = value;
            return { ...prev, options: opts };
        });
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) { try { setUser(JSON.parse(stored)); } catch { setUser(null); } }
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'exams', 'students'].includes(tab)) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'overview' ? {} : { tab });
    };

    const firstName = user?.first_name || 'Instructor';

    if (loading && exams.length === 0) {
        return (
            <div className={adminStyles.centerState}>
                <FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} />
                <span>Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Welcome, Dr. {firstName}!</h1>
                <p className={styles.subtitle}>
                    Manage your exams and track student progress &mdash;{' '}
                    <button className={adminStyles.refreshBtn} onClick={fetchData}>
                        <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Refresh
                    </button>
                </p>
            </div>

            {error && <div className={adminStyles.toast}>{error}</div>}
            {success && <div className={adminStyles.toast} style={{ background: 'linear-gradient(135deg, #f0fdf4, #f5fff5)', color: '#15803d', borderColor: '#bbf7d0' }}>{success}</div>}

            <div className={adminStyles.tabs}>
                {[
                    { key: 'overview', label: 'Overview', icon: faClipboardCheck },
                    { key: 'exams', label: 'Exams', icon: faFileAlt },
                    { key: 'students', label: 'Students', icon: faUserGraduate },
                ].map(tab => (
                    <button key={tab.key} className={`${adminStyles.tab} ${activeTab === tab.key ? adminStyles.tabActive : ''}`} onClick={() => handleTabChange(tab.key)}>
                        <FontAwesomeIcon icon={tab.icon} /><span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className={styles.statsGrid}>
                    {[
                        { icon: faFileAlt, value: stats.totalExams, label: 'Total Exams', cls: styles.statIconBlue },
                        { icon: faCheck, value: stats.published, label: 'Published', cls: styles.statIconGreen },
                        { icon: faBookOpen, value: stats.totalCourses, label: 'Courses', cls: styles.statIconPurple },
                        { icon: faClock, value: stats.drafts, label: 'Drafts', cls: styles.statIconAmber },
                    ].map((s, i) => (
                        <div key={i} className={styles.statCard}>
                            <div className={`${styles.statIcon} ${s.cls}`}><FontAwesomeIcon icon={s.icon} /></div>
                            <div className={styles.statContent}><span className={styles.statValue}>{s.value}</span><span className={styles.statLabel}>{s.label}</span></div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'exams' && (
                <div className={adminStyles.tableContainer}>
                    <div className={adminStyles.toolbar}>
                        <div className={adminStyles.searchWrap}>
                            <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                            <input type="text" placeholder="Search exams..." className={adminStyles.searchInput} maxLength={100} />
                        </div>
                        <button className={adminStyles.addBtn} onClick={() => { setEditingExam(null); setExamForm({ ...INITIAL_EXAM_FORM }); setShowExamModal(true); }}>
                            <FontAwesomeIcon icon={faPlus} /> Create Exam
                        </button>
                    </div>

                    {selectedExam ? (
                        <div>
                            <div className={adminStyles.tableHeader}>
                                <h2>Questions: {selectedExam.title}</h2>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className={adminStyles.addBtn} onClick={() => { setEditingQuestion(null); setQuestionForm({ ...INITIAL_QUESTION_FORM }); setShowQuestionModal(true); }}>
                                        <FontAwesomeIcon icon={faPlus} /> Add Question
                                    </button>
                                    <button className={adminStyles.addBtn} style={{ background: '#64748b' }} onClick={() => { setSelectedExam(null); setQuestions([]); }}>
                                        Back to Exams
                                    </button>
                                </div>
                            </div>
                            <div className={adminStyles.tableWrap}>
                                <table className={adminStyles.table}>
                                    <thead><tr><th>#</th><th>Question</th><th>Type</th><th>Answer</th><th>Marks</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {questions.map((q, idx) => (
                                            <tr key={q.question_id || idx}>
                                                <td>{q.question_order || idx + 1}</td>
                                                <td><div style={{ maxWidth: 300, wordBreak: 'break-word', fontWeight: 600 }}>{q.question_text}</div></td>
                                                <td><span className={`${adminStyles.badge} ${q.question_type === 'MCQ' ? adminStyles.roleInstructor : adminStyles.roleStudent}`}>{q.question_type}</span></td>
                                                <td><span style={{ fontWeight: 600, color: '#16a34a' }}>{q.correct_answer}</span></td>
                                                <td>{q.marks}</td>
                                                <td>
                                                    <div className={adminStyles.actions}>
                                                        <button className={adminStyles.actionBtn} onClick={() => openEditQuestion(q)} title="Edit"><FontAwesomeIcon icon={faEdit} /></button>
                                                        <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => handleDeleteQuestion(q.question_id)} title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {questions.length === 0 && <tr><td colSpan={6} className={adminStyles.emptyRow}>No questions yet. Add your first question.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={adminStyles.tableHeader}><h2>{exams.length} exam{exams.length !== 1 ? 's' : ''}</h2></div>
                            <div className={adminStyles.tableWrap}>
                                <table className={adminStyles.table}>
                                    <thead><tr><th>Title</th><th>Duration</th><th>Marks</th><th>Published</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {exams.map(e => (
                                            <tr key={e.exam_id}>
                                                <td><div style={{ fontWeight: 600 }}>{e.title}</div>{e.description && <div style={{ fontSize: 12, color: '#94a3b8' }}>{e.description.slice(0, 60)}{e.description.length > 60 ? '...' : ''}</div>}</td>
                                                <td>{e.duration_minutes} min</td>
                                                <td>{e.passing_marks}/{e.total_marks}</td>
                                                <td><span className={e.is_published ? adminStyles.statusActive : adminStyles.statusInactive}>{e.is_published ? 'Yes' : 'No'}</span></td>
                                                <td>
                                                    <div className={adminStyles.actions}>
                                                        <button className={adminStyles.actionBtn} onClick={() => fetchQuestions(e.exam_id)} title="Questions"><FontAwesomeIcon icon={faQuestionCircle} /></button>
                                                        <button className={adminStyles.actionBtn} onClick={() => openEditExam(e)} title="Edit"><FontAwesomeIcon icon={faEdit} /></button>
                                                        <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => handleDeleteExam(e.exam_id)} title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {exams.length === 0 && <tr><td colSpan={5} className={adminStyles.emptyRow}>No exams yet. Create your first exam.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'students' && (
                <div className={adminStyles.tableContainer}>
                    <div className={adminStyles.toolbar}>
                        <div className={adminStyles.formGroup} style={{ minWidth: 280 }}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faUserGraduate} /> Select Exam</label>
                            <select className={adminStyles.editSelect} value={selectedExamForStudents} onChange={e => { setSelectedExamForStudents(e.target.value); fetchStudents(e.target.value); }}>
                                <option value="">Choose an exam...</option>
                                {exams.map(exam => <option key={exam.exam_id} value={exam.exam_id}>{exam.title}</option>)}
                            </select>
                        </div>
                    </div>
                    {showStudentList && (
                        <div className={adminStyles.tableWrap}>
                            <table className={adminStyles.table}>
                                <thead><tr><th>Student Name</th><th>Email</th><th>Enrolled At</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.student_id}><td>{s.first_name} {s.last_name}</td><td>{s.email}</td><td>{new Date(s.enrolled_at).toLocaleDateString()}</td></tr>
                                    ))}
                                    {students.length === 0 && <tr><td colSpan={3} className={adminStyles.emptyRow}>No students enrolled yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showExamModal && (
                <div className={adminStyles.modalOverlay} onClick={() => setShowExamModal(false)}>
                    <div className={adminStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader}>
                            <h3 className={adminStyles.formTitle}><FontAwesomeIcon icon={faFileAlt} /> {editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
                            <button className={adminStyles.modalClose} onClick={() => setShowExamModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <form onSubmit={editingExam ? handleUpdateExam : handleCreateExam}>
                            <div className={adminStyles.formGroup}>
                                <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Exam Title</label>
                                <input placeholder="e.g. CS101 Midterm" value={examForm.title} onChange={e => setExamForm(p => ({ ...p, title: e.target.value }))} className={adminStyles.editInput} required maxLength={150} />
                            </div>
                            <div className={adminStyles.formGroup}>
                                <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Description</label>
                                <textarea placeholder="Brief description..." value={examForm.description} onChange={e => setExamForm(p => ({ ...p, description: e.target.value }))} className={adminStyles.editTextarea} rows={2} maxLength={500} />
                            </div>
                            <div className={adminStyles.formRow3}>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Course</label>
                                    <select value={examForm.course_id} onChange={e => setExamForm(p => ({ ...p, course_id: e.target.value }))} className={adminStyles.editSelect}>
                                        <option value="">No course</option>
                                        {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code} — {c.course_name}</option>)}
                                    </select>
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faClock} /> Duration (min)</label>
                                    <input type="number" value={examForm.duration_minutes} onChange={e => setExamForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} className={adminStyles.editInput} min="1" max="480" />
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faBullseye} /> Total Marks</label>
                                    <input type="number" value={examForm.total_marks} onChange={e => setExamForm(p => ({ ...p, total_marks: parseInt(e.target.value) || 100 }))} className={adminStyles.editInput} min="1" max="1000" />
                                </div>
                            </div>
                            <div className={adminStyles.formRow3}>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCheckCircle} /> Passing Marks</label>
                                    <input type="number" value={examForm.passing_marks} onChange={e => setExamForm(p => ({ ...p, passing_marks: parseInt(e.target.value) || 40 }))} className={adminStyles.editInput} min="1" max={examForm.total_marks || 100} />
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCalendarAlt} /> Start Time</label>
                                    <input type="datetime-local" value={examForm.start_time} onChange={e => setExamForm(p => ({ ...p, start_time: e.target.value }))} className={adminStyles.editInput} />
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCalendarAlt} /> End Time</label>
                                    <input type="datetime-local" value={examForm.end_time} onChange={e => setExamForm(p => ({ ...p, end_time: e.target.value }))} className={adminStyles.editInput} />
                                </div>
                            </div>
                            <label className={adminStyles.checkLabel}>
                                <input type="checkbox" checked={examForm.is_published} onChange={e => setExamForm(p => ({ ...p, is_published: e.target.checked }))} /> Publish immediately
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" className={adminStyles.submitBtn} disabled={examSubmitting}>{examSubmitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}</button>
                                <button type="button" className={adminStyles.addBtn} style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setShowExamModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showQuestionModal && (
                <div className={adminStyles.modalOverlay} onClick={() => setShowQuestionModal(false)}>
                    <div className={adminStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader}>
                            <h3 className={adminStyles.formTitle}><FontAwesomeIcon icon={faQuestionCircle} /> {editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <button className={adminStyles.modalClose} onClick={() => setShowQuestionModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}>
                            <div className={adminStyles.formGroup}>
                                <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faLayerGroup} /> Question Type</label>
                                <select value={questionForm.question_type} onChange={e => setQuestionForm(p => ({ ...p, question_type: e.target.value, options: ['', '', '', ''], correct_answer: '' }))} className={adminStyles.editSelect}>
                                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}</option>)}
                                </select>
                            </div>
                            <div className={adminStyles.formGroup}>
                                <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Question Text</label>
                                <textarea placeholder="Enter the question..." value={questionForm.question_text} onChange={e => setQuestionForm(p => ({ ...p, question_text: e.target.value }))} className={adminStyles.editTextarea} rows={3} maxLength={1000} required />
                            </div>
                            {questionForm.question_type === 'MCQ' && (
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faListOl} /> Answer Options</label>
                                    <div className={adminStyles.optionsGrid}>
                                        {questionForm.options.map((opt, i) => (
                                            <div key={i} className={adminStyles.optionRow}>
                                                <span className={adminStyles.optionLabel}>{String.fromCharCode(65 + i)}</span>
                                                <input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => updateOption(i, e.target.value)} className={adminStyles.editInput} maxLength={200} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className={adminStyles.formRow}>
                                <div className={adminStyles.formGroup}>
                                    <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faCheckCircle} /> Correct Answer {questionForm.question_type === 'MCQ' && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>(e.g. A, B, C, D)</span>}</label>
                                    <input placeholder={questionForm.question_type === 'MCQ' ? 'A' : 'Enter the correct answer'} value={questionForm.correct_answer} onChange={e => setQuestionForm(p => ({ ...p, correct_answer: e.target.value }))} className={adminStyles.editInput} maxLength={500} required />
                                </div>
                                <div className={adminStyles.formGroup} style={{ maxWidth: 140 }}>
                                    <label className={adminStyles.formLabel}>Marks</label>
                                    <input type="number" value={questionForm.marks} onChange={e => setQuestionForm(p => ({ ...p, marks: parseInt(e.target.value) || 1 }))} className={adminStyles.editInput} min="1" max="100" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" className={adminStyles.submitBtn} disabled={questionSubmitting}>{questionSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}</button>
                                <button type="button" className={adminStyles.addBtn} style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setShowQuestionModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstructorDashboard;