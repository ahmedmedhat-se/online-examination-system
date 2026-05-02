import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faBookOpen, faFileAlt, faSpinner, faSyncAlt,
    faClock, faClipboardCheck, faQuestionCircle,
    faPlus, faEdit, faTrash, faCheck, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';
import adminStyles from '../styles/AdminDashboard.module.css';

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
    const [showExamModal, setShowExamModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [examForm, setExamForm] = useState({
        title: '',
        description: '',
        duration_minutes: 60,
        total_marks: 100,
        passing_marks: 40,
        course_id: '',
        is_published: false
    });

    const [selectedExam, setSelectedExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionForm, setQuestionForm] = useState({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 1
    });

    const [students, setStudents] = useState([]);
    const [showStudentList, setShowStudentList] = useState(false);

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

            const exams = examsRes.data.success ? examsRes.data.data.exams || [] : [];
            const courses = coursesRes.data.success ? coursesRes.data.data.courses || [] : [];

            setExams(exams);
            setStats({
                totalExams: exams.length,
                totalCourses: courses.length,
                published: exams.filter(e => e.is_published).length,
                drafts: exams.filter(e => !e.is_published).length,
            });
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudents = async (examId) => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/instructor/exams/${examId}/students`);
            if (response.data.success) {
                setStudents(response.data.data.students || []);
                setShowStudentList(true);
            }
        } catch (err) {
            setError('Failed to load students list');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async (examId) => {
        if (!examId) {
            setError('Invalid exam ID');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.get(`/api/instructor/exams/${examId}/questions`);
            if (response.data.success) {
                setQuestions(response.data.data.questions || []);
                const exam = exams.find(e => e.exam_id === parseInt(examId));
                setSelectedExam(exam);
            }
        } catch (err) {
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiClient.post('/api/instructor/exams', examForm);
            if (response.data.success) {
                setSuccess('Exam created successfully!');
                setShowExamModal(false);
                resetExamForm();
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exam');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateExam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiClient.put(`/api/instructor/exams/${editingExam.exam_id}`, examForm);
            if (response.data.success) {
                setSuccess('Exam updated successfully!');
                setShowExamModal(false);
                resetExamForm();
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update exam');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;

        setLoading(true);
        try {
            const response = await apiClient.delete(`/api/instructor/exams/${examId}`);
            if (response.data.success) {
                setSuccess('Exam deleted successfully');
                if (selectedExam && selectedExam.exam_id === examId) {
                    setSelectedExam(null);
                    setQuestions([]);
                }
                fetchData();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete exam');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiClient.post(`/api/instructor/exams/${selectedExam.exam_id}/questions`, questionForm);
            if (response.data.success) {
                setSuccess('Question added successfully!');
                setShowQuestionModal(false);
                resetQuestionForm();
                fetchQuestions(selectedExam.exam_id);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add question');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiClient.put(`/api/instructor/questions/${editingQuestion.question_id}`, questionForm);
            if (response.data.success) {
                setSuccess('Question updated successfully!');
                setShowQuestionModal(false);
                resetQuestionForm();
                fetchQuestions(selectedExam.exam_id);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update question');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        setLoading(true);
        try {
            const response = await apiClient.delete(`/api/instructor/questions/${questionId}`);
            if (response.data.success) {
                setSuccess('Question deleted successfully');
                fetchQuestions(selectedExam.exam_id);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete question');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const resetExamForm = () => {
        setExamForm({
            title: '',
            description: '',
            duration_minutes: 60,
            total_marks: 100,
            passing_marks: 40,
            course_id: '',
            is_published: false
        });
        setEditingExam(null);
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            question_text: '',
            question_type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: '',
            marks: 1
        });
        setEditingQuestion(null);
    };

    const openEditExam = (exam) => {
        setEditingExam(exam);
        setExamForm({
            title: exam.title,
            description: exam.description || '',
            duration_minutes: exam.duration_minutes,
            total_marks: exam.total_marks,
            passing_marks: exam.passing_marks,
            course_id: exam.course_id || '',
            is_published: exam.is_published
        });
        setShowExamModal(true);
    };

    const openEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionForm({
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options || ['', '', '', ''],
            correct_answer: question.correct_answer,
            marks: question.marks
        });
        setShowQuestionModal(true);
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        }
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'exams', 'students'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'overview' ? {} : { tab });
    };

    const firstName = user?.first_name || 'Instructor';

    const tabs = [
        { key: 'overview', label: 'Overview', icon: faClipboardCheck },
        { key: 'exams', label: 'Exams', icon: faFileAlt },
        { key: 'students', label: 'Students', icon: faUserGraduate },
    ];

    if (loading) {
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

            {error && <div className={`${adminStyles.toast} ${adminStyles.toastError}`}>{error}</div>}
            {success && <div className={`${adminStyles.toast} ${adminStyles.toastSuccess}`}>{success}</div>}

            <div className={adminStyles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`${adminStyles.tab} ${activeTab === tab.key ? adminStyles.tabActive : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalExams}</span>
                            <span className={styles.statLabel}>Total Exams</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.published}</span>
                            <span className={styles.statLabel}>Published</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <FontAwesomeIcon icon={faBookOpen} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalCourses}</span>
                            <span className={styles.statLabel}>Courses</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.drafts}</span>
                            <span className={styles.statLabel}>Drafts</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'exams' && (
                <div className={adminStyles.section}>
                    <div className={adminStyles.sectionHeader}>
                        <h2>My Exams</h2>
                        <button
                            className={adminStyles.primaryBtn}
                            onClick={() => setShowExamModal(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Create New Exam
                        </button>
                    </div>

                    <div className={adminStyles.examsGrid}>
                        {exams.length === 0 ? (
                            <div className={adminStyles.emptyState}>
                                <p>No exams created yet. Click "Create New Exam" to get started.</p>
                            </div>
                        ) : (
                            exams.map(exam => (
                                <div key={exam.exam_id} className={adminStyles.examCard}>
                                    <div className={adminStyles.examHeader}>
                                        <h3>{exam.title}</h3>
                                        <div className={adminStyles.badgeGroup}>
                                            {exam.is_published ? (
                                                <span className={`${adminStyles.badge} ${adminStyles.badgeSuccess}`}>
                                                    <FontAwesomeIcon icon={faCheck} /> Published
                                                </span>
                                            ) : (
                                                <span className={`${adminStyles.badge} ${adminStyles.badgeSecondary}`}>Draft</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className={adminStyles.examDescription}>{exam.description}</p>
                                    <div className={adminStyles.examMeta}>
                                        <span>{exam.duration_minutes} min</span>
                                        <span>{exam.total_marks} marks</span>
                                        <span>{exam.passing_marks} to pass</span>
                                    </div>
                                    <div className={adminStyles.examActions}>
                                        <button
                                            className={adminStyles.iconBtn}
                                            onClick={() => fetchQuestions(exam.exam_id)}
                                        >
                                            <FontAwesomeIcon icon={faQuestionCircle} /> Questions
                                        </button>
                                        <button
                                            className={adminStyles.iconBtn}
                                            onClick={() => fetchStudents(exam.exam_id)}
                                        >
                                            <FontAwesomeIcon icon={faUsers} /> Students
                                        </button>
                                        <button
                                            className={adminStyles.iconBtn}
                                            onClick={() => openEditExam(exam)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className={`${adminStyles.iconBtn} ${adminStyles.dangerBtn}`}
                                            onClick={() => handleDeleteExam(exam.exam_id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedExam && (
                        <div className={adminStyles.questionsSection}>
                            <div className={adminStyles.sectionHeader}>
                                <h3>Questions for: {selectedExam.title}</h3>
                                <button
                                    className={adminStyles.primaryBtn}
                                    onClick={() => setShowQuestionModal(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add Question
                                </button>
                                <button
                                    className={adminStyles.secondaryBtn}
                                    onClick={() => {
                                        setSelectedExam(null);
                                        setQuestions([]);
                                    }}
                                >
                                    Back to Exams
                                </button>
                            </div>

                            <div className={adminStyles.questionsList}>
                                {questions.length === 0 ? (
                                    <div className={adminStyles.emptyState}>
                                        <p>No questions added yet. Click "Add Question" to create one.</p>
                                    </div>
                                ) : (
                                    questions.map((q, idx) => (
                                        <div key={q.question_id || idx} className={adminStyles.questionCard}>
                                            <div className={adminStyles.questionHeader}>
                                                <strong>Q{idx + 1}: {q.question_text}</strong>
                                                <div className={adminStyles.questionActions}>
                                                    <button onClick={() => openEditQuestion(q)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button onClick={() => handleDeleteQuestion(q.question_id)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={adminStyles.questionType}>
                                                Type: {q.question_type.replace('_', ' ')}
                                            </div>
                                            {q.options && q.options.length > 0 && (
                                                <div className={adminStyles.questionOptions}>
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className={adminStyles.option}>
                                                            {String.fromCharCode(65 + i)}. {opt}
                                                            {q.correct_answer === opt &&
                                                                <FontAwesomeIcon icon={faCheck} className={adminStyles.correctIcon} />
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className={adminStyles.questionMeta}>
                                                <span>Marks: {q.marks}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'students' && (
                <div className={adminStyles.section}>
                    <div className={adminStyles.sectionHeader}>
                        <h2>Student Overview</h2>
                        <p className={adminStyles.sectionDesc}>View all students enrolled in your exams (Read-only access)</p>
                    </div>

                    <div className={adminStyles.studentFilters}>
                        <select
                            className={adminStyles.select}
                            onChange={(e) => fetchStudents(e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Select an exam to view students</option>
                            {exams.map(exam => (
                                <option key={exam.exam_id} value={exam.exam_id}>
                                    {exam.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showStudentList && students.length > 0 && (
                        <div className={adminStyles.studentsTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Enrolled At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.student_id}>
                                            <td>{student.first_name} {student.last_name}</td>
                                            <td>{student.email}</td>
                                            <td>{new Date(student.enrolled_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showStudentList && students.length === 0 && (
                        <div className={adminStyles.emptyState}>
                            <FontAwesomeIcon icon={faUsers} />
                            <p>No students have enrolled in this exam yet.</p>
                        </div>
                    )}
                </div>
            )}

            {showExamModal && (
                <div className={adminStyles.modal} onClick={() => setShowExamModal(false)}>
                    <div className={adminStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader}>
                            <h2>{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
                            <button onClick={() => setShowExamModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={editingExam ? handleUpdateExam : handleCreateExam}>
                            <div className={adminStyles.formGroup}>
                                <label>Exam Title *</label>
                                <input
                                    type="text"
                                    value={examForm.title}
                                    onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={adminStyles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={examForm.description}
                                    onChange={e => setExamForm({ ...examForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className={adminStyles.formRow}>
                                <div className={adminStyles.formGroup}>
                                    <label>Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        value={examForm.duration_minutes}
                                        onChange={e => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label>Total Marks *</label>
                                    <input
                                        type="number"
                                        value={examForm.total_marks}
                                        onChange={e => setExamForm({ ...examForm, total_marks: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label>Passing Marks *</label>
                                    <input
                                        type="number"
                                        value={examForm.passing_marks}
                                        onChange={e => setExamForm({ ...examForm, passing_marks: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={adminStyles.formGroup}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={examForm.is_published}
                                        onChange={e => setExamForm({ ...examForm, is_published: e.target.checked })}
                                    />
                                    Publish Exam
                                </label>
                            </div>
                            <div className={adminStyles.modalActions}>
                                <button type="button" onClick={() => setShowExamModal(false)}>Cancel</button>
                                <button type="submit">{editingExam ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showQuestionModal && (
                <div className={adminStyles.modal} onClick={() => setShowQuestionModal(false)}>
                    <div className={adminStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader}>
                            <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
                            <button onClick={() => setShowQuestionModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}>
                            <div className={adminStyles.formGroup}>
                                <label>Question Text *</label>
                                <textarea
                                    value={questionForm.question_text}
                                    onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className={adminStyles.formRow}>
                                <div className={adminStyles.formGroup}>
                                    <label>Question Type *</label>
                                    <select
                                        value={questionForm.question_type}
                                        onChange={e => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                                    >
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="true_false">True/False</option>
                                        <option value="short_answer">Short Answer</option>
                                    </select>
                                </div>
                                <div className={adminStyles.formGroup}>
                                    <label>Marks *</label>
                                    <input
                                        type="number"
                                        value={questionForm.marks}
                                        onChange={e => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            {questionForm.question_type === 'multiple_choice' && (
                                <div className={adminStyles.formGroup}>
                                    <label>Options *</label>
                                    {questionForm.options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                            value={opt}
                                            onChange={e => {
                                                const newOptions = [...questionForm.options];
                                                newOptions[idx] = e.target.value;
                                                setQuestionForm({ ...questionForm, options: newOptions });
                                            }}
                                            required
                                        />
                                    ))}
                                </div>
                            )}
                            <div className={adminStyles.formGroup}>
                                <label>Correct Answer *</label>
                                {questionForm.question_type === 'multiple_choice' ? (
                                    <select
                                        value={questionForm.correct_answer}
                                        onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                                        required
                                    >
                                        <option value="">Select correct answer</option>
                                        {questionForm.options.map((opt, idx) => (
                                            <option key={idx} value={opt}>
                                                {String.fromCharCode(65 + idx)}. {opt || `Option ${String.fromCharCode(65 + idx)}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={questionForm.correct_answer}
                                        onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                                        placeholder="Enter correct answer"
                                        required
                                    />
                                )}
                            </div>
                            <div className={adminStyles.modalActions}>
                                <button type="button" onClick={() => setShowQuestionModal(false)}>Cancel</button>
                                <button type="submit">{editingQuestion ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstructorDashboard;