import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUsers, faClipboardCheck, faClock, faArrowRight, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';

function InstructorDashboard() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        abortRef.current = new AbortController();

        try {
            const [profileRes, examsRes, coursesRes] = await Promise.all([
                apiClient.get('/api/instructor/profile', { signal: abortRef.current.signal }),
                apiClient.get('/api/instructor/exams', { signal: abortRef.current.signal }),
                apiClient.get('/api/instructor/courses', { signal: abortRef.current.signal }),
            ]);

            if (profileRes.data.success) setProfile(profileRes.data.data.instructor);
            if (examsRes.data.success) setExams(examsRes.data.data.exams || []);
            if (coursesRes.data.success) setCourses(coursesRes.data.data.courses || []);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData]);

    const firstName = user?.first_name || profile?.first_name || 'Instructor';
    const publishedExams = exams.filter(e => e.is_published);
    const draftExams = exams.filter(e => !e.is_published);
    const courseCount = courses.length;

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                <span>Loading your dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <FontAwesomeIcon icon={faTriangleExclamation} className={styles.errorIcon} />
                <span>{error}</span>
                <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Welcome back, Dr. {firstName}!</h1>
                <p className={styles.subtitle}>Manage your exams and monitor student progress.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{exams.length}</span>
                        <span className={styles.statLabel}>Total Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{courseCount}</span>
                        <span className={styles.statLabel}>Courses</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faClipboardCheck} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{publishedExams.length}</span>
                        <span className={styles.statLabel}>Published</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{draftExams.length}</span>
                        <span className={styles.statLabel}>Drafts</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Your Exams</h2>
                    <Link to="/exams/manage" className={styles.sectionLink}>
                        Manage All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                {exams.length === 0 ? (
                    <div className={styles.emptyState}>No exams yet. Create your first exam to get started.</div>
                ) : (
                    <div className={styles.cardGrid}>
                        {exams.slice(0, 6).map((exam) => (
                            <div key={exam.exam_id} className={styles.infoCard}>
                                <h3 className={styles.infoCardTitle}>{exam.title}</h3>
                                <p className={styles.infoCardDesc}>
                                    {exam.course_name}{exam.category_name ? ` — ${exam.category_name}` : ''}
                                </p>
                                <div className={styles.infoCardMeta}>
                                    <span className={`${styles.badge} ${exam.is_published ? styles.badgeGreen : styles.badgeAmber}`}>
                                        {exam.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    <span>{exam.duration_minutes} min</span>
                                    <span>{exam.total_marks} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Your Courses</h2>
                </div>
                {courses.length === 0 ? (
                    <div className={styles.emptyState}>No courses assigned yet.</div>
                ) : (
                    <div className={styles.cardGrid}>
                        {courses.map((course) => (
                            <Link to={`/courses/${course.course_id}`} key={course.course_id} className={styles.infoCard} style={{ textDecoration: 'none' }}>
                                <h3 className={styles.infoCardTitle}>{course.course_name}</h3>
                                <p className={styles.infoCardDesc}>{course.description || 'No description available.'}</p>
                                <div className={styles.infoCardMeta}>
                                    <span className={`${styles.badge} ${styles.badgeBlue}`}>{course.course_code}</span>
                                    <span>{course.credit_hours} credit hrs</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InstructorDashboard;